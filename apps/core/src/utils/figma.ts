export const PLUGIN_CONFIGS_STORAGE_KEY = 'pluginConfigs'

/** Searches the client storage for the saved values of the plugin */
export async function getStoredConfigs() {
  const value = await figma.clientStorage.getAsync(PLUGIN_CONFIGS_STORAGE_KEY)
  if (!value) return []

  return JSON.parse(value)
}

/** Saves the plugin configs to the client storage */
export async function setStoredConfigs(configs: string) {
  return await figma.clientStorage.setAsync(PLUGIN_CONFIGS_STORAGE_KEY, configs)
}

/** Returns all panels inside the selected figma page */
export function getAvailablePanels() {
  return figma.currentPage.children as ComponentSetNode[]
}

/** Returns all components */
export function getAllComponents() {
  const panels = getAvailablePanels()
  if (!panels) throw new Error('No panels were found in your current page.')

  return panels.flatMap(panel => {
    return getComponentsFromPanel(panel)
  })
}

/** Get all components inside specified panels by their panel id's */
export function getComponentsByPanelIds(ids: string[]) {
  const panels = getAvailablePanels().filter(panel => ids.includes(panel.id))
  if (!panels) throw new Error('Panels not found.')

  return panels.flatMap(panel => {
    return getComponentsFromPanel(panel)
  })
}

/** Gets all components inside a specific board from a page */
export function getComponentsByPageAndBoardId(pageId: string, boardId: string) {
  if (!pageId) throw new Error('Missing required "pageId" parameter.')
  if (!boardId) throw new Error('Missing required "boardId" parameter.')

  const selectedPage = figma.currentPage.parent?.children.find(
    page => page.id === pageId
  ) as unknown as PageNode
  if (!selectedPage) throw new Error('Specified page not found')

  const selectedBoard = selectedPage.children.find(
    board => board.id === boardId
  ) as ComponentSetNode
  if (!selectedBoard) throw new Error('Specified board not found')

  const components = getComponentsFromPanel(selectedBoard)

  return components
}

/** Get all components inside a specific panel */
export function getComponentsFromPanel(panel: ComponentSetNode) {
  return panel.children as ComponentNode[]
}
