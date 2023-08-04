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
  margin-bottom: 8px;

  &[data-inline='false'] {
    flex-direction: column;
  }

  &[data-inline='true'] {
    flex-direction: row;
    align-items: center;
    margin-top: 4px;
    margin-bottom: 4px;
  }

  small {
    margin-top: 4px;
    margin-bottom: 4px;
    font-weight: 600;
    color: #949ea5;
    letter-spacing: -0.5px;
  }

  label {
    margin-bottom: 4px;
    font-size: 11.5px;
    font-weight: 600;
    color: #a4a4a4;

    small {
      position: relative;
      bottom: -2px;
      margin-top: 0;
      margin-bottom: 0;
      font-size: 9.5px;
      font-weight: regular;
      color: rgb(0 0 0 / 30%);
      letter-spacing: normal;
    }
  }

  label[for] {
    cursor: pointer;
  }

  input,
  select {
    padding: 8px;
    border: 1px solid #bcbcbc;
    border-radius: 3px;
    outline: none;
  }

  input[type="checkbox"] {
    margin-bottom: 8px;
  }

  input[type="checkbox"] ~ label {
    margin-left: 4px;
  }
}
</style>
