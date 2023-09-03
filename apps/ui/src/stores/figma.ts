import { defineStore } from 'pinia'
import type {
  ClientStorage,
  ExportableFormat,
  VueProp,
  VuePropMap,
} from '../../../../types'

export const useFigmaStore = defineStore('figma', {
  state: () => ({
    currentPage: {} as PageNode,

    clientStorage: {
      // Asset configurations
      exportFormat: 'SVG' as ExportableFormat,
      fileSuffix: '',
      rtlEnabled: false,
      createDefaultExportsJsFile: false,
      createDefaultExportsTsFile: false,
      selectedPageId: '',
      selectedBoardId: '',
      selectedRTLPageId: '',
      selectedRTLBoardId: '',

      // Github configurations
      accessToken: '',
      repositoryName: '',
      repositoryOwner: '',
      targetBranch: '',
      destinationFolder: '',

      propOverrides: {
        name: {
          visible: false,
        },
      },
    } as ClientStorage,

    availableProps: {} as VuePropMap,

    /** Defines if the export process is in progress or not */
    exporting: false,
  }),

  getters: {
    pages: state => state.currentPage.parent?.children,

    boards: state => {
      if (!state.currentPage || !state.currentPage.parent?.children) return []

      return (
        state.currentPage.parent?.children.find(
          page => page.id === state.clientStorage.selectedPageId
        ) as unknown as PageNode
      ).children
    },

    rtlBoards: state => {
      if (!state.currentPage || !state.currentPage.parent?.children) return []

      return (
        state.currentPage.parent?.children.find(
          page => page.id === state.clientStorage.selectedRTLPageId
        ) as unknown as PageNode
      ).children
    },

    storage: state => state.clientStorage,
  },

  actions: {
    /** Defines a new value for the entire currentPage object */
    setCurrentPage(currentPage: PageNode) {
      this.currentPage = currentPage
    },

    /** Defines a new value for the entire clientStorage object */
    setClientStorage(clientStorage: typeof this.clientStorage) {
      this.clientStorage = clientStorage
    },

    /** Defines the available props retrieved from figma */
    setAvailableProps(props: VuePropMap) {
      this.availableProps = props
    },

    setDefaultClientStorageValues() {
      if (
        !this.clientStorage.selectedPageId ||
        this.clientStorage.selectedPageId === '-1'
      ) {
        this.clientStorage.selectedPageId = this.currentPage.id
      }

      if (
        !this.clientStorage.selectedBoardId ||
        this.clientStorage.selectedBoardId === '-1'
      ) {
        this.clientStorage.selectedBoardId = this.boards[0].id
      }
    },

    /** Updates the value of a specific field of the figma client storage */
    updateClientStorageField(
      field: keyof ClientStorage,
      value: string | number | boolean
    ) {
      Object.assign(this.clientStorage, { [field]: value })

      // Propagates the event to the Figma "back-end" handler
      parent.postMessage(
        {
          pluginMessage: {
            event: 'update-client-storage-field',
            field,
            value,
          },
        },
        '*'
      )
    },

    updateAvailablePropVisibility(
      propName: keyof typeof this.availableProps,
      visibility: boolean
    ) {
      if (!this.clientStorage.propOverrides[propName]) {
        this.clientStorage.propOverrides[propName] = {
          defaultValue: this.availableProps[propName].defaultValue || ''
        } as VueProp
      }

      this.clientStorage.propOverrides[propName].visible = visibility
      this.availableProps[propName].visible = visibility

      // Propagates the event to the Figma "back-end" handler
      parent.postMessage(
        {
          pluginMessage: {
            event: 'update-client-storage-field',
            field: 'propOverrides',
            value: JSON.parse(JSON.stringify(this.clientStorage.propOverrides)),
          },
        },
        '*'
      )
    },

    updateAvailablePropDefaultValue(
      propName: keyof typeof this.availableProps,
      defaultValue: string
    ) {
      if (!this.clientStorage.propOverrides[propName]) {
        this.clientStorage.propOverrides[propName] = {
          visible: this.availableProps[propName].visible || true,
        } as VueProp
      }

      this.clientStorage.propOverrides[propName].defaultValue = defaultValue
      this.availableProps[propName].defaultValue = defaultValue

      // Propagates the event to the Figma "back-end" handler
      parent.postMessage(
        {
          pluginMessage: {
            event: 'update-client-storage-field',
            field: 'propOverrides',
            value: JSON.parse(JSON.stringify(this.clientStorage.propOverrides)),
          },
        },
        '*'
      )
    },

    setExporting(exporting: boolean) {
      this.exporting = exporting
    },
  },
})
