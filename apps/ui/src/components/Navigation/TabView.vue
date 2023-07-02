<template>
  <div class="tab-view">
    <nav class="tab-view--navigation">
      <Tab
        v-for="tab in tabs"
        :key="tab.id"
        :id="tab.id"
        :label="tab.label"
        :selected="tab.id === selectedTab"
        @selected="setSelectedTab"
      />
    </nav>

    <main class="tab-view--content">
      <slot :selectedTab="selectedTab" />
    </main>

    <footer class="tab-view--footer" v-if="!!$slots.footer">
      <slot name="footer"></slot>
    </footer>
  </div>
</template>

<script lang="ts">
import { PropType } from "vue";
import Tab from "./Tab.vue";

export type Tab = {
  id: string;
  label: string;
};

export default {
  name: "Tabview",

  components: { Tab },

  props: {
    /** Array of tabs to render */
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true,
    },
  },

  data() {
    return {
      selectedTab: "",
    };
  },

  methods: {
    setSelectedTab(selectedTab: string) {
      this.selectedTab = selectedTab;
    },
  },

  created() {
    this.selectedTab = this.tabs[0].id;
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
    flex-direction: column;
    flex: 1;
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
