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
    margin-top: 4px;
    margin-bottom: 4px;
  }

  label {
    margin-bottom: 4px;
    font-size: 11.5px;
    font-weight: 600;
    color: #a4a4a4;

    small {
      position: relative;
      bottom: -2px;
      font-size: 9.5px;
      color: rgb(0 0 0 / 30%);
    }
  }

  label[for] {
    cursor: pointer;
  }

  input,
  select {
    padding: 8px;
    margin-bottom: 8px;
    border: 1px solid #bcbcbc;
    border-radius: 3px;
    outline: none;
  }

  input[type="checkbox"] ~ label {
    margin-left: 4px;
  }
}
</style>
