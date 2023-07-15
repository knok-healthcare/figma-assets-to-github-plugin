import type { VuePropMap, FigmaComponentProperties } from './types'
import utils from '@packages/utils'

export default class VueExtractor {
  static async extract(ltrVariants: ComponentNode[], rtlVariants: ComponentNode[]) {
    const componentsToExport: Record<
      string,
      {
        code: string
        props: VuePropMap
        hasRtl: boolean
      }
    > = {}
    // Export LTR (left-to-right) variants
    for (let i = 0; i < ltrVariants.length; i++) {
      const component = ltrVariants[i] as ComponentNode

      /**
       * Builds the component name
       * (uses the variant property "name" if exists, otherwise just the "component name")
       */
      const componentName = utils.components.formatName(
        !component.variantProperties || !component.variantProperties['Name']
          ? component.name
          : component.variantProperties['Name']
      )

      const svg = await component.exportAsync({
        format: 'SVG_STRING',
      })

      const hasRTLVariant =
        rtlVariants &&
        !!rtlVariants.find(
          variant =>
            component.variantProperties &&
            variant.variantProperties &&
            component.variantProperties['Name'] === variant.variantProperties['Name']
        )

      const properties = component.variantProperties
        ? filterComponentProperties(component.variantProperties)
        : {}
      const condition = componentPropertiesAsConditionString(properties)

      if (!componentsToExport[componentName]) {
        componentsToExport[componentName] = {
          code: svg.replace(
            '<svg',
            `<svg v-if="${
              hasRTLVariant ? '!rtl' + (condition !== '' ? ' && ' : '') : ''
            }${condition}" `
          ),
          props: getComponentProps({}, properties),
          hasRtl: false,
        }
      } else {
        componentsToExport[componentName].code +=
          '\n' +
          svg.replace(
            '<svg',
            `<svg v-else-if="${
              hasRTLVariant ? '!rtl' + (condition !== '' ? ' && ' : '') : ''
            }${condition}" `
          )

        componentsToExport[componentName].props = getComponentProps(
          componentsToExport[componentName].props,
          properties
        )
      }
    }

    // Export RTL (right-to-left) variants
    for (let i = 0; i < rtlVariants.length; i++) {
      const component = rtlVariants[i] as ComponentNode

      /**
       * Builds the component name
       * (uses the variant property "name" if exists, otherwise just the "component name")
       */
      const componentName = utils.components.formatName(
        !component.variantProperties || !component.variantProperties['Name']
          ? component.name
          : component.variantProperties['Name']
      )

      const svg = await component.exportAsync({
        format: 'SVG_STRING',
      })

      const properties = component.variantProperties
        ? filterComponentProperties(component.variantProperties)
        : {}
      const condition = componentPropertiesAsConditionString(properties)

      if (!componentsToExport[componentName]) {
        componentsToExport[componentName] = {
          code: svg.replace(
            '<svg',
            `<svg v-if="rtl${condition !== '' ? ' && ' + condition : ''}" `
          ),
          props: getComponentProps({}, properties),
          hasRtl: true,
        }
      } else {
        componentsToExport[componentName].code +=
          '\n' +
          svg.replace(
            '<svg',
            `<svg v-else-if="rtl${condition !== '' ? ' && ' + condition : ''}" `
          )

        componentsToExport[componentName].props = getComponentProps(
          componentsToExport[componentName].props,
          properties
        )

        componentsToExport[componentName].hasRtl = true
      }
    }

    const components = getSFCs(componentsToExport)

    return components
  }
}

const filterComponentProperties = (componentProperties: { [name: string]: string }) => {
  const filteredProperties: { [key: string]: string } = {}

  Object.keys(componentProperties).forEach(key => {
    if (['Name'].indexOf(key) === -1) {
      filteredProperties[key] = componentProperties[key]
    }
  })

  return filteredProperties
}

const componentPropertiesAsConditionString = (componentProperties: {
  [name: string]: string
}) => {
  let str = ''

  Object.keys(componentProperties).forEach(key => {
    if (str !== '') str += ' && '

    str += utils.casing.toCamelCase(key) + " === '" + componentProperties[key] + "'"
  })

  return str
}

const getComponentProps = (
  props: VuePropMap,
  componentProperties: FigmaComponentProperties
) => {
  Object.keys(componentProperties).forEach(key => {
    const propertyName = utils.casing.toCamelCase(key)

    if (!props[propertyName]) {
      // @TODO: Allow to customize default values on the plugin UI
      props[propertyName] = {
        possibleValues: [componentProperties[key]],
        defaultValue: componentProperties[key],
      }
    } else {
      if (props[propertyName].possibleValues.indexOf(componentProperties[key]) === -1) {
        props[propertyName].possibleValues.push(componentProperties[key])
      }
    }
  })

  return props
}

const componentPropsAsString = (props: VuePropMap, hasRtl: boolean = false) => {
  let propsStr = ''

  Object.keys(props).forEach(propName => {
    const prop = props[propName]

    if (propsStr !== '') {
      propsStr += ',\n\n'
    }

    propsStr += `    /**\n     * @type {${prop.possibleValues
      .map(v => `'${v}'`)
      .join(' | ')}}\n     */\n`

    propsStr +=
      '    ' +
      propName +
      ': ' +
      '{\n' +
      '      type: String, \n' +
      '      default: "' +
      prop.defaultValue +
      '"\n    }'
  })

  if (hasRtl) {
    if (propsStr !== '') {
      propsStr += ',\n\n'
    }

    propsStr += `    /**\n     * @type {Boolean}\n     */\n`

    propsStr +=
      '    ' +
      'rtl' +
      ': ' +
      '{\n' +
      '      type: Boolean, \n' +
      '      default: false\n    }'
  }

  return propsStr
}

const newComponentTemplate = () => {
  return `<template>
__COMPONENT_TEMPLATE__
</template>

<script>
export default {
  props: {
__COMPONENT_PROPS__
  }
}
</script>`
}

const getSFCs = (components: {
  [componentName: string]: {
    code: string
    props: VuePropMap
    hasRtl: boolean
  }
}) => {
  const sfcs: Record<string, string> = {}

  Object.keys(components).forEach(componentName => {
    const component = components[componentName]
    let componentCode = newComponentTemplate()

    componentCode = componentCode.replace('__COMPONENT_TEMPLATE__', component.code)
    componentCode = componentCode.replace(
      '__COMPONENT_PROPS__',
      componentPropsAsString(component.props, component.hasRtl)
    )

    sfcs[componentName] = componentCode
  })

  return sfcs
}
