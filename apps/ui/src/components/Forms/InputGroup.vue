<template>
  <div
    class="input-group"
    :data-inline="inline">
    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'InputGroup',

  props: {
    inline: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style lang="scss">
.input-group {
  display: flex;

  &[data-inline='false'] {
    flex-direction: column;
  }

  &[data-inline='true'] {
    flex-direction: row;
    align-items: center;
    margin-bottom: 8px;
  }

  label {
    margin-bottom: 6px;
    font-size: 11.5px;
    color: #bcbcbc;
    letter-spacing: 0.03em;
  }

  label[for] {
    cursor: pointer;
  }

  input,
  select {
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #bcbcbc;
    border-radius: 3px;
    outline: none;
  }
}
</style>
