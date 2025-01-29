import type { PluginConfig } from '../../../../types'

export const checkRequiredDataForExport = (data: PluginConfig) => {
  const missingValueMessage = (fieldName: string) =>
    `Missing required value for field "${fieldName}". Please fill in the field and try again.`

  // Figma settings
  if (!data.settings.figma.pageId) throw new Error(missingValueMessage('Page'))
  if (!data.settings?.figma?.assetIds?.length) throw new Error(missingValueMessage('Assets'))

  // Code Settings
  if (!data.settings.code.format) throw new Error(missingValueMessage('Format'))

  // Github Settings
  if (!data.settings.github.accessToken) throw new Error(missingValueMessage('Access token'))
  if (!data.settings.github.repository) throw new Error(missingValueMessage('Repository'))
  if (!data.settings.github.branch) throw new Error(missingValueMessage('Base Branch'))
  if (!data.settings.github.path) throw new Error(missingValueMessage('Destination Folder'))
}
