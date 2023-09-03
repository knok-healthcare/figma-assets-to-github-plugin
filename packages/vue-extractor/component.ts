import utils from '@packages/utils'
import { PropMap } from './types'

export default class Component {
  component: ComponentNode
  props: PropMap

  constructor(component: ComponentNode) {
    this.component = component
    // Props are passed in after initialization
    this.props = {}
  }

  // Initial setters
  setComponentProps(props: PropMap) {
    this.props = props
  }

  // Component getters

  get properties() {
    return this.component.variantProperties ? this.component.variantProperties : {}
  }

  get conditionString() {
    if (!this.props) throw new Error('Component props not defined yet.')

    let str = ''

    Object.keys(this.properties).forEach(prop => {
      const propName = utils.casing.toCamelCase(prop)

      if (this.props[propName]) {
        if (str !== '') str += ' && '

        str += propName + " === '" + this.properties[prop] + "'"
      }
    })

    return str
  }

  get name() {
    const name = !this.properties['Name'] ? this.component.name : this.properties['Name']
    return utils.components.formatName(name)
  }

  // Utility methods

  async getSVG() {
    return await this.component.exportAsync({
      format: 'SVG_STRING',
    })
  }
}
