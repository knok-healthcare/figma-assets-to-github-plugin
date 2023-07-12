import CasingUtils from './casing'

/** Component specific utilities */
export const components = {
  formatName: function (name: string) {
    return CasingUtils.toPascalCase(name.replace('/', 'Or').replace('.', ''))
  },
}

export default components
