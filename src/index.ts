// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)

(async () => {
  const exportFormat =
    (await figma.clientStorage.getAsync("export-format")) || "default";
  const destinationFolder =
    (await figma.clientStorage.getAsync("destination-folder")) || "";
  const rtlEnabled =
    (await figma.clientStorage.getAsync("rtl-enabled")) || false;
  const repositoryOwner =
    (await figma.clientStorage.getAsync("repository-owner")) || "";
  const repositoryName =
    (await figma.clientStorage.getAsync("repository-name")) || "";
  const githubAccessToken =
    (await figma.clientStorage.getAsync("github-access-token")) || "";

  // Renders the HTML UI file defined in `manifest.json`.
  figma.showUI(__html__, {
    title: "Export assets to Github",
    width: 550,
    height: 400,
  });

  figma.ui.postMessage({
    storage: {
      exportFormat,
      destinationFolder,
      rtlEnabled,
      repositoryOwner,
      repositoryName,
      githubAccessToken,
    },
  });
})();

// Waits for any message sent by the UI file
figma.ui.onmessage = async (payload) => {
  if (payload.event === "persist-to-storage") {
    return await persistValueToStorage({
      field: payload.field,
      value: payload.value,
    });
  }

  if (payload.event === "export-assets") {
    return await exportAssetsHandler(payload);
  }
};

async function persistValueToStorage({ field, value }: any) {
  await figma.clientStorage.setAsync(field, value);
}

async function exportAssetsHandler(payload: any) {
  /// @TODO: Before running the following logic validate
  ///        if all fields in the UI are filled and valid

  const panels = figma.currentPage.children as ComponentSetNode[];

  for (let i = 0; i < panels.length; i++) {
    const panel = panels[i];
    for (let j = 0; j < panel.children.length; j++) {
      const component = panel.children[j] as ComponentNode;
      const svgString = await component.exportAsync({
        format: "SVG_STRING",
      });
      console.log(svgString);

      /// @TODO: If setting `export-format` is configured as `SVG` then:
      /// adds the svgs directly to an array and after array is full
      /// creates the PR in Github with all the icons as SVG

      /// otherwise, if `export-format` is configured as `Vue` then:

      /// @TODO: Build an array of ExportableComponent objects
      /// each ExportableComponent should have all the svg codes
      /// for the multiple variants defined in figma
      /// (different sizes (16px, 20px, 24px, 32px) and types (filled, outlined) of the same component)
      ///
      /// after all icons are properly grouped in an object:
      /// create the PR in Github with all the icons as Vue components
      /// @note: for now only Vue components are supported (in the future new frameworks might be introduced).
    }
  }

  figma.closePlugin();
}
