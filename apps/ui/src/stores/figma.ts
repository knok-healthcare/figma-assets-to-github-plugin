import { defineStore } from 'pinia'

export const useFigmaStore = defineStore('figma', {
  state: () => ({
    currentPage: {} as PageNode,
    assets: [] as SceneNode[],
    /** Defines if the export process is in progress or not */
    exporting: false,
  }),

  getters: {
    pages: state => state.currentPage.parent?.children,
  },

  actions: {
    /** Defines a new value for the entire currentPage object */
    setCurrentPage(currentPage: PageNode) {
      Object.assign(this.currentPage, currentPage)
      Object.assign(this.assets, currentPage.children?.filter(child =>
        child.type === 'COMPONENT' ||
        child.type === 'COMPONENT_SET'
      ))
    },

    setExporting(exporting: boolean) {
      this.exporting = exporting
    },
  },
})
