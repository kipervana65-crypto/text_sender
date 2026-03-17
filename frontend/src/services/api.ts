export type ApiError = {
  status: number
  message: string
}

export type UserResponse = {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
}

export type TokenResponse = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type Block = {
  id: string
  title: string
  text: string
  url_block: string
  created_at: string
}

export type Comment = {
  id: number
  comment: string
  created_at: string
  is_active: boolean
  username: string
}

export type CommentList = {
  items: Comment[]
  total: number
  page: number
  page_size: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers })
  if (!response.ok) {
    let message = response.statusText
    try {
      const payload = await response.json()
      message = payload.detail ?? payload.message ?? JSON.stringify(payload)
    } catch {
      // ignore
    }
    throw { status: response.status, message } satisfies ApiError
  }
  return (await response.json()) as T
}

export const register = (email: string, password: string, username: string) =>
  request<UserResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, username }),
  })

export const login = (email: string, password: string) => {
  const body = new URLSearchParams({ username: email, password })
  return request<TokenResponse>('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}

export const getMe = (token: string) => request<UserResponse>('/auth/me', {}, token)

export const createBlock = (token: string, title: string, text: string) =>
  request<Block>('/blocks/create_block', {
    method: 'POST',
    body: JSON.stringify({ title, text }),
  }, token)

export const listBlocks = (token: string) => request<Block[]>('/blocks/text_blocks', {}, token)

export const createComment = (token: string, idBlock: string, comment: string) =>
  request<Comment>(`/comment/create?id_block=${encodeURIComponent(idBlock)}`, {
    method: 'POST',
    body: JSON.stringify({ comment }),
  }, token)

export const getComments = (idBlock: string, page = 1, pageSize = 20) =>
  request<CommentList>(`/comment/get_comments?id_block=${encodeURIComponent(idBlock)}&page=${page}&page_size=${pageSize}`)
