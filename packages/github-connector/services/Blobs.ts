import { Endpoints } from "@octokit/types";
import API from "../Api";

export type CreateBlobEndpoint =
  Endpoints["POST /repos/{owner}/{repo}/git/blobs"];

export default {
  createBlob: async (params: CreateBlobEndpoint["parameters"]) => {
    type ResponseType = CreateBlobEndpoint["response"]["data"];
    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/blobs`,
      {
        method: "POST",
        body: JSON.stringify({
          content: params.content,
          encoding: params.encoding,
        }),
      }
    );

    return response;
  },
};
