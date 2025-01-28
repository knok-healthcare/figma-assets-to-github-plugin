<template>
  <Tabs
    :value="selectedTabIndex"
    scrollable
    lazy
    class="tab-navigation"
    @update:value="selectedTabIndex = $event">
    <TabList>
      <Tab
        v-for="(tab, tabIndex) in tabs"
        :key="tab.id"
        :value="tabIndex">
        {{ tab.label }}
      </Tab>
    </TabList>
  </Tabs>

  <SpeedDial
    :model="actions"
    direction="down"
    show-icon="pi pi-bars"
    hide-icon="pi pi-times"
    :button-props="{
      size: 'small',
      variant: 'outlined',
    }"
    :tooltip-options="{ position: 'right' }"
    style="position: absolute; top: 9px; right: 12px;"
  />

  <PluginConfigForm :selected-config-id="selectedTab.id" />
  <!--<TabView :tabs="tabs">
    <template #navigation>
      <Tab
        id="create-new-tab"
        label="+ &nbsp;New config"
        @selected="addEmptyPluginConfig"
      />
    </template>

    <template #default="{ selectedTab }">
      <PluginConfigForm :selected-config-id="selectedTab.id" />
    </template>

    <template #footer="{ selectedTab }">
      <button @click="exportAssets(selectedTab)">
        Export to Github
      </button>
    </template>
  </TabView>-->
</template>

<script lang="ts">
import type { PluginConfig } from '@typings/index';
import { defineComponent, Ref, ref } from 'vue';
// Layout
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import SpeedDial from 'primevue/speeddial';
// View States
//
// Data Stores
import { useConfigStore } from '@/stores/config'
// Views
import PluginConfigForm from '@/forms/PluginConfig/PluginConfigForm.vue'
import { useFigmaStore } from './stores/figma';
import { useDarkMode } from './composables/useDarkMode';

export default defineComponent({
  name: 'App',

  components: {
    Tabs,
    TabList,
    Tab,
    SpeedDial,
    // "Views"
    PluginConfigForm,
    // View States

  },

  setup() {
    const { isDarkMode, toggleDarkMode } = useDarkMode()

    const configStore = useConfigStore()
    const figmaStore = useFigmaStore()
    const selectedTabIndex = ref(0) as Ref<number>

    onmessage = event => {
      if (event.data.pluginMessage.event === 'initial-data') {
        console.log('initial-data', event.data.pluginMessage)
        figmaStore.setCurrentPage(event.data.pluginMessage.currentPage)
        console.log(configStore.pluginConfigs, figmaStore.currentPage)
      }
    }

    return {
      pluginConfigs: configStore.pluginConfigs,
      addPluginConfig: configStore.addPluginConfig,
      selectedTabIndex,
      isDarkMode,
      toggleDarkMode: toggleDarkMode
    }
  },

  computed: {
    hasPluginConfigs() {
      return this.pluginConfigs.length > 0
    },

    tabs() {
      return this.pluginConfigs.map((pluginConfig: PluginConfig) => ({
        id: pluginConfig.id,
        label: pluginConfig.name,
        settings: pluginConfig.settings
      }))
    },

    selectedTab() {
      return this.tabs[this.selectedTabIndex]
    },

    actions() {
      return [
        { icon: 'pi pi-plus', label: 'Add new config', command: () => this.addEmptyPluginConfig() },
        // action to toggle light/dark mode
        { icon: this.isDarkMode ? 'pi pi-sun' : 'pi pi-moon',
          label: this.isDarkMode ? 'Light mode' : 'Dark mode',
          command: () => this.toggleDarkMode()
        }
      ]
    }
  },

  created() {
    if (!this.hasPluginConfigs) this.addEmptyPluginConfig()
  },

  methods: {
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

    exportAssets(tab: TabModel) {
      console.log('exportAssets', tab)
    }
  }
})
</script>

<style lang="scss">
@import 'primeicons/primeicons.css';

:root {
  --font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans',
    arial, sans-serif;
  --main-color: #000;
  --main-color-light: #333;
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

.tab-navigation {
  max-width: calc(100% - 50px);

  .p-tablist-tab-list {
    border-color: transparent;
  }
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

.add-tab-button {
  min-width: 25px;
  max-width: 25px;
  height: 25px;
  margin: auto 0 auto 12px;
}

.export-assets-button {
  font-weight: 600;
}
</style>
