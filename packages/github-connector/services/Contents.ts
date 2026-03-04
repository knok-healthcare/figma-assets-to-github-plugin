import { Endpoints } from '@octokit/types'
import API from '../Api'

export type GetContentEndpoint = Endpoints['GET /repos/{owner}/{repo}/contents/{path}']

export default {
  getContent: async (
    params: GetContentEndpoint['parameters']
  ): Promise<GetContentEndpoint['response']['data']> => {
    type ResponseType = GetContentEndpoint['response']['data']

    const options: RequestInit & { query?: Record<string, string> } = {
      method: 'GET',
    }

    if (params.ref) {
      options.query = { ref: params.ref }
    }

    const response = await API.request<ResponseType>(
      `repos/${params.owner}/${params.repo}/contents/${params.path}`,
      options
    )

    return response
  },
}
