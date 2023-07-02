<template>
  <div class="column">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.column {
  display: flex;
  flex-direction: column;
  width: calc(50% - 4px);
}
</style>
