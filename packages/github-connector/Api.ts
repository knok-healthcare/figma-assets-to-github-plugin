import config from './config/github'

export default {
  headers: {
    Authorization: '',
    'Content-Type': 'application/json',
  },

  authenticate(accessToken: string) {
    if (!accessToken) throw new Error('Missing required Github authentication token')

    this.headers.Authorization = 'Bearer ' + accessToken
  },

  async request<T>(
    url: string,
    options: RequestInit & { query?: Record<string, string> }
  ): Promise<T> {
    const query = options.query ? buildQuery(options.query) : ''
    const headers = Object.assign(this.headers, options.headers)

    const response = await fetch(`${config.api.url}/${url}` + query, {
      method: options.method,
      body: options.body,
      headers,
    })

    if (!response.ok) throw new Error(await response.json())

    return (await response.json()) as T
  },
}

function buildQuery(parameters: Record<string, string>) {
  return (
    '?' +
    Object.keys(parameters)
      .map(k => {
        return encodeURIComponent(k) + '=' + encodeURIComponent(parameters[k])
      })
      .join('&')
  )
}
