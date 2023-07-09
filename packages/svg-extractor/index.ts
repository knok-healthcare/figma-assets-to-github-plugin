import utils from "@packages/utils";

export default class SvgExtractor {
  static async extract(figmaComponents: ComponentNode[]) {
    const components: Record<string, string> = {};

    for (let i = 0; i < figmaComponents.length; i++) {
      const component = figmaComponents[i] as ComponentNode;

      /**
       * Builds the component name
       * (uses the variant property "name" if exists, otherwise just the "component name")
       */
      const componentName = utils.components.formatName(
        !component.variantProperties || !component.variantProperties["Name"]
          ? component.name
          : component.variantProperties["Name"]
      );

      const finalSVG = await component.exportAsync({
        format: "SVG_STRING",
      });

      components[componentName] = finalSVG;
    }

    return components;
  }
}
