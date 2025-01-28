import { defineStore } from 'pinia'
import type { PluginConfig } from '@typings/index'

export const useConfigStore = defineStore('config', {
  state: () => ({
    pluginConfigs: [] as PluginConfig[]
  }),

  actions: {
    setPluginConfigs(pluginConfigs: PluginConfig[]) {
      this.pluginConfigs = pluginConfigs
    },

    addPluginConfig(pluginConfig: PluginConfig) {
      this.pluginConfigs.push(pluginConfig)

      // Update figma client storage through the back-end handler
      parent.postMessage(
        {
          pluginMessage: {
            event: 'update-plugin-configs',
            pluginConfigs: JSON.stringify(this.pluginConfigs),
          },
        },
        '*'
      )
    }
  }
})
