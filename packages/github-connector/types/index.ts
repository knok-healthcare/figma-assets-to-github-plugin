export type GithubConnectorDto = {
  /** The Github account that owns the repository */
  repositoryOwner: string
  /** Name of the github repository */
  repositoryName: string
  /** A github "Personal Access Token" with access to the specified repository */
  accessToken: string
}

export type NewBranchDto = {
  /** The name of the branch (without refs/heads) */
  branchName: string
  /** The name of the "source" for the new branch (where the new branch will be checked-out from) */
  baseBranchName: string
}

export type CreateBlobDto = {
  /** Name of the file that will be created */
  name: string
  /** Extension of the file that will be created */
  extension: string
  /** Body of the file */
  content: string
  /** File encoding */
  encoding: 'utf-8' | 'base64'
}

export type NewPullRequestDto = {
  /** Base branch of the pull request (where our pull-request will be merged to) */
  baseBranch: string
  /** Name of the new branch that has the updated assets from figma */
  headBranch: string
}

export type ExportFilesDto = {
  /** Base branch of the pull request (where our pull-request will be merged to) */
  baseBranchName: string
  /** Name of the new branch that has the updated assets from figma */
  headBranchName: string
  /** Defines what file extension to use for exporting our assets */
  extension: string
  /** Array of figma components to export */
  components: Record<string, string>
  /** Default commit message */
  commitMessage: string
  /**
   * The destination folder inside the target repository,
   * example: `src/assets/icons`.
   *
   * Note: **Cannot be an absolute path** (starting with a /).
   */
  destinationFolder: string
  /** Defines if the default exports file should be created or not */
  defaultExportsFile: string
}

export type File = {
  /** Name of the file that will be created */
  name: string
  /** Extension of the file that will be created */
  extension: string
  /** Blob SHA from Github, received after creation */
  sha: string
  /** Blob URL from Github, received after creation */
  url: string
}
