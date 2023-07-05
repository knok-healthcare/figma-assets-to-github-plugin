import { Endpoints } from "@octokit/types";
import API from "../Api";

export type GetRefEndpoint =
  Endpoints["GET /repos/{owner}/{repo}/git/ref/{ref}"];

export type CreateRefEndpoint =
  Endpoints["POST /repos/{owner}/{repo}/git/refs"];
export type UpdateRefEndpoint =
  Endpoints["PATCH /repos/{owner}/{repo}/git/refs/{ref}"];
export type DeleteRefEndpoint =
  Endpoints["DELETE /repos/{owner}/{repo}/git/refs/{ref}"];

export default {
  getRef: async (params: GetRefEndpoint["parameters"]) => {
    type ResponseType = GetRefEndpoint["response"]["data"];

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/ref/${params.ref}`,
      {
        method: "GET",
      }
    );

    return response;
  },

  createRef: async (params: CreateRefEndpoint["parameters"]) => {
    type ResponseType = CreateRefEndpoint["response"]["data"];

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/refs`,
      {
        method: "POST",
        body: JSON.stringify({
          ref: params.ref,
          sha: params.sha,
        }),
      }
    );

    return response;
  },

  updateRef: async (params: UpdateRefEndpoint["parameters"]) => {
    type ResponseType = UpdateRefEndpoint["response"]["data"];

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/refs/${params.ref}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          sha: params.sha,
          force: params.force,
        }),
      }
    );

    return response;
  },

  deleteRef: async (params: DeleteRefEndpoint["parameters"]) => {
    type ResponseType = DeleteRefEndpoint["response"]["data"];

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/refs/${params.ref}`,
      {
        method: "DELETE",
      }
    );

    return response;
  },
};
