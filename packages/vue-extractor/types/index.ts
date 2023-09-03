export type Prop = {
  possibleValues: string[]
  defaultValue: string | number | boolean | null | undefined
  visible: boolean
}

export type VueComponentProps = { [componentName: string]: PropMap }

export type PropMap = {
  [propName: string]: Prop
}

export type FigmaComponentProperties = {
  [name: string]: string
}

export type PropConfig = {
  [propName: string]: {
    visible: boolean
    defaultValue?: string | number | boolean | null
  }
}
