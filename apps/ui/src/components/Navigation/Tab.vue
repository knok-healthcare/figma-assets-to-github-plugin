<template>
  <button
    id="id"
    class="tab-element"
    :data-selected="selected"
    @click="onTabClick"
  >
    {{ label }}
  </button>
</template>

<script lang="ts">
export default {
  name: "Tab",

  props: {
    /** Identifier of the tab element */
    id: {
      type: String,
      required: true,
    },

    /** Name of the tab */
    label: {
      type: String,
      required: true,
    },

    /** Defines if the tab is selected or not */
    selected: {
      type: Boolean,
      default: false,
    },
  },

  emits: ["selected"],

  methods: {
    onTabClick() {
      this.$emit("selected", this.id);
    },
  },
};
</script>

<style lang="scss" scoped>
.tab-element {
  padding: 10px 18px;
  color: var(--main-color);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 0;
  transition: background-color 150ms ease-in-out;

  &:hover {
    background-color: rgb(0 0 0 / 10%);
  }

  &[data-selected="true"] {
    font-weight: 600;
    border-bottom: 2px solid var(--main-color);
  }
}
</style>
