// ~~~ Figma Assets to Github Plugin ~~~
// Plugin that searches for all assets (components) inside the
// currently opened figma page and exports them to a Github repository via pull request.

// This file holds the main bootstrapping logic for the plugin.
// (Note: Any logic that depends on browser API's should be placed in the UI files and not here.)

type ExportableComponent = {
  /** The final name of the component that will be exported */
  name: string;
  /** The default component svg code */
  default: string;
  /** A variant is a component property defined in figma (e.g. Size or Type) */
  [variant: string]: string;
};

type SavableValue = {
  field: string;
  value: any;
};

type ExportActionPayload = {
  exportFormat: string;
  figmaBoard: string;
  rtlEnabled: boolean;
  figmaRTLBoard: string;
  repositoryOwner: string;
  repositoryName: string;
  destinationFolder: string;
  githubAccessToken: string;
};

type VueProp = {
  possibleValues: string[];
  defaultValue: any;
};

type VuePropMap = {
  [propName: string]: VueProp;
};

const validators = {
  hasRequiredDataForExport: (payload: ExportActionPayload) => {
    const missingValueMessage = (fieldName: string) =>
      `Missing required value for field "${fieldName}". Please fill in the field and try again.`;

    if (!payload.githubAccessToken)
      throw new Error(missingValueMessage("Github access token"));

    if (!payload.repositoryOwner)
      throw new Error(missingValueMessage("Repository Owner"));

    if (!payload.repositoryName)
      throw new Error(missingValueMessage("Repository Name"));

    if (!payload.destinationFolder)
      throw new Error(missingValueMessage("Destination Folder"));
  },
};

const utils = {
  figma: {
    persistValueToStorage: async ({ field, value }: SavableValue) => {
      await figma.clientStorage.setAsync(field, value);
    },

    getStorage: async () => {
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

      return {
        exportFormat,
        destinationFolder,
        rtlEnabled,
        repositoryOwner,
        repositoryName,
        githubAccessToken,
      };
    },

    getAvailablePanels: () => {
      return figma.currentPage.children as ComponentSetNode[];
    },

    getComponentsFromPanel: (panel: ComponentSetNode) => {
      return panel.children as ComponentNode[];
    },

    // @TODO: Allow the UI to customize the properties to exclude
    filterComponentProperties: (componentProperties: {
      [name: string]: string;
    }) => {
      const filteredProperties = {} as any;

      Object.keys(componentProperties).forEach((key) => {
        if (["Name"].indexOf(key) === -1) {
          filteredProperties[key] = componentProperties[key];
        }
      });

      return filteredProperties;
    },

    componentPropertiesAsConditionString: (componentProperties: {
      [name: string]: string;
    }) => {
      let str = "";

      Object.keys(componentProperties).forEach((key) => {
        if (str !== "") str += " && ";

        str +=
          utils.casing.toCamelCase(key) +
          " === '" +
          componentProperties[key] +
          "'";
      });

      return str;
    },

    exportComponentAsSVG: async (component: ComponentNode) => {
      return await component.exportAsync({
        format: "SVG_STRING",
      });
    },
  },

  casing: {
    toCamelCase: (str: string) => {
      return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
          return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, "");
    },

    toPascalCase: (string: string) => {
      const camelCased = utils.casing.toCamelCase(string);
      return camelCased.charAt(0).toUpperCase() + camelCased.slice(1);
    },
  },
};

const generators = {
  vue: {
    getComponentName: (name: string) => {
      return utils.casing.toPascalCase(
        name.replace("/", "Or").replace(".", "")
      );
    },

    getComponentProps: (
      props: VuePropMap,
      componentProperties: {
        [name: string]: string;
      }
    ) => {
      Object.keys(componentProperties).forEach((key) => {
        const propertyName = utils.casing.toCamelCase(key);

        if (!props[propertyName]) {
          // @TODO: Allow to customize default values on the plugin UI
          props[propertyName] = {
            possibleValues: [componentProperties[key]],
            defaultValue: componentProperties[key],
          };
        } else {
          if (
            props[propertyName].possibleValues.indexOf(
              componentProperties[key]
            ) === -1
          ) {
            props[propertyName].possibleValues.push(componentProperties[key]);
          }
        }
      });

      return props;
    },

    componentPropsAsString: (props: VuePropMap) => {
      let propsStr = "";

      Object.keys(props).forEach((propName) => {
        const prop = props[propName];

        if (propsStr !== "") {
          propsStr += ",\n\n";
        }

        propsStr += `    /**\n     * @type {${prop.possibleValues
          .map((v) => `'${v}'`)
          .join(" | ")}}\n     */\n`;

        propsStr +=
          "    " +
          propName +
          ": " +
          "{\n" +
          "      type: String, \n" +
          '      default: "' +
          prop.defaultValue +
          '"\n    }';
      });

      return propsStr;
    },

    newComponentTemplate: () => {
      return `<template>
  __COMPONENT_TEMPLATE__
</template>

<script>
export default {
  props: {
__COMPONENT_PROPS__
  }
}
</script>`;
    },

    getSFCs: (components: {
      [componentName: string]: {
        code: string;
        props: VuePropMap;
      };
    }) => {
      Object.keys(components).forEach((componentName) => {
        const component = components[componentName];
        let componentCode = generators.vue.newComponentTemplate();

        componentCode = componentCode.replace(
          "__COMPONENT_TEMPLATE__",
          component.code
        );
        componentCode = componentCode.replace(
          "__COMPONENT_PROPS__",
          generators.vue.componentPropsAsString(component.props)
        );

        component.code = componentCode;
      });

      return components;
    },
  },
};

const handlers = {
  exportAssetsHandler: async (data: ExportActionPayload) => {
    try {
      validators.hasRequiredDataForExport(data);

      // @TODO: Refactor this code later, consider this as a draft
      let componentsToExport = {} as any;

      const panels = utils.figma.getAvailablePanels();
      figma.currentPage.children as ComponentSetNode[];

      // @TODO: Instead of going to all panels
      // go specifically to the panels selected in the UI
      for (let i = 0; i < panels.length; i++) {
        const panel = panels[i];
        const components = utils.figma.getComponentsFromPanel(panel);

        for (let j = 0; j < components.length; j++) {
          const component = panel.children[j] as ComponentNode;
          const svgString = await utils.figma.exportComponentAsSVG(component);

          if (!component.variantProperties || data.exportFormat === "SVG") {
            const componentName = generators.vue.getComponentName(
              component.name
            );
            componentsToExport[componentName] = {
              code: svgString,
            };
          } else {
            // has variant properties and is exporting as vue component
            const properties = utils.figma.filterComponentProperties(
              component.variantProperties
            );
            const condition =
              utils.figma.componentPropertiesAsConditionString(properties);

            const componentName = generators.vue.getComponentName(
              component.variantProperties["Name"]
            );

            if (!componentsToExport[componentName]) {
              componentsToExport[componentName] = {
                code: svgString.replace("<svg", `<svg v-if="${condition}" `),
                props: generators.vue.getComponentProps({}, properties),
              };
            } else {
              componentsToExport[componentName].code +=
                "\n" +
                svgString.replace("<svg", `<svg v-else-if="${condition}" `);

              componentsToExport[componentName].props =
                generators.vue.getComponentProps(
                  componentsToExport[componentName].props,
                  properties
                );
            }
          }
        }
      }

      if (data.exportFormat === "Vue") {
        componentsToExport = generators.vue.getSFCs(componentsToExport);
      }

      // @TODO: Open pull request in the Github repository configured through the UI
      console.log(componentsToExport);
    } finally {
      figma.closePlugin();
    }
  },
};

// Waits for any message sent by the UI file
figma.ui.onmessage = async (payload) => {
  if (payload.event === "persist-to-storage") {
    return await utils.figma.persistValueToStorage({
      field: payload.field,
      value: payload.value,
    });
  }

  if (payload.event === "export-assets") {
    return await handlers.exportAssetsHandler(payload.data);
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
    storage: await utils.figma.getStorage(),
  });
})();
