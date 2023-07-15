import { ClientStorageProps } from '../config/storage'

/** Searches the client storage for the saved values of the plugin */
export async function getStoredValues() {
  const values = {} as Record<string, unknown>

  for (let i = 0; i < ClientStorageProps.length; i++) {
    const prop = ClientStorageProps[i]
    const value = await figma.clientStorage.getAsync(prop.name)

    values[prop.name] = value || prop.defaultValue
  }

  return values
}

/** Returns all panels inside the selected figma page */
export function getAvailablePanels() {
  return figma.currentPage.children as ComponentSetNode[]
}

/** Get all components inside a specific panel */
export function getComponentsFromPanel(panel: ComponentSetNode) {
  return panel.children as ComponentNode[]
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
