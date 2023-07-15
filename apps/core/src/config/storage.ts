import type { ClientStorage } from '../../../../types'

export const ClientStorageProps: {
  name: keyof ClientStorage
  defaultValue: string | boolean | number
}[] = [
  {
    name: 'exportFormat',
    defaultValue: 'SVG',
  },
  {
    name: 'selectedPageId',
    defaultValue: '',
  },
  {
    name: 'selectedBoardId',
    defaultValue: '',
  },
  {
    name: 'selectedRTLPageId',
    defaultValue: '',
  },
  {
    name: 'selectedRTLBoardId',
    defaultValue: '',
  },
  {
    name: 'destinationFolder',
    defaultValue: '',
  },
  {
    name: 'rtlEnabled',
    defaultValue: false,
  },
  {
    name: 'repositoryOwner',
    defaultValue: '',
  },
  {
    name: 'repositoryName',
    defaultValue: '',
  },
  {
    name: 'targetBranch',
    defaultValue: '',
  },
  {
    name: 'accessToken',
    defaultValue: '',
  },
]
