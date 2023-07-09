import type { ClientStorage } from "../../../../types";

export type PostMessageEvent = {
  event: "update-client-storage-field" | "export-assets";
  data: ClientStorage | null;
  field: string | null;
  value: any;
};
