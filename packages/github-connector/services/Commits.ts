import { Endpoints } from '@octokit/types'
import API from '../Api'

export type GetCommitEndpoint = Endpoints['GET /repos/{owner}/{repo}/commits/{ref}']
export type CreateCommitEndpoint = Endpoints['POST /repos/{owner}/{repo}/git/commits']

export default {
  getCommit: async (params: GetCommitEndpoint['parameters']) => {
    type ResponseType = GetCommitEndpoint['response']['data']

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/commits/${params.ref}`,
      {
        method: 'GET',
      }
    )

    return response
  },

  createCommit: async (params: CreateCommitEndpoint['parameters']) => {
    type ResponseType = CreateCommitEndpoint['response']['data']

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/commits`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: params.message,
          tree: params.tree,
          parents: params.parents,
        }),
      }
    )

    return response
  },
}
