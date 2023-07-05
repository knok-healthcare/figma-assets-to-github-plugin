export type GithubConnectorDto = {
  repositoryOwner: string;
  repositoryName: string;
  accessToken: string;
};

export type NewBranchDto = {
  /** The name of the branch (without refs/heads) */
  branchName: string;
  /** The name of the "source" for the new branch (where the new branch will be checked-out from) */
  baseBranchName: string;
};

export type CreateBlobDto = {
  name: string;
  extension: string;
  content: string;
  encoding: "utf-8";
};

export type NewPullRequestDto = {
  baseBranch: string;
  headBranch: string;
};
