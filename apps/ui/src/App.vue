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
        <span
          contenteditable
          @input="e => pluginConfigs[tabIndex].name = e.target?.innerText">
          {{ tab.label }}
        </span>

        <Button
          v-if="tabs.length > 1"
          size="small"
          variant="outlined"
          severity="danger"
          icon="pi pi-times"
          class="delete-tab-button"
          @click.stop="deleteTab(tabIndex)" />
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

  <PluginConfigForm
    v-if="gotInitialData"
    :selected-config-id="selectedTab.id" />
</template>

<script lang="ts">
import type { PluginConfig } from '@typings/index';
import { defineComponent, Ref, ref } from 'vue';
// Layout
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';
import Tab from 'primevue/tab';
import SpeedDial from 'primevue/speeddial';
import Button from 'primevue/button';
// Data Stores
import { useConfigStore } from '@/stores/config'
import { useFigmaStore } from '@/stores/figma';
// Views
import PluginConfigForm from '@/forms/PluginConfig/PluginConfigForm.vue'
// Composables
import { useDarkMode } from './composables/useDarkMode';

export default defineComponent({
  name: 'App',

  components: {
    Tabs,
    TabList,
    Tab,
    SpeedDial,
    Button,
    PluginConfigForm,

  },

  setup() {
    const { isDarkMode, toggleDarkMode } = useDarkMode()

    const configStore = useConfigStore()
    const figmaStore = useFigmaStore()
    const selectedTabIndex = ref(0) as Ref<number>
    const gotInitialData = ref(false)

    onmessage = event => {
      if (event.data.pluginMessage.event === 'initial-data') {
        configStore.initializePluginConfigs(event.data.pluginMessage.storage)

        figmaStore.setCurrentPage(event.data.pluginMessage.currentPage)
        figmaStore.setPages(event.data.pluginMessage.currentPage.parent?.children)

        gotInitialData.value = true
      }

      if (event.data.pluginMessage.event === 'available-properties') {
        configStore.setConfigProperties(
          selectedTabIndex.value,
          event.data.pluginMessage.properties
        )

        figmaStore.setPropertiesFromPageAssets(event.data.pluginMessage.properties)
      }
    }

    return {
      gotInitialData,
      pluginConfigs: configStore.pluginConfigs,
      addEmptyPluginConfig: configStore.addEmptyPluginConfig,
      selectedTabIndex,
      isDarkMode,
      toggleDarkMode: toggleDarkMode
    }
  },

  computed: {
    tabs() {
      return this.pluginConfigs.map((pluginConfig: PluginConfig) => ({
        id: pluginConfig.id,
        label: pluginConfig.name,
        settings: pluginConfig.settings
      }))
    },

    selectedTab() {
      if (!this.tabs.length) return {}

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

  methods: {
    deleteTab(tabIndex: number) {
      if (this.selectedTabIndex >= this.tabs.length - 1) {
        this.selectedTabIndex = this.tabs.length - 2
      }

      this.pluginConfigs.splice(tabIndex, 1)

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

    editTabName(tabId: string) {
      const tab = this.pluginConfigs.find(tab => tab.id === tabId)
      if (!tab) return

      tab.name = prompt('Enter new name', tab.name) || tab.name

      parent.postMessage(
        {
          pluginMessage: {
            event: 'update-plugin-configs',
            value: JSON.stringify(this.pluginConfigs),
          },
        },
        '*'
      )
    }
  }
})
</script>

<style lang="scss">
@import 'primeicons/primeicons.css';

:root {
  --font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans',
    arial, sans-serif;
}

* {
  box-sizing: border-box;
}

.w-full {
  width: 100%;
}

html,
body {
  padding: 0;
  margin: 0;
  font-family: var(--font-family);
  font-size: 13px;
}

.tab-navigation {
  max-width: calc(100% - 50px);

  .p-tablist-tab-list {
    border-color: transparent;
  }
}

.delete-tab-button,
.edit-tab-button {
  --p-button-icon-only-width: 18px;

  height: 18px;
  margin-left: 6px;
  font-size: 11px;
}
</style>
