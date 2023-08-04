<template>
  <div class="asset-configurations">
    <h6>
      File creation
    </h6>

    <InputGroup>
      <label for="exportFormat">
        Format <small>(mandatory)</small>
      </label>

      <select
        id="exportFormat"
        placeholder="End format of the exported assets"
        :value="clientStorage.exportFormat"
        @change="onChange('exportFormat', $event)"
      >
        <option value="SVG">
          SVG
        </option>

        <option value="Vue">
          Vue components
        </option>
      </select>
    </InputGroup>

    <InputGroup>
      <label for="fileSuffix">
        Suffix <small>(optional)</small>
      </label>

      <input
        id="fileSuffix"
        type="text"
        placeholder="example: Icon"
        :value="clientStorage.fileSuffix"
        @input="onInput('fileSuffix', $event)"
      />

      <small>
        The suffix can be useful if you want your assets to have a specific word in the end of every file name.
      </small>
    </InputGroup>

    <h6>
      Default exports
    </h6>

    <Row>
      <Column>
        <InputGroup inline>
          <input
            id="createDefaultExportsJsFile"
            type="checkbox"
            :checked="clientStorage.createDefaultExportsJsFile"
            @change="onCheckboxChange('createDefaultExportsJsFile', $event)"
          />

          <label for="createDefaultExportsJsFile">
            Create default exports Javascript file
          </label>
        </InputGroup>
      </Column>

      <Column>
        <InputGroup inline>
          <input
            id="createDefaultExportsTsFile"
            type="checkbox"
            :checked="clientStorage.createDefaultExportsTsFile"
            @change="onCheckboxChange('createDefaultExportsTsFile', $event)"
          />

          <label for="createDefaultExportsTsFile">
            Create default exports Typescript file
          </label>
        </InputGroup>
      </Column>
    </Row>
  </div>
</template>

<script lang="ts">
import type { ClientStorage } from "../../../../types";

import InputGroup from "@/components/Forms/InputGroup.vue";
import Row from "@/components/Grid/Row.vue";
import Column from "@/components/Grid/Column.vue";
import { useFigmaStore } from "../stores/figma";
import { storeToRefs } from "pinia";

export default {
  name: "AssetConfigurations",

  components: {
    InputGroup,
    Row,
    Column
  },

  setup() {
    const figma = useFigmaStore();
    const { clientStorage, pages, boards, rtlBoards } = storeToRefs(figma);
    const { updateClientStorageField } = figma;

    return {
      clientStorage,
      pages,
      boards,
      rtlBoards,
      updateClientStorageField,
    };
  },

  methods: {
    onChange(field: keyof ClientStorage, event: Event) {
      this.updateClientStorageField(
        field,
        (event.target as HTMLInputElement).value
      );
    },

    onCheckboxChange(field: keyof ClientStorage, event: Event) {
      this.updateClientStorageField(
        field,
        (event.target as HTMLInputElement).checked
      );
    },

    onInput(field: keyof ClientStorage, event: Event) {
      this.updateClientStorageField(
        field,
        (event.target as HTMLInputElement).value
      );
    },
  },
};
</script>
