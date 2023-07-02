/// <reference types="@figma/plugin-typings" />
// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)

import { getStorage, persistValueToStorage } from "./utils/figma";
import exportAssetsHandler from "./handlers/onExportAssetsEvent";

figma.ui.onmessage = async (payload) => {
  if (payload.event === "update-client-storage-field") {
    return await persistValueToStorage({
      field: payload.field,
      value: payload.value,
    });
  }

  if (payload.event === "export-assets") {
    return await exportAssetsHandler(payload.data);
  }
};

(async () => {
  // Renders the HTML UI file defined in `manifest.json`.
  figma.showUI(__html__, {
    title: "Export assets to Github",
    width: 550,
    height: 400,
  });

  figma.ui.postMessage({
    storage: await getStorage(),
  });
})();
