import { defineStore } from "pinia";

export type ExportableFormat = "SVG" | "Vue";
export type ClientStorage = {
  exportFormat: ExportableFormat;
  rtlEnabled: boolean;
  selectedBoardId: string;
  selectedRTLBoardId: string;
  accessToken: string;
  repositoryOwner: string;
  repositoryName: string;
  targetBranch: string;
  destinationFolder: string;
};

export const useFigmaStore = defineStore("figma", {
  state: () => ({
    boards: [],

    clientStorage: {
      // Asset configurations
      exportFormat: "SVG" as ExportableFormat,
      rtlEnabled: false,
      selectedBoardId: "",
      selectedRTLBoardId: "",

      // Github configurations
      accessToken: "",
      repositoryName: "",
      repositoryOwner: "",
      targetBranch: "",
      destinationFolder: "",
    },
  }),

  getters: {
    allBoards: (state) => state.boards,

    storage: (state) => state.clientStorage,
  },

  actions: {
    /** @todo add typing for figma board object */
    setBoards(boards: any) {
      this.boards = boards;
    },

    /** Defines a new value for the entire clientStorage object */
    setClientStorage(clientStorage: typeof this.clientStorage) {
      this.clientStorage = clientStorage;
    },

    /** Updates the value of a specific field of the figma client storage */
    updateClientStorageField(field: keyof ClientStorage, value: any) {
      Object.assign(this.clientStorage, { [field]: value });

      // Propagates the event to the Figma "back-end" handler
      parent.postMessage(
        {
          pluginMessage: {
            event: "update-client-storage-field",
            field,
            value,
          },
        },
        "*"
      );
    },
  },
});
