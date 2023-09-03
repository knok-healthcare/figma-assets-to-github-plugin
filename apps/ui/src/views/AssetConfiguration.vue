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

    <h6>
      Properties
    </h6>

    <Row>
      <table class="props-table">
        <thead>
          <tr>
            <th>
              Property
            </th>
            <th>
              Visible
            </th>
            <th>
              Default Value
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="propName in Object.keys(availableProps)"
            :key="propName">
            <td>
              {{ propName }}
            </td>
            <td>
              <InputGroup inline>
                <input
                  :id="`prop_${propName}_visibility`"
                  type="checkbox"
                  :checked="availableProps[propName].visible"
                  @change="updatePropVisibility(propName, $event)"
                />
              </InputGroup>
            </td>
            <td>
              <InputGroup inline>
                <select
                  :id="`select_${propName}_defaultValue`"
                  :value="availableProps[propName].defaultValue"
                  @change="onChangePropDefaultValue(propName, $event)"
                >
                  <option
                    v-for="value in availableProps[propName].possibleValues"
                    :key="value"
                    :value="value">
                    {{ value }}
                  </option>
                </select>
              </InputGroup>
            </td>
          </tr>
        </tbody>
      </table>
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
    const { clientStorage, pages, boards, rtlBoards, availableProps } = storeToRefs(figma);
    const { updateClientStorageField, updateAvailablePropVisibility, updateAvailablePropDefaultValue } = figma;

    return {
      clientStorage,
      pages,
      boards,
      rtlBoards,
      availableProps,
      updateClientStorageField,
      updateAvailablePropVisibility,
      updateAvailablePropDefaultValue
    };
  },

  methods: {
    onChange(field: keyof ClientStorage, event: Event) {
      this.updateClientStorageField(
        field,
        (event.target as HTMLInputElement).value
      );
    },

    onChangePropDefaultValue(propName: string, event: Event) {
      this.updateAvailablePropDefaultValue(
        propName,
        (event.target as HTMLInputElement).value
      );
    },

    onCheckboxChange(field: keyof ClientStorage, event: Event) {
      this.updateClientStorageField(
        field,
        (event.target as HTMLInputElement).checked
      );
    },

    updatePropVisibility(propName: string, event: Event) {
      this.updateAvailablePropVisibility(
        propName,
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

<style lang="scss">
.props-table {
  width: 100%;
  font-size: 13px;
  text-align: left;
}
</style>
