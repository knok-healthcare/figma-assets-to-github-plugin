<template>
  <TabView :tabs="tabs">
    <template #default="{ selectedTab }">
      <AssetConfiguration v-if="selectedTab === 'asset-configurations'" />
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
import AssetConfiguration from '@/views/AssetConfiguration.vue'
import GithubConfiguration from '@/views/GithubConfiguration.vue'
import { useFigmaStore } from '@/stores/figma'
import { storeToRefs } from 'pinia'

export default {
  name: 'App',

  components: {
    TabView,
    // "Views"
    AssetConfiguration,
    GithubConfiguration,
  },

  setup() {
    const figma = useFigmaStore()
    const { clientStorage } = storeToRefs(figma)

    // Wait for a postMessage from the parent to
    // set the initial values from the client storage
    onmessage = event => {
      figma.setClientStorage(event.data.pluginMessage.storage)
    }

    return {
      clientStorage,
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
          id: 'github-configurations',
          label: 'Github',
        },
      ]
    },
  },

  methods: {
    onExportButtonClick() {
      // @todo: add loading while exporting and show a feedback message after
      // the components have been exported successfully or an error occurred.
      parent.postMessage(
        {
          pluginMessage: {
            event: 'export-assets',
            data: { ...this.clientStorage },
          },
        },
        '*'
      )
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
  margin-bottom: 12px;
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
