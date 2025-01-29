import { defineStore } from 'pinia'
import type { PluginConfig } from '@typings/index'

export const useConfigStore = defineStore('config', {
  state: () => {
    return {
      pluginConfigs: [] as PluginConfig[]
    }
  },

  actions: {
    setPluginConfigs(pluginConfigs: PluginConfig[]) {
      this.pluginConfigs = pluginConfigs
    },

    initializePluginConfigs(pluginConfigs: PluginConfig[]) {
      console.log('initializePluginConfigs', pluginConfigs)
      if (!pluginConfigs?.length) this.addEmptyPluginConfig()
      else {
        this.pluginConfigs.push(...pluginConfigs)
      }
    },

    addEmptyPluginConfig() {
      this.addPluginConfig({
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        name: `Config ${this.pluginConfigs.length + 1}`,
        settings: {
          figma: {
            pageId: '',
            assetIds: []
          },
          code: {
            format: 'SVG',
            properties: {}
          },
          export: {
            prefixToAdd: '',
            prefixToRemove: '',
            suffixToAdd: '',
            suffixToRemove: '',
            defaultExportsFile: ''
          },
          github: {
            repository: '',
            branch: '',
            path: '',
            accessToken: ''
          },
        }
      })
    },

    addPluginConfig(pluginConfig: PluginConfig) {
      this.pluginConfigs.push(pluginConfig)

      // Update figma client storage through the back-end handler
      parent.postMessage(
        {
          pluginMessage: {
            event: 'update-plugin-configs',
            value: JSON.stringify(this.pluginConfigs),
          },
        },
        '*'
      )
    },

    setConfigProperties(configIndex: number, properties: ComponentPropertyDefinitions) {
      Object.keys(properties).forEach(property => {
        if (!this.pluginConfigs[configIndex].settings.code.properties[property]) {
          this.pluginConfigs[configIndex].settings.code.properties[property] = {
            options: properties[property].variantOptions || [],
            visible: true,
            defaultValue: properties[property].defaultValue
          }
        }
      })
    }
  }
})
