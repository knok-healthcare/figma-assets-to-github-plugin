import Component from './component'
import Props from './props'
import type { PropConfig, PropMap } from './types'
import utils from '@packages/utils'

export default class VueExtractor {
  static extractComponentProps(
    figmaComponents: ComponentNode[],
    groupByComponent = true,
    propOverrides: {
      [propName: string]: {
        visible: boolean
        defaultValue?: string | number | boolean | null
      }
    },
    filterProps = true
  ) {
    const props: { [componentName: string]: PropMap } = {}
    const propMap: PropMap = {}

    for (let i = 0; i < figmaComponents.length; i++) {
      const component = figmaComponents[i] as ComponentNode
      const properties = component.variantProperties ? component.variantProperties : {}

      const componentName = utils.components.formatName(
        !component.variantProperties || !component.variantProperties['Name']
          ? component.name
          : component.variantProperties['Name']
      )

      if (groupByComponent && !props[componentName]) {
        props[componentName] = {}
      }

      Object.keys(properties).forEach(key => {
        const propertyName = utils.casing.toCamelCase(key)

        if (groupByComponent) {
          if (!props[componentName][propertyName]) {
            props[componentName][propertyName] = {
              possibleValues: [properties[key]],
              defaultValue:
                propOverrides[propertyName] && propOverrides[propertyName].defaultValue
                  ? propOverrides[propertyName].defaultValue
                  : properties[key],
              visible:
                propOverrides[propertyName] &&
                typeof propOverrides[propertyName].visible === 'boolean'
                  ? propOverrides[propertyName].visible
                  : true,
            }

            if (filterProps && props[componentName][propertyName].visible === false) {
              delete props[componentName][propertyName]
            }
          } else {
            if (
              props[componentName][propertyName].possibleValues.indexOf(
                properties[key]
              ) === -1
            ) {
              props[componentName][propertyName].possibleValues.push(properties[key])
            }
          }
        } else {
          if (!propMap[propertyName]) {
            propMap[propertyName] = {
              possibleValues: [properties[key]],
              defaultValue:
                propOverrides[propertyName] && propOverrides[propertyName].defaultValue
                  ? propOverrides[propertyName].defaultValue
                  : properties[key],
              visible:
                propOverrides[propertyName] &&
                typeof propOverrides[propertyName].visible === 'boolean'
                  ? propOverrides[propertyName].visible
                  : true,
            }
            if (filterProps && propMap[propertyName].visible === false) {
              delete propMap[propertyName]
            }
          } else {
            if (propMap[propertyName].possibleValues.indexOf(properties[key]) === -1) {
              propMap[propertyName].possibleValues.push(properties[key])
            }
          }
        }
      })
    }

    return groupByComponent ? props : propMap
  }

  static async extract(
    ltrVariants: ComponentNode[],
    rtlVariants: ComponentNode[],
    propOverrides: PropConfig
  ) {
    const componentsToExport: Record<
      string,
      {
        code: string
        props: PropMap
        hasRtl: boolean
      }
    > = {}
    const componentProps = new Props([...ltrVariants, ...rtlVariants], propOverrides)

    // Get all props from all possible components (LTR and RTL)
    const allProps = componentProps.all()
    const propsToRenderInComponent = componentProps.visibleAndWithMultiplePossibleValues()

    // Export LTR (left-to-right) variants
    for (let i = 0; i < ltrVariants.length; i++) {
      // Build the component
      const component = new Component(ltrVariants[i])
      component.setComponentProps(propsToRenderInComponent[component.name])

      // Skip hidden variants by the user
      let skipVariant = false

      Object.keys(component.properties).forEach(key => {
        const propertyName = utils.casing.toCamelCase(key)

        if (
          allProps[component.name][propertyName].visible === false &&
          allProps[component.name][propertyName].possibleValues.length > 1 &&
          allProps[component.name][propertyName].defaultValue !==
            component.properties[key]
        ) {
          skipVariant = true
        }
      })

      if (skipVariant) continue

      // Export SVG from figma
      const svg = await component.getSVG()

      const hasRTLVariant =
        rtlVariants &&
        !!rtlVariants.find(variant => {
          const variantComponent = new Component(variant)
          return component.name === variantComponent.name
        })

      const condition = component.conditionString
      if (!componentsToExport[component.name]) {
        componentsToExport[component.name] = {
          code: svg.replace(
            '<svg',
            `<svg v-if="${
              hasRTLVariant ? '!rtl' + (condition !== '' ? ' && ' : '') : ''
            }${condition}"`
          ),
          props: propsToRenderInComponent[component.name],
          hasRtl: false,
        }
      } else {
        componentsToExport[component.name].code +=
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
      // Build the component
      const component = new Component(rtlVariants[i])
      component.setComponentProps(propsToRenderInComponent[component.name])

      let skipVariant = false

      Object.keys(component.properties).forEach(key => {
        const propertyName = utils.casing.toCamelCase(key)

        if (
          allProps[component.name][propertyName].visible === false &&
          allProps[component.name][propertyName].possibleValues.length > 1 &&
          allProps[component.name][propertyName].defaultValue !==
            component.properties[key]
        ) {
          skipVariant = true
        }
      })

      if (skipVariant) continue

      // Export SVG from figma
      const svg = await component.getSVG()

      const condition = component.conditionString
      if (!componentsToExport[component.name]) {
        componentsToExport[component.name] = {
          code: svg.replace(
            '<svg',
            `<svg v-if="rtl${condition !== '' ? ' && ' + condition : ''}"`
          ),
          props: propsToRenderInComponent[component.name],
          hasRtl: true,
        }
      } else {
        componentsToExport[component.name].code +=
          '\n' +
          svg.replace(
            '<svg',
            `<svg v-else-if="rtl${condition !== '' ? ' && ' + condition : ''}"`
          )

        componentsToExport[component.name].hasRtl = true
      }
    }

    const components = getSFCs(componentsToExport)

    return components
  }
}

const componentPropsAsString = (props: PropMap, hasRtl: boolean = false) => {
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
    props: PropMap
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
