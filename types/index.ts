export type PluginConfig = {
  id: string
  name: string
  settings: {
    figma: {
      /**
       * The figma page where the plugin will look for assets to export.
       *
       * @type {string}
       */
      pageId: string,
      /**
       * A list of assets (InstanceNodes, ComponentSetNodes, etc)
       * that will be exported from Figma to code.
       *
       * @type {string[]}
       */
      assetIds: string[]
    },
    code: {
      format: ExportableFormat,
      /**
       * Object containing custom configurations
       * for variant properties defined in Figma
       */
      properties: {
        /**
         * Figma Asset Property
         *
         * @type {{
         *  visible: boolean,
         *  defaultValue?: string | boolean | null
         * }} Defines if a property will be exported and its default value
         */
        [propName: string]: {
          options: string[],
          visible: boolean,
          defaultValue?: string | boolean | null
        }
      }
    },
    export: {
      prefixToAdd: string,
      prefixToRemove: string,
      suffixToAdd: string,
      suffixToRemove: string,
      defaultExportsFile: string
    },
    github: {
      repository: string,
      branch: string,
      path: string,
      accessToken: string
    }
  }
}

/**
 * Defines the valid formats for the exported assets
 * (SVG and Vue for now, but expecting more formats in the future)
 *
 * @type {'SVG' | 'Vue'}
 */
export type ExportableFormat = 'SVG' | 'Vue'
