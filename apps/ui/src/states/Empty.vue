<template>
  <div class="empty-state">
    No config detected yet.
    please create one.
  </div>

  <PluginConfig />
</template>

<script lang="ts">
import PluginConfig from '@/views/PluginConfig.vue'

export default {
  components: {
    PluginConfig,
  },
}
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  align-items: center;
  width: 100%;
  height: 37px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;

  // gray background
  background-color: #363434;
}
</style>
