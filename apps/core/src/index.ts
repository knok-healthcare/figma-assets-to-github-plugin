/// <reference types="@figma/plugin-typings" />
// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)

import type { ClientStorage } from '../../../types'
import type { PostMessageEvent } from './types/events'

import { getStoredValues, getComponentsByPageAndBoardId } from './utils/figma'
import { checkRequiredDataForExport } from './utils/validators'
import PluginConfig from './config/plugin'
import SvgExtractor from '@packages/svg-extractor'
import VueExtractor from '@packages/vue-extractor'
import GithubConnector from '@packages/github-connector'

// Only proceeds to "mount" the plugin after necessary data has been retrieved
getStoredValues().then(storage => {
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
      })),
      parent: {
        children: figma.currentPage.parent?.children.map(page => ({
          id: page.id,
          name: page.name,
          children: (page as unknown as PageNode).children.map(board => ({
            id: board.id,
            name: board.name,
          })),
        })),
      },
    },
  })
})

/** Handles a postMessage event sent from the UI */
async function onMessageEvent(payload: PostMessageEvent) {
  if (payload.event === 'update-client-storage-field') {
    if (!payload.field) {
      const error =
        'Missing required "field" property for event "update-client-storage-field".'
      throw new Error(error)
    }

    return await figma.clientStorage.setAsync(payload.field, payload.value)
  }

  if (payload.event === 'export-assets') {
    if (!payload.data) {
      const error = 'Missing required "data" property for event "export-assets".'
      throw new Error(error)
    }

    return await exportAssets(payload.data)
  }

  if (payload.event === 'get-available-props') {
    if (!payload.data) {
      const error = 'Missing required "data" property for event "export-assets".'
      throw new Error(error)
    }

    return emitAvailableProps(payload.data)
  }
}

/** Handles the assets export action */
async function exportAssets(data: ClientStorage) {
  try {
    // Make sure all necessary data was filled otherwise it throws
    checkRequiredDataForExport(data)

    // Get all figma components
    const ltrFigmaComponents: ComponentNode[] = getComponentsByPageAndBoardId(
      data.selectedPageId,
      data.selectedBoardId
    )

    let rtlVariants: ComponentNode[] = []
    if (data.rtlEnabled && data.exportFormat !== 'SVG') {
      rtlVariants = getComponentsByPageAndBoardId(
        data.selectedRTLPageId,
        data.selectedRTLBoardId
      )
    }

    // Build final object with all components to export to Github
    let exportableComponents: Record<string, string> = {}

    if (data.exportFormat === 'SVG') {
      exportableComponents = await SvgExtractor.extract(ltrFigmaComponents)
    } else if (data.exportFormat === 'Vue') {
      exportableComponents = await VueExtractor.extract(ltrFigmaComponents, rtlVariants, data.propOverrides)
    }

    // Add suffix to every file name
    if (data.fileSuffix) {
      exportableComponents = Object.fromEntries(
        Object.entries(exportableComponents).map(([key, value]) =>
          // Modify key here
          [`${key}${data.fileSuffix}`, value]
        )
      )
    }

    const createDefaultExportsFile =
      data.createDefaultExportsJsFile || data.createDefaultExportsTsFile

    // Export the components
    const github = new GithubConnector({
      repositoryOwner: data.repositoryOwner,
      repositoryName: data.repositoryName,
      accessToken: data.accessToken,
    })

    await github.exportFiles({
      baseBranchName: data.targetBranch,
      headBranchName: PluginConfig.github.headBranch,
      createDefaultExportsFile,
      components: exportableComponents,
      extension: data.exportFormat === 'SVG' ? 'svg' : 'vue',
      commitMessage: PluginConfig.github.commitMessage,
      destinationFolder: data.destinationFolder,
      defaultExportsFileExtension: data.createDefaultExportsJsFile ? 'js' : 'ts',
    })

    figma.ui.postMessage({
      event: 'export-completed',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}

function emitAvailableProps(data: ClientStorage) {
  if (!data.selectedPageId || !data.selectedBoardId) {
    data.selectedPageId = figma.currentPage.id
    data.selectedBoardId = figma.currentPage.children[0]?.id
  }

  const ltrFigmaComponents: ComponentNode[] = getComponentsByPageAndBoardId(
    data.selectedPageId,
    data.selectedBoardId
  )

  let rtlVariants: ComponentNode[] = []
  if (data.rtlEnabled && data.exportFormat !== 'SVG') {
    rtlVariants = getComponentsByPageAndBoardId(
      data.selectedRTLPageId,
      data.selectedRTLBoardId
    )
  }

  const props = VueExtractor.extractComponentProps(
    [...ltrFigmaComponents, ...rtlVariants],
    false,
    data.propOverrides,
    false
  )

  figma.ui.postMessage({
    event: 'available-props',
    props,
  })
}
