<template>
  <div class="asset-configurations">
    <InputGroup>
      <label for="exportFormat">
        Export as
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
          Vue component
        </option>
      </select>
    </InputGroup>

    <InputGroup>
      <label for="selectedBoardId">
        Figma Board
      </label>
      <select
        id="selectedBoardId"
        placeholder="Board with assets to be exported"
        :value="clientStorage.selectedBoardId"
        @change="onChange('selectedBoardId', $event)"
      >
        <option
          value="-1"
          disabled>
          Please select an option
        </option>
      </select>
    </InputGroup>

    <InputGroup v-if="clientStorage.exportFormat === 'Vue'">
      <InputGroup inline>
        <label for="rtlEnabled">
          Enable RTL
        </label>
        <input
          id="rtlEnabled"
          type="checkbox"
          :checked="clientStorage.rtlEnabled"
          @change="onCheckboxChange('rtlEnabled', $event)"
        />
      </InputGroup>

      <InputGroup v-if="clientStorage.rtlEnabled">
        <label for="selectedFigmaRTLBoardId">
          RTL Board
        </label>
        <select
          id="selectedFigmaRTLBoardId"
          placeholder="Board with assets in right-to-left orientation."
          :value="clientStorage.selectedRTLBoardId"
          @change="onChange('selectedRTLBoardId', $event)"
        >
          <option
            value="-1"
            disabled>
            Please select an option
          </option>
        </select>
      </InputGroup>
    </InputGroup>
  </div>
</template>

<script lang="ts">
import InputGroup from "@/components/Forms/InputGroup.vue";
import { useFigmaStore } from "../stores/figma";
import type { ClientStorage } from "../../../../types";
import { storeToRefs } from "pinia";

export default {
  name: "AssetConfigurations",

  components: { InputGroup },

  setup() {
    const figma = useFigmaStore();
    const { clientStorage } = storeToRefs(figma);
    const { updateClientStorageField } = figma;

    return {
      clientStorage,
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
  },
};
</script>
