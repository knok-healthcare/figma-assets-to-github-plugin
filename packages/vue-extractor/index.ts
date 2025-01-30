type ComponentData = {
  name: string
  component: ComponentSetNode
  variants: ComponentNode[]
  properties: ComponentPropertyDefinitions
}

type VariantData = {
  properties: VariantMixin['variantProperties']
  svg: string
}

export async function useVueExtractor(components: ComponentData[]) {
  const templateStrings = {} as Record<string, string>

  for (let i = 0; i < components.length; i++) {
    const component = components[i]
    const variants = [] as VariantData[]

    for (let o = 0; o < component.variants.length; o++) {
      const svg = await component.variants[o].exportAsync({
        format: 'SVG_STRING',
      })

      variants.push({
        properties: component.variants[o].variantProperties,
        svg,
      })
    }

    const templateString = buildComponentTemplate(variants)
    const templateScript = buildComponentScript(component.name, component.properties)
    templateStrings[component.name] = templateString + templateScript
  }

  return templateStrings
}

function buildComponentTemplate(variants: VariantData[]) {
  let templateString = `<template>
`

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i]
    let svg = variant.svg

    if (variant.properties) {
      const controlStatement = i === 0 ? 'v-if' : 'v-else-if'
      const conditions = Object.entries(variant.properties)
        .map(([key, value]) => `${key} === '${value}'`)
        .join(' && ')
      svg = svg.replace('<svg ', `<svg ${controlStatement}="${conditions}" `)
    }

    if (i < variants.length - 1) {
      svg = svg.replace('</svg>', '</svg>\n')
    }

    templateString += svg
  }

  templateString += `</template>
`

  return templateString
}

function buildComponentScript(name: string, properties: ComponentPropertyDefinitions) {
  const props = Object.entries(properties).map(([key, value]) => {
    const variants = value?.variantOptions || []
    const type = variants.length ? `{ "${variants.join('" | "')}" }` : '{string}'
    const validator = variants.length
      ? `validator: (value) => { ["${variants.join('", "')}"].includes(value) }`
      : ''

    return `/**
\t * @type ${type}
\t */
\t${key}: {
\t\ttype: String,
\t\tdefault: '${value.defaultValue}',
\t\t${validator}
\t}`
  })

  return `
<script>
export default {
  name: '${name}',

  props: {
    ${props.join(',\n    ')}
  }
}
</script>`
}
