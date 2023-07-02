import type { ClientStorage } from "../../types/ClientStorage";
import {
  getComponentName,
  getComponentProps,
  getSFCs,
} from "../generators/vue";
import {
  componentPropertiesAsConditionString,
  exportComponentAsSVG,
  filterComponentProperties,
  getAvailablePanels,
  getComponentsFromPanel,
} from "../utils/figma";
import { hasRequiredDataForExport } from "../utils/validators";

export default async (data: ClientStorage) => {
  try {
    hasRequiredDataForExport(data);

    // @TODO: Refactor this code later, consider this as a draft
    let componentsToExport = {} as any;

    const panels = getAvailablePanels();
    figma.currentPage.children as ComponentSetNode[];

    // @TODO: Instead of going to all panels
    // go specifically to the panels selected in the UI
    for (let i = 0; i < panels.length; i++) {
      const panel = panels[i];
      const components = getComponentsFromPanel(panel);

      for (let j = 0; j < components.length; j++) {
        const component = panel.children[j] as ComponentNode;
        const svgString = await exportComponentAsSVG(component);

        if (!component.variantProperties || data.exportFormat === "SVG") {
          const componentName = getComponentName(component.name);
          componentsToExport[componentName] = {
            code: svgString,
          };
        } else {
          // has variant properties and is exporting as vue component
          const properties = filterComponentProperties(
            component.variantProperties
          );
          const condition = componentPropertiesAsConditionString(properties);

          const componentName = getComponentName(
            component.variantProperties["Name"]
          );

          if (!componentsToExport[componentName]) {
            componentsToExport[componentName] = {
              code: svgString.replace("<svg", `<svg v-if="${condition}" `),
              props: getComponentProps({}, properties),
            };
          } else {
            componentsToExport[componentName].code +=
              "\n" +
              svgString.replace("<svg", `<svg v-else-if="${condition}" `);

            componentsToExport[componentName].props = getComponentProps(
              componentsToExport[componentName].props,
              properties
            );
          }
        }
      }
    }

    if (data.exportFormat === "Vue") {
      componentsToExport = getSFCs(componentsToExport);
    }

    // @TODO: Open pull request in the Github repository configured through the UI
    // (this part can be a specific package "packages/github-connetor")
    console.log(componentsToExport);
  } finally {
    figma.closePlugin();
  }
};
