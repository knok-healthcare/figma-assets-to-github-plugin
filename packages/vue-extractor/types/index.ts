export type VueProp = {
  possibleValues: string[]
  defaultValue: string | number | boolean | null
}

export type VuePropMap = {
  [propName: string]: VueProp
}

export type FigmaComponentProperties = {
  [name: string]: string
}
