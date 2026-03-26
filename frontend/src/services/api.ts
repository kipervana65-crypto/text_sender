import {
  ApiError,
  BlockResponse,
  CommentListResponse,
  CommentResponse,
  CreateBlockPayload,
  CreateCommentPayload,
  RegisterPayload,
  TokenResponse,
  UserResponse,
} from '../types/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://153.80.251.221:8000";
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = 'text_sender_refresh_token';
type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  headers?: HeadersInit;
};

const parseErrorMessage = (responseData: unknown): string => {
  if (typeof responseData === 'string') return responseData;
  if (responseData && typeof responseData === 'object') {
    const obj = responseData as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    if (Array.isArray(obj.detail) && obj.detail.length > 0) {
      const first = obj.detail[0] as Record<string, unknown>;
      if (typeof first?.msg === 'string') return first.msg;
    }
    if (typeof obj.message === 'string') return obj.message;
  }
  return 'Ошибка при выполнении запроса';
};

const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { method = 'GET', body, auth = false, headers = {} } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders = new Headers(headers);
  if (body && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body:
        body instanceof FormData || body instanceof URLSearchParams
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });

    const contentType = response.headers.get('Content-Type') ?? '';
    const responseData = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = parseErrorMessage(responseData);
      const apiError = new ApiError(message, endpoint, response.status, body, responseData);
      console.error('[API ERROR]', {
        endpoint,
        payload: body,
        status: response.status,
        response: responseData,
      });
      throw apiError;
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error('[NETWORK ERROR]', {
      endpoint,
      payload: body,
      response: error,
    });

    throw new ApiError('Нет соединения с сервером', endpoint, undefined, body, error);
  }
};

export const tokenStorage = {
  save: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),
};

export const api = {
  register: (payload: RegisterPayload) => request<UserResponse>('/auth/register', { method: 'POST', body: payload }),

  login: (identifier: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', identifier);
    formData.append('password', password);

    return request<TokenResponse>('/auth/token', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
  },

  me: () => request<UserResponse>('/auth/me', { auth: true }),

  createBlock: (payload: CreateBlockPayload) => request<BlockResponse>('/blocks/create_block', { method: 'POST', body: payload, auth: true }),

  updateBlock: (id: string, payload: CreateBlockPayload) =>
    request<BlockResponse>(`/blocks/update_block?id=${id}`, { method: 'PUT', body: payload, auth: true }),

  deleteBlock: (id: string) => request<{ message: string }>(`/blocks/delete_block?id=${id}`, { method: 'DELETE', auth: true }),

  getBlocks: () => request<BlockResponse[]>('/blocks/text_blocks', { auth: true }),

  getBlock: (id: string) => request<BlockResponse>(`/blocks/text_block?uuid=${id}`),

  getComments: (id: string, page = 1, pageSize = 20, parentId?: number) => {
    const params = new URLSearchParams({
      id_block: id,
      page: String(page),
      page_size: String(pageSize),
    });

    if (typeof parentId === 'number') {
      params.set('parent_id', String(parentId));
    }

    return request<CommentListResponse>(`/comment/get_comments?${params.toString()}`);
  },


  createComment: (blockId: string, payload: CreateCommentPayload, parentId?: number) => {
    const params = new URLSearchParams({ id_block: blockId });
    if (typeof parentId === 'number') {
      params.set('parent_id', String(parentId));
    }

    return request<CommentResponse>(`/comment/create?${params.toString()}`, { method: 'POST', body: payload, auth: true });
  },

  updateComment: (commentId: number, payload: CreateCommentPayload) =>
    request<CommentResponse>(`/comment/update?id_comment=${commentId}`, { method: 'PUT', body: payload, auth: true }),

  deleteComment: (commentId: number) =>
    request<{ message: string }>(`/comment/delete?id_comment=${commentId}`, { method: 'DELETE', auth: true }),
};
