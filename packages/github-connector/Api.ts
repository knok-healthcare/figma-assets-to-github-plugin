import config from "./config/github";

const defaultHeaders = {
  Authorization: "",
  "Content-Type": "application/json",
};

export default {
  headers: {
    Authorization: "",
    "Content-Type": "application/json",
  },

  authenticate(accessToken: string) {
    if (!accessToken)
      throw new Error("Missing required Github authentication token");

    this.headers.Authorization = "Bearer " + accessToken;
  },

  async request<T>(url: string, options: RequestInit): Promise<T> {
    const headers = Object.assign(this.headers, options.headers);

    const response = await fetch(`${config.api.url}/${url}`, {
      method: options.method,
      body: options.body,
      headers,
    });

    if (!response.ok) throw new Error(await response.json());

    return (await response.json()) as T;
  },
};
