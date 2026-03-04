import API from './Api'
import Blobs from './services/Blobs'
import Trees from './services/Trees'
import Commits from './services/Commits'
import Refs from './services/Refs'
import Contents from './services/Contents'
import {
  GithubConnectorDto,
  CreateBlobDto,
  NewBranchDto,
  NewPullRequestDto,
  ExportFilesDto,
  File,
} from './types'
import type { GetRefEndpoint } from './services/Refs'
import type { GetContentEndpoint } from './services/Contents'
import Pulls from './services/Pulls'
import RateLimiter from './rate-limiter'

export default class GithubConnector {
  private repositoryOwner
  private repositoryName
  private blobLimiter

  constructor(params: GithubConnectorDto) {
    if (!params.accessToken)
      throw new Error('Missing required Github authentication token')

    this.repositoryOwner = params.repositoryOwner
    this.repositoryName = params.repositoryName

    API.authenticate(params.accessToken)

    this.blobLimiter = new RateLimiter(20)
  }

  /// Blob methods
  async createFile({
    name, extension, content, encoding
  }: CreateBlobDto) {
    try {
      const file = (await this.blobLimiter.enqueue(Blobs.createBlob, {
        owner: this.repositoryOwner,
        repo: this.repositoryName,
        content,
        encoding,
      })) as { url: string; sha: string }

      return {
        name,
        extension,
        url: file?.url,
        sha: file?.sha,
      }
    } catch (error) {
      console.log('create file error: ', error)
      throw error
    }
  }

  async createFileTree(
    files: Array<{ name: string; extension: string; url: string; sha: string }>,
    destinationFolder: string,
    baseTreeSha: string
  ) {
    const tree = await Trees.createTree({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      tree: files.map(file => ({
        path: `${destinationFolder}/${file.name}.${file.extension}`,
        mode: '100644',
        type: 'blob',
        sha: file.sha,
      })),
      base_tree: baseTreeSha,
    })

    return tree
  }

  /// Commit methods
  async getCommit(commitSha: string) {
    const commit = await Commits.getCommit({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      ref: commitSha,
    })

    return commit
  }

  async createCommit(message: string, currentTreeSha: string, currentCommitSha: string) {
    const commit = await Commits.createCommit({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      message,
      tree: currentTreeSha,
      parents: [currentCommitSha],
    })

    return commit
  }

  /// Branch methods
  getBranchByName(
    branchName: string
  ): Promise<GetRefEndpoint['response']['data'] | null> {
    return new Promise(resolve => {
      Refs.getRef({
        owner: this.repositoryOwner,
        repo: this.repositoryName,
        ref: `heads/${branchName}`,
      })
        .then(response => {
          return resolve(response)
        })
        .catch(() => {
          return resolve(null)
        })
    })
  }

  async createOrUpdateBranch(branchName: string, commitSha: string) {
    const branch = await this.getBranchByName(branchName)
    if (!branch) {
      await Refs.createRef({
        owner: this.repositoryOwner,
        repo: this.repositoryName,
        ref: `refs/heads/${branchName}`,
        sha: commitSha,
      })
    } else {
      await Refs.updateRef({
        owner: this.repositoryOwner,
        repo: this.repositoryName,
        ref: `heads/${branchName}`,
        sha: commitSha,
        force: true,
      })
    }
  }

  async deleteBranch(branchName: string) {
    await Refs.deleteRef({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      ref: `heads/${branchName}`,
    })
  }

  async forceCreateBranch({ branchName, baseBranchName }: NewBranchDto) {
    const branch = await this.getBranchByName(branchName)
    if (branch) await this.deleteBranch(branchName)

    const baseBranch = await this.getBranchByName(baseBranchName)
    if (!baseBranch)
      throw new Error(
        'Specified base branch not found. Make sure the branch exists and try again.'
      )

    const createdBranch = await Refs.createRef({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      ref: `heads/${branchName}`,
      sha: baseBranch.object.sha,
    })

    return createdBranch
  }

  async getPullRequestsByBranchName(branchName: string) {
    if (!branchName) throw new Error('Missing required branch name parameter.')

    const pullRequests = Pulls.listPullRequests({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      state: 'open',
      head: `${this.repositoryOwner}:${branchName}`,
    })

    return pullRequests
  }

  async openPullRequest({ baseBranch, headBranch, files }: NewPullRequestDto) {
    if (!headBranch) throw new Error('Missing required head branch name parameter.')
    if (!baseBranch) throw new Error('Missing required base branch name parameter.')

    const pullRequestBody = `## 🦄 Figma Asset Export

### 🔍 Summary
This pull request contains your new/updated SVG assets from Figma.

### 📝 Details
- Exported assets: **${files.length}**
- Exported at: ${new Date().toISOString()}

### 📚 To do
- [ ] Ensure asset names are correct
- [ ] Ensure asset structure is correct
`

    const pullRequest = Pulls.createPullRequest({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      draft: false,
      base: baseBranch,
      head: headBranch,
      body: pullRequestBody,
      title: 'chore(assets): update exported assets from figma',
    })

    return pullRequest
  }

  /**
   * Lists all files in a directory from the repository.
   * Returns an array of file names (without extensions).
   */
  async getFilesFromDirectory(
    directoryPath: string,
    ref?: string
  ): Promise<string[]> {
    try {
      const params: GetContentEndpoint['parameters'] = {
        owner: this.repositoryOwner,
        repo: this.repositoryName,
        path: directoryPath,
      }

      if (ref) {
        params.ref = ref
      }

      const response = await Contents.getContent(params)

      if (!Array.isArray(response)) return []

      return response
        .filter((item: { type: string }) => item.type === 'file')
        .map((item: { name: string }) => {
          // Remove the file extension to get just the asset name
          const lastDotIndex = item.name.lastIndexOf('.')
          return lastDotIndex !== -1 ? item.name.substring(0, lastDotIndex) : item.name
        })
    } catch (error) {
      // Directory might not exist yet (first export)
      console.log('Directory not found, skipping:', error)
      return []
    }
  }

  /**
   * Generates the content for figma.types.ts containing a union type
   * of all asset names in the destination folder.
   * @param assetNames - Array of asset file names (without extensions)
   * @param suffixToStrip - Optional suffix to remove from each name in the union type
   */
  generateAssetTypesContent(assetNames: string[], suffixToStrip?: string): string {
    const uniqueNames = [...new Set(assetNames)]
      .filter(name => name !== 'figma.types' && name !== 'index')
      .map(name => {
        if (suffixToStrip && name.endsWith(suffixToStrip)) {
          return name.slice(0, -suffixToStrip.length)
        }
        return name
      })
      .filter(name => name.length > 0)
      .sort()

    if (uniqueNames.length === 0) {
      return `/**
 * Auto-generated by Figma Assets to Github Plugin
 * Do not edit this file manually.
 */
export type ExportedAssetName = never
`
    }

    const unionMembers = uniqueNames.map(name => `  | '${name}'`).join('\n')

    return `/**
 * Auto-generated by Figma Assets to Github Plugin
 * Do not edit this file manually.
 */
export type ExportedAssetName =
${unionMembers}
`
  }

  async exportFiles({
    baseBranchName,
    headBranchName,
    components,
    extension,
    destinationFolder,
    commitMessage,
    defaultExportsFile,
    suffixToAdd,
  }: ExportFilesDto) {
    const files: File[] = []

    const fileCreationResults = await Promise.all(
      Object.keys(components).map(componentName => {
        const component = components[componentName]

        return this.createFile({
          name: componentName,
          content: component,
          encoding: 'utf-8',
          extension,
        })
      })
    )

    for (let i = 0; i < fileCreationResults.length; i++) {
      const file = fileCreationResults[i]
      files.push(file)
    }

    if (defaultExportsFile) {
      const defaultExportsContent = Object.keys(components)
        .map(name => `export { default as ${name} } from './${name}.${extension}'`)
        .join('\n')

      const fileNameSplitted = defaultExportsFile.split('.')
      const fileExtension = fileNameSplitted.pop()
      const fileName = fileNameSplitted.join('.')

      const file = await this.createFile({
        name: fileName,
        extension: fileExtension || 'js',
        content: defaultExportsContent,
        encoding: 'utf-8',
      })

      files.push(file)
    }

    // Fetch existing files from the destination folder on the base branch
    const existingFileNames = await this.getFilesFromDirectory(
      destinationFolder,
      baseBranchName
    )

    // Merge existing file names with newly exported component names
    const allAssetNames = [
      ...new Set([...existingFileNames, ...Object.keys(components)]),
    ]

    // Generate and create the figma.types.ts file
    const assetTypesContent = this.generateAssetTypesContent(allAssetNames, suffixToAdd)
    const assetTypesFile = await this.createFile({
      name: 'figma.types',
      extension: 'ts',
      content: assetTypesContent,
      encoding: 'utf-8',
    })
    files.push(assetTypesFile)

    const baseBranch = await this.getBranchByName(baseBranchName)
    if (!baseBranch)
      throw new Error(
        'Specified base branch not found. Make sure the branch exists and try again.'
      )

    const fileTree = await this.createFileTree(
      files,
      destinationFolder,
      baseBranch?.object.sha
    )

    const commit = await this.createCommit(
      commitMessage,
      fileTree.sha,
      baseBranch.object.sha
    )

    await this.createOrUpdateBranch(headBranchName, commit.sha)

    const pullRequests = await this.getPullRequestsByBranchName(headBranchName)
    if (!pullRequests || pullRequests.length === 0) {
      return await this.openPullRequest({
        baseBranch: baseBranchName,
        headBranch: headBranchName,
        files: Object.keys(components),
      })
    }
  }
}
