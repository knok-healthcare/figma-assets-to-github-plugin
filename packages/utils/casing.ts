/** Word casing utilities */
export const casing = {
  toCamelCase: function (str: string) {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase()
      })
      .replace(/\s+/g, '')
  },

  toPascalCase: function (str: string) {
    const camelCased = casing.toCamelCase(str)
    return camelCased.charAt(0).toUpperCase() + camelCased.slice(1)
  },
}

export default casing
