import API from './Api'
import Blobs from './services/Blobs'
import Trees from './services/Trees'
import Commits from './services/Commits'
import Refs from './services/Refs'
import {
  GithubConnectorDto,
  CreateBlobDto,
  NewBranchDto,
  NewPullRequestDto,
  ExportFilesDto,
  File,
} from './types'
import type { GetRefEndpoint } from './services/Refs'
import Pulls from './services/Pulls'

export default class GithubConnector {
  private repositoryOwner
  private repositoryName

  constructor(params: GithubConnectorDto) {
    if (!params.accessToken)
      throw new Error('Missing required Github authentication token')

    this.repositoryOwner = params.repositoryOwner
    this.repositoryName = params.repositoryName

    API.authenticate(params.accessToken)
  }

  /// Blob methods
  async createFile({
    name, extension, content, encoding 
  }: CreateBlobDto) {
    const file = await Blobs.createBlob({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      content,
      encoding,
    })

    return {
      name,
      extension,
      url: file?.url,
      sha: file?.sha,
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

  async openPullRequest({ baseBranch, headBranch }: NewPullRequestDto) {
    if (!headBranch) throw new Error('Missing required head branch name parameter.')
    if (!baseBranch) throw new Error('Missing required base branch name parameter.')

    const pullRequest = Pulls.createPullRequest({
      owner: this.repositoryOwner,
      repo: this.repositoryName,
      draft: false,
      base: baseBranch,
      head: headBranch,
      body: 'example pull request',
      title: 'feat(assets): update exported assets from figma',
    })

    return pullRequest
  }

  async exportFiles({
    baseBranchName,
    headBranchName,
    components,
    extension,
    destinationFolder,
    commitMessage,
  }: ExportFilesDto) {
    const files: File[] = []

    const componentNames = Object.keys(components)
    for (let i = 0; i < componentNames.length; i++) {
      const componentName = componentNames[i]
      const component = components[componentName]

      // note: this can't be fully paralelized because of a browser
      //       simultaneous request rate limiter.
      //       @TODO: Split this into chunks and perform X requests in parallel at a time
      const file = await this.createFile({
        name: componentName,
        extension: extension,
        content: component,
        encoding: 'utf-8',
      })

      files.push(file)
    }

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
      })
    }
  }
}
