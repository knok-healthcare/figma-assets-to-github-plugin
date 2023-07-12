<template>
  <div class="tab-view">
    <nav class="tab-view--navigation">
      <Tab
        v-for="tab in tabs"
        :id="tab.id"
        :key="tab.id"
        :label="tab.label"
        :selected="tab.id === selectedTab"
        @selected="setSelectedTab"
      />
    </nav>

    <main class="tab-view--content">
      <slot :selected-tab="selectedTab" />
    </main>

    <footer
      v-if="!!$slots.footer"
      class="tab-view--footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import Tab from "./Tab.vue";

export type TabModel = {
  id: string;
  label: string;
};

export default {
  name: "Tabview",

  components: { Tab },

  props: {
    /** Array of tabs to render */
    tabs: {
      type: Array as PropType<TabModel[]>,
      required: true,
    },
  },

  data() {
    return {
      selectedTab: "",
    };
  },

  created() {
    this.selectedTab = this.tabs[0].id;
  },

  methods: {
    setSelectedTab(selectedTab: string) {
      this.selectedTab = selectedTab;
    },
  },
};
</script>

<style lang="scss" scoped>
.tab-view {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  &--navigation {
    display: flex;
    width: 100%;
    border-bottom: 1px solid var(--main-color);
  }

  &--content {
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 12px;
  }

  &--footer {
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: 8px;
  }
}
</style>
