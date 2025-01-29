/// <reference types="@figma/plugin-typings" />
// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)
import type { PostMessageEvent } from './types/events'

import { getStoredConfigs, setStoredConfigs } from './utils/figma'
import PluginConfig from './config/plugin'
import type { PluginConfig as PluginConfigType } from '../../../types'
import { checkRequiredDataForExport } from './utils/validators'
import { useVueExtractor } from '@packages/vue-extractor'
import GithubConnector from '@packages/github-connector'

// Only proceeds to "mount" the plugin after necessary data has been retrieved
getStoredConfigs().then(storage => {
  // Register handler for post message event
  figma.ui.onmessage = onMessageEvent

  // Render the UI from the plugin
  figma.showUI(__html__, PluginConfig.window)

  // Send the client settings to the rendered UI
  figma.ui.postMessage({
    event: 'initial-data',
    storage,
    currentPage: {
      id: figma.currentPage.id,
      name: figma.currentPage.name,
      children: figma.currentPage.children.map(board => ({
        id: board.id,
        name: board.name,
        type: board.type,
      })),
      parent: {
        children: figma.currentPage.parent?.children.map(page => ({
          id: page.id,
          name: page.name,
          children: (page as unknown as PageNode).children
            .filter(child => child.type === 'COMPONENT' || child.type === 'COMPONENT_SET')
            .map((board: ComponentNode | ComponentSetNode) => ({
              id: board.id,
              name: board.name,
              type: board.type,
            })),
        })),
      },
    },
  })
})

/** Handles a postMessage event sent from the UI */
async function onMessageEvent(payload: PostMessageEvent) {
  if (payload.event === 'update-plugin-configs') {
    if (!payload.value) {
      const error = 'Missing required "value" property for event "update-plugin-configs".'
      throw new Error(error)
    }

    return await setStoredConfigs(payload.value as string)
  }

  if (payload.event === 'get-properties-from-page') {
    if (!payload.pageId) {
      const error =
        'Missing required "pageId" property for event "get-properties-from-page".'
      throw new Error(error)
    }

    const page = figma.currentPage.parent?.children.find(
      page => page.id === payload.pageId
    )
    if (!page) throw new Error('Page not found')

    const allProperties = [] as ComponentPropertyDefinitions[]
    const assets = page.children.filter(child => child.type === 'COMPONENT_SET')

    assets.forEach((asset: ComponentSetNode) => {
      try {
        const properties = asset.componentPropertyDefinitions
        allProperties.push(properties)
      } catch (error) {
        // prevent breaking main thread
        console.log('error getting properties from asset', asset.name, ' error: ', error)
      }
    })

    const mergedProperties = allProperties.reduce((acc, item) => {
      for (const [key, value] of Object.entries(item)) {
        if (!acc[key.toLowerCase()]) {
          acc[key.toLowerCase()] = {
            variantOptions: [],
            defaultValue: value.defaultValue,
          }
        }
        acc[key.toLowerCase()].variantOptions = [
          ...new Set([...acc[key.toLowerCase()].variantOptions, ...value.variantOptions]),
        ]
      }
      return acc
    }, {})

    figma.ui.postMessage({
      event: 'available-properties',
      properties: mergedProperties,
    })
  }

  if (payload.event === 'export-assets') {
    console.log('got export assets eevent', payload)
    if (!payload.data) {
      const error = 'Missing required "data" property for event "export-assets".'
      console.log(error)
      return
    }

    return await exportAssets(JSON.parse(payload.data))
  }
}

/** Handles the assets export action */
async function exportAssets(data: PluginConfigType) {
  try {
    // Make sure all necessary data was filled otherwise it throws
    checkRequiredDataForExport(data)

    // Retrieve components from figma
    const components = [] as {
      name: string
      component: ComponentSetNode
      variants: ComponentNode[]
      properties: ComponentPropertyDefinitions
    }[]

    data.settings.figma.assetIds.forEach(assetId => {
      const page = figma.currentPage.parent?.children.find(
        page => page.id === data.settings.figma.pageId
      ) as unknown as PageNode
      if (!page) throw new Error('Specified page not found')

      const component = page.children.find(
        child => child.id === assetId
      ) as ComponentSetNode

      if (component) {
        try {
          const variants = component.children.filter(variant => {
            const typeIsValid = variant.type === 'COMPONENT'
            if (!typeIsValid) return false

            const variantProps = variant.variantProperties
            if (variantProps === null) return false

            // checks that the component matches the options selected in
            // the data.settings.code.properties[x].options
            return Object.keys(variantProps).every(variantPropName => {
              const variantPropValue = variantProps[variantPropName]

              return (
                data.settings.code.properties[variantPropName.toLowerCase()] &&
                data.settings.code.properties[
                  variantPropName.toLowerCase()
                ].options.includes(variantPropValue)
              )
            })
          }) as ComponentNode[]

          const componentProperties = {} as ComponentPropertyDefinitions
          Object.keys(component.componentPropertyDefinitions).forEach(prop => {
            const propName = prop.toLowerCase()
            const overrideDefaultValue =
              data.settings.code.properties[propName].defaultValue?.toString() || ''

            const defaultValue = component.componentPropertyDefinitions[
              prop
            ].variantOptions?.includes(overrideDefaultValue)
              ? data.settings.code.properties[propName].defaultValue?.toString() || ''
              : component.componentPropertyDefinitions[prop].defaultValue

            const variantOptions = data.settings.code.properties[propName].options.filter(
              option => {
                const propDefinition =
                  component.componentPropertyDefinitions as ComponentPropertyDefinitions
                return propDefinition[prop]?.variantOptions?.includes(option)
              }
            )

            componentProperties[propName] = {
              defaultValue,
              type: component.componentPropertyDefinitions[prop].type,
              variantOptions,
            }
          })

          components.push({
            name:
              data.settings.export.prefixToAdd +
              component.name
                .replace(new RegExp(`^${data.settings.export.prefixToRemove}`), '')
                .replace(new RegExp(`${data.settings.export.suffixToRemove}$`), '')
                .replaceAll(' ', '')
                .replaceAll('-', '')
                .replaceAll('_', '')
                .replaceAll('.', '')
                .replaceAll('/', '') +
              data.settings.export.suffixToAdd,
            component,
            variants,
            properties: componentProperties,
          })
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
        }
      }
    })

    console.log('components', components)

    // Component extraction process
    let files = {} as Record<string, string>

    if (data.settings.code.format === 'Vue') {
      files = await useVueExtractor(components)
    } else {
      throw new Error('Format not supported yet.')
    }

    // Github export process
    const repository = data.settings.github.repository
    const repositoryOwner = repository.split('/')[0]
    const repositoryName = repository.split('/')[1]

    const github = new GithubConnector({
      repositoryOwner,
      repositoryName,
      accessToken: data.settings.github.accessToken,
    })

    await github.exportFiles({
      baseBranchName: data.settings.github.branch,
      headBranchName: PluginConfig.github.headBranch,
      defaultExportsFile: data.settings.export.defaultExportsFile,
      components: files,
      extension: data.settings.code.format.toLowerCase(),
      commitMessage: PluginConfig.github.commitMessage,
      destinationFolder: data.settings.github.path
    })

    figma.ui.postMessage({
      event: 'export-completed',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}
