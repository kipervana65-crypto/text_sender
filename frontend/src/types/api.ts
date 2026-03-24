export interface ApiErrorPayload {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status?: number;
  endpoint: string;
  payload?: unknown;
  response?: unknown;

  constructor(message: string, endpoint: string, status?: number, payload?: unknown, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.endpoint = endpoint;
    this.payload = payload;
    this.response = response;
  }
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface CreateBlockPayload {
  title: string;
  text: string;
}

export interface BlockResponse {
  id: string;
  title: string;
  text: string;
  url_block: string;
  created_at: string;
}

export interface CreateCommentPayload {
  comment: string;
}

export interface CommentResponse {
  id: number;
  comment: string;
  created_at: string;
  is_active: boolean;
  username: string;
}

export interface CommentListResponse {
  items: CommentResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ThreadedComment extends CommentResponse {
  replies: ThreadedComment[];
}
