import utils from '@packages/utils'

const NAME_ACCEPTABLE_PROPS = ['Name', 'Type', 'Size']

export default class SvgExtractor {
  static async extract(figmaComponents: ComponentNode[]) {
    const components: Record<string, string> = {}

    for (let i = 0; i < figmaComponents.length; i++) {
      const component = figmaComponents[i] as ComponentNode

      /**
       * Builds the component name
       * (uses the variant property "name" if exists, otherwise just the "component name")
       */

      let componentName
      if (!component.variantProperties || !component.variantProperties['Name']) {
        componentName = utils.components.formatName(component.name)
      } else {
        const resolvedName = NAME_ACCEPTABLE_PROPS.reduce((previousVal, currentVal) => {
          if (!component.variantProperties) return previousVal

          return previousVal + component.variantProperties[currentVal]
        }, '')

        componentName = utils.components.formatName(resolvedName)
      }

      const finalSVG = await component.exportAsync({
        format: 'SVG_STRING',
      })

      components[componentName] = finalSVG
    }

    return components
  }
}
