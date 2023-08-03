/**
 * Valid file formats for exporting
 *
 * @TODO: Add support for other formats (e.g. React, default web components, ...)
 */
export type ExportableFormat = "SVG" | "Vue";

/**
 * Application settings storied in
 * figma "clientStorage"
 */
export type ClientStorage = {
  /** Defines the format of the files that will be exported. */
  exportFormat: ExportableFormat
  /** A suffix to append to the end of the name of every file when exporting */
  fileSuffix: string
  /** Defines if the exported components should include RTL variants or not. */
  rtlEnabled: boolean
  /** The main figma page that contains the board with components to export. */
  selectedPageId: string
  /** The main board where the plugin will look for figma components to export. */
  selectedBoardId: string
  /** The figma page that contains the board with RTL variants of components to export. */
  selectedRTLPageId: string
  /** The board where the plugin will look for RTL variants of components to export. */
  selectedRTLBoardId: string
  /** A github "Personal Access Token" with permissions to the specified repository. */
  accessToken: string
  /** Github repository name. */
  repositoryName: string
  /** The github account that owns the repository. */
  repositoryOwner: string
  /** The base/target branch for our PR. */
  targetBranch: string
  /** The destination folder inside the repository where our assets will be exported to. */
  destinationFolder: string
}
