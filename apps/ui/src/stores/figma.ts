import { defineStore } from 'pinia'

export const useFigmaStore = defineStore('figma', {
  state: () => {
    return {
      currentPage: {} as PageNode,
      pages: [] as PageNode[],
      assets: [] as SceneNode[],
      properties: {} as ComponentPropertyDefinitions,
      /** Defines if the export process is in progress or not */
      exporting: false,
    }
  },

  actions: {
    setCurrentPage(currentPage: PageNode) {
      this.currentPage = currentPage
    },

    setPages(pages: PageNode[]) {
      this.pages = pages
    },

    setAssets(assets: SceneNode[]) {
      this.assets = assets
    },

    setAssetsFromPage(page: PageNode) {
      this.assets = page.children?.filter(child =>
        child.type === 'COMPONENT' ||
        child.type === 'COMPONENT_SET'
      )
      console.log(this.assets)
    },

    setPropertiesFromPageAssets(properties: ComponentPropertyDefinitions) {
      this.properties = properties
    },

    setExporting(exporting: boolean) {
      this.exporting = exporting
    },
  },
})
