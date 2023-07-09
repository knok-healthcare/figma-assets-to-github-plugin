/// <reference types="@figma/plugin-typings" />
// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)

import type { ClientStorage } from "./types/storage";
import type { PostMessageEvent } from "./types/events";

import {
  getStoredValues,
  getComponentsByPanelIds,
  getAllComponents,
} from "./utils/figma";
import { checkRequiredDataForExport } from "./utils/validators";
import PluginConfig from "./config/plugin";
import SvgExtractor from "@packages/svg-extractor";
import VueExtractor from "@packages/vue-extractor";
import GithubConnector from "@packages/github-connector";

// Only proceeds to "mount" the plugin after necessary data has been retrieved
getStoredValues().then((storage) => {
  // Register handler for post message event
  figma.ui.onmessage = onMessageEvent;

  // Render the UI from the plugin
  figma.showUI(__html__, PluginConfig.window);

  // Send the client settings to the rendered UI
  figma.ui.postMessage({ storage });
});

/** Handles a postMessage event sent from the UI */
async function onMessageEvent(payload: PostMessageEvent) {
  if (payload.event === "update-client-storage-field") {
    if (!payload.field) {
      const error = `Missing required "field" property for event "update-client-storage-field".`;
      throw new Error(error);
    }

    return await figma.clientStorage.setAsync(payload.field, payload.value);
  }

  if (payload.event === "export-assets") {
    if (!payload.data) {
      const error = `Missing required "data" property for event "export-assets".`;
      throw new Error(error);
    }

    return await exportAssets(payload.data);
  }
}

/** Handles the assets export action */
async function exportAssets(data: ClientStorage) {
  try {
    // Make sure all necessary data was filled otherwise it throws
    checkRequiredDataForExport(data);

    // Get all figma components
    let figmaComponents;
    if (!data.selectedBoardId) figmaComponents = getAllComponents();
    else {
      figmaComponents = data.rtlEnabled
        ? getComponentsByPanelIds([
            data.selectedBoardId,
            data.selectedRTLBoardId,
          ])
        : getComponentsByPanelIds([data.selectedBoardId]);
    }

    // Build final object with all components to export to Github
    let exportableComponents: Record<string, string> = {};

    if (data.exportFormat === "SVG") {
      exportableComponents = await SvgExtractor.extract(figmaComponents);
    } else if (data.exportFormat === "Vue") {
      exportableComponents = await VueExtractor.extract(figmaComponents);
    }

    // Export the components
    const github = new GithubConnector({
      repositoryOwner: data.repositoryOwner,
      repositoryName: data.repositoryName,
      accessToken: data.accessToken,
    });

    await github.exportFiles({
      baseBranchName: "main",
      headBranchName: data.targetBranch,
      components: exportableComponents,
      extension: data.exportFormat === "SVG" ? "svg" : "vue",
      destinationFolder: data.destinationFolder,
    });
  } catch (error) {
    console.error(error);
  }
}
