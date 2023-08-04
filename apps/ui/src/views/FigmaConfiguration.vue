<template>
  <div class="figma-configurations">
    <h6>
      Locations
    </h6>

    <Row>
      <Column>
        <InputGroup>
          <label for="selectedPageId">
            Page <small>(mandatory)</small>
          </label>

          <select
            id="selectedPageId"
            placeholder="Page with assets to be exported"
            :value="clientStorage.selectedPageId"
            @change="[
              onChange('selectedPageId', $event),
              updateClientStorageField('selectedBoardId', -1)
            ]"
          >
            <option
              value="-1"
              disabled>
              Please select an option
            </option>

            <option
              v-for="page in pages"
              :key="page.id"
              :value="page.id">
              {{ page.name }}
            </option>
          </select>
        </InputGroup>
      </Column>

      <Column>
        <InputGroup>
          <label for="selectedBoardId">
            Board <small>(mandatory)</small>
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

            <option
              v-for="board in boards"
              :key="board.id"
              :value="board.id">
              {{ board.name }}
            </option>
          </select>
        </InputGroup>
      </Column>
    </Row>

    <InputGroup v-if="clientStorage.exportFormat === 'Vue'">
      <InputGroup inline>
        <input
          id="rtlEnabled"
          type="checkbox"
          :checked="clientStorage.rtlEnabled"
          @change="onCheckboxChange('rtlEnabled', $event)"
        />

        <label for="rtlEnabled">
          Enable RTL
        </label>
      </InputGroup>

      <Row v-if="clientStorage.rtlEnabled">
        <Column>
          <InputGroup>
            <label for="selectedRTLPageId">
              Page with RTL variants <small>(mandatory)</small>
            </label>

            <select
              id="selectedRTLPageId"
              placeholder="Page with assets to be exported"
              :value="clientStorage.selectedRTLPageId"
              @change="[
                onChange('selectedRTLPageId', $event),
                updateClientStorageField('selectedRTLBoardId', -1)
              ]"
            >
              <option
                value="-1"
                disabled>
                Please select an option
              </option>

              <option
                v-for="page in pages"
                :key="page.id"
                :value="page.id">
                {{ page.name }}
              </option>
            </select>
          </InputGroup>
        </Column>

        <Column>
          <InputGroup>
            <label for="selectedFigmaRTLBoardId">
              Board with RTL variants <small>(mandatory)</small>
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

              <option
                v-for="board in rtlBoards"
                :key="board.id"
                :value="board.id">
                {{ board.name }}
              </option>
            </select>
          </InputGroup>
        </Column>
      </Row>
    </InputGroup>
  </div>
</template>

<script lang="ts">
import type { ClientStorage } from "../../../../types";

import InputGroup from "@/components/Forms/InputGroup.vue";
import Row from '@/components/Grid/Row.vue'
import Column from '@/components/Grid/Column.vue'
import { useFigmaStore } from "../stores/figma";
import { storeToRefs } from "pinia";

export default {
  name: "FigmaConfigurations",

  components: { InputGroup, Row, Column },

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
    }
  },
};
</script>
