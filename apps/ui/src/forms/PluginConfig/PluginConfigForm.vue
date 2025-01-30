<template>
  <div class="plugin-config-form">
    <Fieldset
      class="w-full"
      legend="Figma Settings">
      <Row
        fill
        inline>
        <Column>
          <InputGroup>
            <FloatLabel>
              <Select
                id="page"
                v-model="settings.figma.pageId"
                :options="availablePages"
                option-value="id"
                option-label="name"
              />

              <label for="pageId">
                Page <small>(mandatory)</small>
              </label>
            </FloatLabel>
          </InputGroup>
        </Column>

        <Column>
          <InputGroup>
            <FloatLabel>
              <MultiSelect
                id="assets"
                v-model="settings.figma.assetIds"
                :options="availableAssets"
                option-value="id"
                option-label="name"
                filter
                :max-selected-labels="3"
                class="w-full md:w-80" />

              <label for="assets">
                Assets to export <small>(at least one)</small>
              </label>
            </FloatLabel>
          </InputGroup>
        </Column>
      </Row>
    </Fieldset>

    <Fieldset
      class="w-full"
      legend="Code Settings">
      <Row fill>
        <Column>
          <InputGroup>
            <FloatLabel>
              <label for="format">
                Format
              </label>

              <Select
                id="format"
                v-model="settings.code.format"
                :options="['SVG', 'Vue']"
                placeholder="Select an export format"
                class="w-full md:w-56" />
            </FloatLabel>
          </InputGroup>
        </Column>

        <div
          v-if="settings.code.format === 'Vue'"
          class="mt-4">
          <label for="properties">
            Properties
          </label>

          <DataTable
            :value="Object.keys(availableProperties)"
            class="w-full">
            <TableColumn field="visible">
              <template #body="slotProps">
                <Checkbox
                  v-model="settings.code.properties[slotProps.data].visible"
                  :binary="true" />
              </template>
            </TableColumn>

            <TableColumn
              field="name"
              header="Name">
              <template #body="slotProps">
                {{ slotProps.data }}
              </template>
            </TableColumn>

            <TableColumn
              field="variantOptions"
              header="Options">
              <template #body="slotProps">
                <MultiSelect
                  v-model="settings.code.properties[slotProps.data].options"
                  :options="availableProperties[slotProps.data].variantOptions"
                  :max-selected-labels="2"
                  class="w-full md:w-80" />
              </template>
            </TableColumn>

            <TableColumn
              field="defaultValue"
              header="Default Value">
              <template #body="slotProps">
                <InputText
                  v-model="settings.code.properties[slotProps.data].defaultValue"
                  type="text" />
              </template>
            </TableColumn>
          </DataTable>
        </div>
      </Row>
    </Fieldset>

    <Fieldset
      class="w-full"
      legend="Export Settings">
      <Row
        fill
        inline>
        <Column>
          <InputGroup>
            <FloatLabel>
              <InputText
                id="prefixToRemove"
                v-model="settings.export.prefixToRemove"
                type="text"
              />

              <label for="prefixToRemove">
                Old prefix
              </label>
            </FloatLabel>
          </InputGroup>

          <Message
            severity="secondary"
            size="small"
            variant="simple">
            The text inside this field will be removed from the start of the asset name.
          </Message>
        </Column>

        <Column>
          <InputGroup>
            <FloatLabel>
              <InputText
                id="prefixToAdd"
                v-model="settings.export.prefixToAdd"
                type="text"
              />

              <label for="prefixToAdd">
                New prefix
              </label>
            </FloatLabel>
          </InputGroup>

          <Message
            severity="secondary"
            size="small"
            variant="simple">
            The text inside this field will be added to the start of the asset name.
          </Message>
        </Column>
      </Row>

      <Row
        fill
        inline
        class="mt-4">
        <Column>
          <InputGroup>
            <FloatLabel>
              <InputText
                id="suffixToRemove"
                v-model="settings.export.suffixToRemove"
                type="text"
              />

              <label for="suffixToRemove">
                Old suffix
              </label>
            </FloatLabel>
          </InputGroup>

          <Message
            severity="secondary"
            size="small"
            variant="simple">
            The text inside this field will be removed from the end of the asset name.
          </Message>
        </Column>

        <Column>
          <InputGroup>
            <FloatLabel>
              <InputText
                id="suffixToAdd"
                v-model="settings.export.suffixToAdd"
                type="text"
              />

              <label for="suffixToAdd">
                New suffix
              </label>
            </FloatLabel>
          </InputGroup>

          <Message
            severity="secondary"
            size="small"
            variant="simple">
            The text inside this field will be added to the end of the asset name.
          </Message>
        </Column>
      </Row>
    </Fieldset>

    <Fieldset
      class="w-full"
      legend="Github Settings">
      <Row
        fill
        inline>
        <Column>
          <InputGroup>
            <FloatLabel>
              <InputText
                id="repository"
                v-model="settings.github.repository"
                type="text"
              />

              <label for="repository">
                Repository <small>(mandatory)</small>
              </label>
            </FloatLabel>
          </InputGroup>

          <Message
            severity="secondary"
            size="small"
            variant="simple">
            example: repository-owner/repository-name
          </Message>
        </Column>

        <Column>
          <InputGroup>
            <FloatLabel>
              <InputText
                id="repositoryBranch"
                v-model="settings.github.branch"
                type="text"
              />

              <label for="repositoryBranch">
                Base Branch <small>(mandatory)</small>
              </label>
            </FloatLabel>
          </InputGroup>

          <Message
            severity="secondary"
            size="small"
            variant="simple">
            example: development
          </Message>
        </Column>
      </Row>

      <Row
        fill
        class="mt-4">
        <InputGroup>
          <FloatLabel>
            <InputText
              id="destinationFolder"
              v-model="settings.github.path"
              type="text"
            />

            <label for="destinationFolder">
              Destination Folder <small>(mandatory)</small>
            </label>
          </FloatLabel>
        </InputGroup>

        <Message
          severity="secondary"
          size="small"
          variant="simple">
          example: src/assets/icons
        </Message>
      </Row>

      <Row
        fill
        class="mt-4">
        <InputGroup>
          <FloatLabel>
            <InputText
              id="accessToken"
              v-model="settings.github.accessToken"
              type="password"
            />

            <label for="accessToken">
              Access Token <small>(mandatory)</small>
            </label>
          </FloatLabel>
        </InputGroup>

        <Message
          severity="secondary"
          size="small"
          variant="simple">
          An access token with write access to the repository configured above.
        </Message>
      </Row>
    </Fieldset>

    <Button
      label="Export"
      icon="pi pi-github"
      class="mt-4"
      :loading="figmaStore.exporting"
      @click="exportAssets" />
  </div>
</template>

<script lang="ts">
import type { PluginConfig } from "@typings/index";
import { computed, defineComponent } from "vue";
import Column from "@/components/Grid/Column.vue";
import Row from "@/components/Grid/Row.vue";
import { useConfigStore } from "@/stores/config";
import { useFigmaStore } from "@/stores/figma";
import MultiSelect from 'primevue/multiselect';
import Select from 'primevue/select';
import InputText from 'primevue/inputtext';
import Fieldset from 'primevue/fieldset';
import InputGroup from 'primevue/inputgroup';
import FloatLabel from 'primevue/floatlabel';
import Message from "primevue/message";
import Button from "primevue/button";
import DataTable from 'primevue/datatable';
import TableColumn from 'primevue/column';
import Checkbox from "primevue/checkbox";

export default defineComponent({
  name: 'PluginConfigForm',

  components: {
    Row,
    Column,
    InputGroup,
    Select,
    MultiSelect,
    InputText,
    Fieldset,
    FloatLabel,
    Message,
    Button,
    DataTable,
    TableColumn,
    Checkbox,
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

    const pluginConfigs = computed(() => configStore.pluginConfigs)
    const hasPluginConfigs = computed(() => configStore.pluginConfigs.length > 0)

    const availablePages = computed(() => figmaStore.pages)
    const currentPage = computed(() => figmaStore.currentPage)
    const availableAssets = computed(() => figmaStore.assets)
    const availableProperties = computed(() => figmaStore.properties)

    return {
      configStore,
      figmaStore,

      pluginConfigs,
      hasPluginConfigs,

      currentPage,
      availablePages,
      availableAssets,
      availableProperties
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
      handler(settings) {
        console.log('settings changed', this.pluginConfigs)

        const page = this.availablePages.find(page => page.id === settings.figma.pageId)
        if (!page) {
          this.figmaStore.setAssets([])
          return
        }

        this.figmaStore.setAssetsFromPage(page)

        parent.postMessage(
          {
            pluginMessage: {
              event: 'update-plugin-configs',
              value: JSON.stringify(this.pluginConfigs),
            },
          },
          '*'
        )
      }
    },

    'settings.figma.pageId': {
      immediate: true,
      handler(newPageId) {
        const page = this.availablePages.find(page => page.id === newPageId)
        if (!page) return
        this.figmaStore.setAssetsFromPage(page)

        parent.postMessage(
          {
            pluginMessage: {
              event: 'get-properties-from-page',
              pageId: newPageId,
            },
          },
          '*'
        )
      },
    },
  },

  methods: {
    settingsAreValid() {
      // Required fields
      if (!this.settings.figma.pageId) return alert('Please select a page')
      if (!this.settings.figma.assetIds.length) return alert('Please select at least one asset')
      if (!this.settings.github.repository) return alert('Please enter a Github repository')
      if (!this.settings.github.branch) return alert('Please enter a base branch')
      if (!this.settings.github.path) return alert('Please enter a destination folder')
      if (!this.settings.github.accessToken) return alert('Please enter a Github access token with write access to the repository')
      if (!this.settings.code.format) return alert('Please select an export format')

      // TODOS:
      if (this.settings.code.format === 'SVG') return alert('SVG support is coming soon.')

      // Field specific validations
      if (this.settings.github.path.startsWith('/')) return alert('Destination folder cannot start with a slash')

      return true
    },

    exportAssets() {
      if (!this.settingsAreValid()) return

      this.figmaStore.setExporting(true)

      parent.postMessage(
        {
          pluginMessage: {
            event: 'export-assets',
            data: JSON.stringify(this.pluginConfigs.find(config => config.id === this.selectedConfigId)),
          },
        },
        '*'
      )
    },
  },
})
</script>

<style lang="scss">
.plugin-config-form {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  padding: 8px 12px;

  .p-fieldset-content-container {
    padding-top: 14px;
  }

  .mt-4 {
    margin-top: 24px;
  }

  .p-message {
    margin-top: 4px;

    --p-message-text-sm-font-size: 10px;
  }

  .p-datatable-table {
    font-size: inherit;
  }
}
</style>
