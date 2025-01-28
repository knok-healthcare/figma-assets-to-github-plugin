<template>
  <div
    class="row"
    :data-fill="fill"
    :data-inline="inline"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Row',

  props: {
    fill: {
      type: Boolean,
      default: false,
    },

    inline: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss" scoped>
.row {
  display: flex;
  justify-content: space-between;

  &[data-fill='true'] {
    flex-grow: 1;
    width: 100%;
  }

  &[data-inline='true'] {
    flex-direction: row;
    gap: 12px;
  }

  &[data-inline='false'] {
    flex-direction: column;
  }
}
</style>
