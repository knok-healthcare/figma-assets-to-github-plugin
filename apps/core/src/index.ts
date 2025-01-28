/// <reference types="@figma/plugin-typings" />
// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)

import type { ClientStorage } from '../../../types'
import type { PostMessageEvent } from './types/events'

import { getStoredValues } from './utils/figma'
import PluginConfig from './config/plugin'

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
        type: board.type
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
}

/** Handles the assets export action */
async function exportAssets(data: ClientStorage) {
  try {
    console.log('export assets', data)

    figma.ui.postMessage({
      event: 'export-completed',
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
  }
}
