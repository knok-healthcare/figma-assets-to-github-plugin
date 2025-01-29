import type { ClientStorage } from '../../../../types'

export const ClientStorageProps: {
  name: keyof ClientStorage
  defaultValue: string | boolean | number | object
}[] =
[
  {
    name: 'pluginConfigs',
    defaultValue: [],
  },
]
