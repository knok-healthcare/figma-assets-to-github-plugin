import type { VuePropMap } from './types'
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
    // Get all props from all possible components (LTR and RTL)
    const props = extractComponentProps([...ltrVariants, ...rtlVariants])

    // Export LTR (left-to-right) variants
    for (let i = 0; i < ltrVariants.length; i++) {
      const component = ltrVariants[i] as ComponentNode
      const variantProperties = component.variantProperties
        ? filterComponentProperties(component.variantProperties)
        : {}

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

      if (!componentsToExport[componentName]) {
        const condition = componentPropertiesAsConditionString(
          variantProperties,
          props[componentName]
        )

        componentsToExport[componentName] = {
          code: svg.replace(
            '<svg',
            `<svg v-if="${
              hasRTLVariant ? '!rtl' + (condition !== '' ? ' && ' : '') : ''
            }${condition}"`
          ),
          props: props[componentName],
          hasRtl: false,
        }
      } else {
        const condition = componentPropertiesAsConditionString(
          variantProperties,
          props[componentName]
        )

        componentsToExport[componentName].props = props[componentName]
        componentsToExport[componentName].code +=
          '\n' +
          svg.replace(
            '<svg',
            `<svg v-else-if="${
              hasRTLVariant ? '!rtl' + (condition !== '' ? ' && ' : '') : ''
            }${condition}"`
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

      const variantProperties = component.variantProperties
        ? filterComponentProperties(component.variantProperties)
        : {}

      if (!componentsToExport[componentName]) {
        const condition = componentPropertiesAsConditionString(
          variantProperties,
          props[componentName]
        )

        componentsToExport[componentName] = {
          code: svg.replace(
            '<svg',
            `<svg v-if="rtl${condition !== '' ? ' && ' + condition : ''}"`
          ),
          props: props[componentName],
          hasRtl: true,
        }
      } else {
        const condition = componentPropertiesAsConditionString(
          variantProperties,
          props[componentName]
        )

        componentsToExport[componentName].code +=
          '\n' +
          svg.replace(
            '<svg',
            `<svg v-else-if="rtl${condition !== '' ? ' && ' + condition : ''}"`
          )

        componentsToExport[componentName].props = props[componentName]
        componentsToExport[componentName].hasRtl = true
      }
    }

    const components = getSFCs(componentsToExport)

    return components
  }
}

const extractComponentProps = (figmaComponents: ComponentNode[]) => {
  const props: { [componentName: string]: VuePropMap } = {}

  for (let i = 0; i < figmaComponents.length; i++) {
    const component = figmaComponents[i] as ComponentNode
    const properties = component.variantProperties
      ? filterComponentProperties(component.variantProperties)
      : {}

    const componentName = utils.components.formatName(
      !component.variantProperties || !component.variantProperties['Name']
        ? component.name
        : component.variantProperties['Name']
    )

    if (!props[componentName]) {
      props[componentName] = {}
    }

    Object.keys(properties).forEach(key => {
      const propertyName = utils.casing.toCamelCase(key)

      if (!props[componentName][propertyName]) {
        props[componentName][propertyName] = {
          possibleValues: [properties[key]],
          defaultValue: properties[key],
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

const filterComponentProperties = (componentProperties: { [name: string]: string }) => {
  const filteredProperties: { [key: string]: string } = {}

  Object.keys(componentProperties).forEach(key => {
    if (['Name'].indexOf(key) === -1) {
      filteredProperties[key] = componentProperties[key]
    }
  })

  return filteredProperties
}

const componentPropertiesAsConditionString = (
  componentProperties: {
    [name: string]: string
  },
  props: VuePropMap
) => {
  let str = ''

  Object.keys(componentProperties).forEach(prop => {
    const propName = utils.casing.toCamelCase(prop)

    if (props[propName].possibleValues.length > 1) {
      if (str !== '') str += ' && '

      str += propName + " === '" + componentProperties[prop] + "'"
    }
  })

  return str
}

const componentPropsAsString = (props: VuePropMap, hasRtl: boolean = false) => {
  let propsStr = ''

  Object.keys(props).forEach(propName => {
    const prop = props[propName]

    if (prop.possibleValues.length > 1) {
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
    }
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
__COMPONENT_TEMPLATE__</template>

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
