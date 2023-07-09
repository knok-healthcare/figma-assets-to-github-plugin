import type { ClientStorage } from "../index.d";

export const checkRequiredDataForExport = (payload: ClientStorage) => {
  const missingValueMessage = (fieldName: string) =>
    `Missing required value for field "${fieldName}". Please fill in the field and try again.`;

  if (!payload.accessToken)
    throw new Error(missingValueMessage("Github access token"));

  if (!payload.repositoryOwner)
    throw new Error(missingValueMessage("Repository Owner"));

  if (!payload.repositoryName)
    throw new Error(missingValueMessage("Repository Name"));

  if (!payload.destinationFolder)
    throw new Error(missingValueMessage("Destination Folder"));
};
