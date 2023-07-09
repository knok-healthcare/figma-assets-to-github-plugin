export type ExportFormat = "SVG" | "Vue";

export type ClientStorage = {
  exportFormat: ExportFormat;
  rtlEnabled: boolean;
  selectedBoardId: string;
  selectedRTLBoardId: string;
  accessToken: string;
  repositoryName: string;
  repositoryOwner: string;
  targetBranch: string;
  destinationFolder: string;
};
