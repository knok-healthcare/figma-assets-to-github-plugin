import { Endpoints } from '@octokit/types'
import API from '../Api'

export type ListPullEndpoint = Endpoints['GET /repos/{owner}/{repo}/pulls']
export type CreatePullEndpoint = Endpoints['POST /repos/{owner}/{repo}/pulls']

export default {
  listPullRequests: async (params: ListPullEndpoint['parameters']) => {
    type ResponseType = ListPullEndpoint['response']['data']

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/pulls`,
      {
        method: 'GET',
        query: {
          state: params.state as string,
          head: params.head as string,
        },
      }
    )

    return response
  },

  createPullRequest: async (params: CreatePullEndpoint['parameters']) => {
    type ResponseType = CreatePullEndpoint['response']['data']

    // @TODO: Allow to configure pull request template in the UI (new Pull Request tab)
    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/pulls`,
      {
        method: 'POST',
        body: JSON.stringify({
          title: params.title,
          draft: params.draft,
          base: params.base,
          head: params.head,
          body: params.body,
        }),
      }
    )

    return response
  },
}
