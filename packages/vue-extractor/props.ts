import utils from '@packages/utils'
import type { PropMap, PropConfig } from './types'

export default class Props {
  components: ComponentNode[]
  config: PropConfig

  constructor(components: ComponentNode[], config: PropConfig) {
    this.components = components
    this.config = config
  }

  all() {
    const props: { [componentName: string]: PropMap } = {}

    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i] as ComponentNode
      const properties = this.getVariantProperties(component)
      const componentName = this.getComponentName(component)

      if (!props[componentName]) props[componentName] = {}

      Object.keys(properties).forEach(key => {
        const propertyName = utils.casing.toCamelCase(key)

        if (!props[componentName][propertyName]) {
          props[componentName][propertyName] = {
            possibleValues: [properties[key]],
            defaultValue:
              this.config[propertyName] && this.config[propertyName].defaultValue
                ? this.config[propertyName].defaultValue
                : properties[key],
            visible:
              this.config[propertyName] &&
              typeof this.config[propertyName].visible === 'boolean'
                ? this.config[propertyName].visible
                : true,
          }
        } else {
          if (
            props[componentName][propertyName].possibleValues.indexOf(properties[key]) ===
            -1
          ) {
            props[componentName][propertyName].possibleValues.push(properties[key])
          }
        }
      })
    }

    return props
  }

  visible() {
    const props: { [componentName: string]: PropMap } = {}
    const components = this.all()

    Object.keys(components).forEach(componentName => {
      if (!props[componentName]) props[componentName] = {}

      Object.keys(components[componentName]).forEach(propKey => {
        const prop = components[componentName][propKey]
        if (prop.visible) props[componentName][propKey] = prop
      })
    })

    return props
  }

  withMultiplePossibleValues() {
    const props: { [componentName: string]: PropMap } = {}
    const components = this.all()

    Object.keys(components).forEach(componentName => {
      if (!props[componentName]) props[componentName] = {}

      Object.keys(components[componentName]).forEach(propKey => {
        const prop = components[componentName][propKey]
        if (prop.possibleValues.length > 1) props[componentName][propKey] = prop
      })
    })

    return props
  }

  visibleAndWithMultiplePossibleValues() {
    const props: { [componentName: string]: PropMap } = {}
    const components = this.all()

    Object.keys(components).forEach(componentName => {
      if (!props[componentName]) props[componentName] = {}

      Object.keys(components[componentName]).forEach(propKey => {
        const prop = components[componentName][propKey]

        if (prop.visible && prop.possibleValues.length > 1) {
          props[componentName][propKey] = prop
        }
      })
    })

    return props
  }

  private getVariantProperties(component: ComponentNode) {
    return component.variantProperties ? component.variantProperties : {}
  }

  private getComponentName(component: ComponentNode) {
    const name = !this.getVariantProperties(component)['Name']
      ? component.name
      : this.getVariantProperties(component)['Name']

    return utils.components.formatName(name)
  }
}
