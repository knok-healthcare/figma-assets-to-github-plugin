<template>
  <div class="plugin-config-form">
    <h6>
      Figma Settings
    </h6>

    <Row
      fill
      inline>
      <Column>
        <InputGroup>
          <label for="pageId">
            Page <small>(mandatory)</small>
          </label>

          <InputText
            id="pageId"
            :value="currentPage.name"
            disabled
            type="text"
            placeholder="example: Icon config"
          />
        </InputGroup>
      </Column>

      <Column>
        <InputGroup>
          <label for="assets">
            Assets <small>(at least one)</small>
          </label>

          <!-- multi-select currentPage.children-->
          <MultiSelect
            id="assets"
            v-model="settings.figma.assetIds"
            :options="availableAssets"
            option-value="id"
            option-label="name"
            placeholder="Select assets"
            :max-selected-labels="3"
            class="w-full md:w-80" />
        </InputGroup>
      </Column>
    </Row>

    <h6>
      Code Settings
    </h6>

    <Row fill>
      <Column>
        <InputGroup>
          <label for="format">
            Format
          </label>

          <Select
            id="format"
            v-model="settings.code.format"
            :options="['SVG', 'Vue']"
            placeholder="Select an export format"
            class="w-full md:w-56" />
        </InputGroup>
      </Column>

      <Column v-if="settings.code.format === 'Vue'">
        <InputGroup>
          <label for="properties">
            Properties
          </label>

          <!--...table with properties, with name of the property,
           if it's visible, and the default value-->
        </InputGroup>
      </Column>
    </Row>

    <h6>
      Export Settings
    </h6>

    <Row
      fill
      inline>
      <Column>
        <InputGroup fill>
          <label for="prefixToRemove">
            Old prefix
          </label>

          <InputText
            id="prefixToRemove"
            v-model="settings.export.prefixToRemove"
            type="text"
            placeholder="text to remove from the start of asset name"
          />
        </InputGroup>
      </Column>

      <Column>
        <InputGroup fill>
          <label for="prefixToAdd">
            New prefix
          </label>

          <InputText
            id="prefixToAdd"
            v-model="settings.export.prefixToAdd"
            type="text"
            placeholder="text to add to the start of asset name"
          />
        </InputGroup>
      </Column>
    </Row>

    <Row
      fill
      inline>
      <Column>
        <InputGroup fill>
          <label for="suffixToRemove">
            Old suffix
          </label>

          <InputText
            id="suffixToRemove"
            v-model="settings.export.suffixToRemove"
            type="text"
            placeholder="text to remove from the end of asset name"
          />
        </InputGroup>
      </Column>

      <Column>
        <InputGroup fill>
          <label for="suffixToAdd">
            New suffix
          </label>

          <InputText
            id="suffixToAdd"
            v-model="settings.export.suffixToAdd"
            type="text"
            placeholder="text to add to the end of asset name"
          />
        </InputGroup>
      </Column>
    </Row>

    <h6>
      Github Settings
    </h6>

    <Row
      fill
      inline>
      <Column>
        <InputGroup>
          <label for="repository">
            Repository <small>(mandatory)</small>
          </label>

          <InputText
            id="repository"
            v-model="settings.github.repository"
            type="text"
            placeholder="example: repository-owner/repository-name"
          />
        </InputGroup>
      </Column>

      <Column>
        <InputGroup>
          <label for="repositoryBranch">
            Base Branch <small>(mandatory)</small>
          </label>

          <InputText
            id="repositoryBranch"
            v-model="settings.github.branch"
            type="text"
            placeholder="example: development"
          />
        </InputGroup>
      </Column>
    </Row>

    <Row fill>
      <InputGroup>
        <label for="destinationFolder">
          Destination Folder <small>(mandatory)</small>
        </label>

        <InputText
          id="destinationFolder"
          v-model="settings.github.path"
          type="text"
          placeholder="example: /src/assets/icons"
        />
      </InputGroup>
    </Row>
  </div>
</template>

<script lang="ts">
import type { PluginConfig } from "@typings/index";
import { defineComponent } from "vue";
import Column from "@/components/Grid/Column.vue";
import InputGroup from "@/components/Forms/InputGroup.vue";
import Row from "@/components/Grid/Row.vue";
import { useConfigStore } from "@/stores/config";
import { useFigmaStore } from "@/stores/figma";
import MultiSelect from 'primevue/multiselect';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';

export default defineComponent({
  name: 'PluginConfigForm',

  components: {
    Row,
    Column,
    InputGroup,
    Select,
    MultiSelect,
    InputText,
  },

  props: {
    selectedConfigId: {
      type: String,
      required: true,
    },
  },

  setup() {
    const configStore = useConfigStore()
    const figmaStore = useFigmaStore()

    return {
      pluginConfigs: configStore.pluginConfigs,
      currentPage: figmaStore.currentPage,
      availableAssets: figmaStore.assets,
    }
  },

  data() {
    return {
      settings: {} as PluginConfig['settings']
    }
  },

  watch: {
    selectedConfigId: {
      immediate: true,
      handler(newConfigId) {
        const config = this.pluginConfigs.find(pluginConfig => pluginConfig.id === newConfigId)
        if (!config) throw new Error('Selected config not found.')

        this.settings = config.settings
      },
    },

    settings: {
      deep: true,
      handler() {
        console.log('settings changed', this.pluginConfigs)

        parent.postMessage(
          {
            pluginMessage: {
              event: 'update-plugin-configs',
              pluginConfigs: JSON.stringify(this.pluginConfigs),
            },
          },
          '*'
        )
      }
    }
  }
})
</script>

<style lang="scss" scoped>
.plugin-config-form {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  padding: 8px 12px;
}
</style>
