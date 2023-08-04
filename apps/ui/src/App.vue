<template>
  <ExportingState v-if="exporting" />

  <ExportedSuccessfullyState v-else-if="success" />

  <TabView :tabs="tabs">
    <template #default="{ selectedTab }">
      <AssetConfiguration v-if="selectedTab === 'asset-configurations'" />
      <FigmaConfiguration v-else-if="selectedTab === 'figma-configurations'" />
      <GithubConfiguration v-else-if="selectedTab === 'github-configurations'" />
    </template>

    <template #footer>
      <button
        id="exportAssetsButton"
        class="export-assets-button"
        @click="onExportButtonClick"
      >
        Export
      </button>
    </template>
  </TabView>
</template>

<script lang="ts">
import TabView from '@/components/Navigation/TabView.vue'
import FigmaConfiguration from '@/views/FigmaConfiguration.vue'
import AssetConfiguration from '@/views/AssetConfiguration.vue'
import GithubConfiguration from '@/views/GithubConfiguration.vue'
import ExportingState from '@/states/Exporting.vue'
import ExportedSuccessfullyState from '@/states/ExportedSuccessfully.vue'
import { useFigmaStore } from '@/stores/figma'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

export default {
  name: 'App',

  components: {
    TabView,
    // "Views"
    FigmaConfiguration,
    AssetConfiguration,
    GithubConfiguration,
    // States
    ExportingState,
    ExportedSuccessfullyState
  },

  setup() {
    const figma = useFigmaStore()
    const { clientStorage, exporting } = storeToRefs(figma)

    /** Defines if the export process finished successfully */
    const success = ref(false)

    /** Defines a callback for messages sent by the plugin core */
    onmessage = event => {
      if (event.data.pluginMessage.event === 'initial-data') {
        figma.setCurrentPage(event.data.pluginMessage.currentPage)
        figma.setClientStorage(event.data.pluginMessage.storage)
        figma.setDefaultClientStorageValues()
      } else if (event.data.pluginMessage.event === 'export-completed') {
        // Show success state
        figma.setExporting(false)
        success.value = true

        setTimeout(() => {
          success.value = false
        }, 3000)
      }
    }

    return {
      clientStorage,
      exporting,
      success,

      setExporting: figma.setExporting
    }
  },

  computed: {
    tabs() {
      return [
        {
          id: 'asset-configurations',
          label: 'Assets',
        },
        {
          id: 'figma-configurations',
          label: 'Figma',
        },
        {
          id: 'github-configurations',
          label: 'Github',
        },
      ]
    },
  },

  methods: {
    onExportButtonClick() {
      this.setExporting(true)

      // ⚒️ Allow loading animation to start before performing postMessage
      // as this operating will "block" the main thread for a moment
      setTimeout(() => {
        parent.postMessage(
          {
            pluginMessage: {
              event: 'export-assets',
              data: { ...this.clientStorage },
            },
          },
          '*'
        )
      }, 250)
    },
  },
}
</script>

<style>
:root {
  --font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans',
    arial, sans-serif;
  --main-color: #000;
  --void-color: #fff;
}

* {
  box-sizing: border-box;
}

html,
body {
  padding: 0;
  margin: 0;
  font-family: var(--font-family);
  font-size: 14px;
  line-height: 20px;
}

h6 {
  margin-top: 12px;
  margin-bottom: 4px;
  font-weight: bold;
  color: #bcbcbc;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

h6:first-child {
  margin-top: 0;
}

button {
  padding: 10px 18px;
  font-size: 12px;
  color: var(--void-color);
  cursor: pointer;
  background-color: var(--main-color);
  border: none;
  border-radius: 6px;
}

.export-assets-button {
  font-weight: 600;
}
</style>
