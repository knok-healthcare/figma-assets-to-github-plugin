<template>
  <div class="github-configurations">
    <h6>Repository</h6>

    <Row>
      <Column>
        <InputGroup>
          <label for="repositoryOwner">Repository owner</label>
          <input
            id="repositoryOwner"
            type="text"
            placeholder="example: knok-healthcare"
            :value="clientStorage.repositoryOwner"
            @input="onInput('repositoryOwner', $event)"
          />
        </InputGroup>
      </Column>

      <Column>
        <InputGroup>
          <label for="repositoryName">Repository name</label>
          <input
            id="repositoryName"
            type="text"
            placeholder="example: my-cool-vue-repository"
            :value="clientStorage.repositoryName"
            @input="onInput('repositoryName', $event)"
          />
        </InputGroup>
      </Column>
    </Row>

    <Row>
      <Column>
        <InputGroup>
          <label for="repositoryBranch">Branch</label>
          <input
            id="repositoryBranch"
            type="text"
            placeholder="example: development"
            :value="clientStorage.targetBranch"
            @input="onInput('targetBranch', $event)"
          />
        </InputGroup>
      </Column>

      <Column>
        <InputGroup>
          <label for="destinationFolder">Destination folder</label>
          <input
            id="destinationFolder"
            type="text"
            placeholder="example: /src/assets/icons"
            :value="clientStorage.destinationFolder"
            @input="onInput('destinationFolder', $event)"
          />
        </InputGroup>
      </Column>
    </Row>

    <h6>Authentication</h6>
    <InputGroup>
      <label for="githubAccessToken">Github access token</label>
      <input
        id="githubAccessToken"
        type="password"
        placeholder="Github Access Token (with permissions to write to the repository configured above)"
        :value="clientStorage.accessToken"
        @input="onInput('accessToken', $event)"
      />
    </InputGroup>
  </div>
</template>

<script lang="ts">
import Row from "@/components/Grid/Row.vue";
import Column from "@/components/Grid/Column.vue";
import InputGroup from "../components/Forms/InputGroup.vue";
import { useFigmaStore } from "../stores/figma";
import type { ClientStorage } from "../stores/figma";
import { storeToRefs } from "pinia";

export default {
  name: "GithubConfigurations",

  components: {
    Row,
    Column,
    InputGroup,
  },

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
    onInput(field: keyof ClientStorage, event: Event) {
      this.updateClientStorageField(
        field,
        (event.target as HTMLInputElement).value
      );
    },
  },
};
</script>
