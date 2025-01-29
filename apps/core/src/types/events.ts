import { PluginConfig } from "../../../../types"

export type PostMessageEvent = {
  event: 'update-plugin-configs' | 'get-properties-from-page' | 'export-assets'
  data: string | null
  field: string | null
  value: string | boolean | number
  pageId: string | null
}
