import { Endpoints } from '@octokit/types'
import API from '../Api'

export type CreateTreeEndpoint = Endpoints['POST /repos/{owner}/{repo}/git/trees']

export default {
  createTree: async (params: CreateTreeEndpoint['parameters']) => {
    type ResponseType = CreateTreeEndpoint['response']['data']

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/git/trees`,
      {
        method: 'POST',
        body: JSON.stringify({
          tree: params.tree,
          base_tree: params.base_tree,
        }),
      }
    )

    return response
  },
}
