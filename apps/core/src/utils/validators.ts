import type { ClientStorage } from '../../../../types'

export const checkRequiredDataForExport = (payload: ClientStorage) => {
  const missingValueMessage = (fieldName: string) =>
    `Missing required value for field "${fieldName}". Please fill in the field and try again.`

  // Asset Fields
  if (!payload.exportFormat) throw new Error(missingValueMessage('Export format'))
  if (!payload.selectedPageId) throw new Error(missingValueMessage('Page'))
  if (!payload.selectedBoardId) throw new Error(missingValueMessage('Board'))
  if (payload.rtlEnabled) {
    if (!payload.selectedRTLPageId)
      throw new Error(missingValueMessage('Page with RTL variants'))
    if (!payload.selectedRTLBoardId)
      throw new Error(missingValueMessage('Board with RTL variants'))
  }

  // Github Fields
  if (!payload.accessToken) throw new Error(missingValueMessage('Github access token'))
  if (!payload.repositoryOwner) throw new Error(missingValueMessage('Repository Owner'))
  if (!payload.repositoryName) throw new Error(missingValueMessage('Repository Name'))
  if (!payload.destinationFolder)
    throw new Error(missingValueMessage('Destination Folder'))
}
