import { ApiError } from '../types/api';

const statusMessages: Record<number, string> = {
  401: 'Сессия истекла, пожалуйста войдите снова',
  403: 'У вас нет доступа',
  404: 'Контент не найден',
  500: 'Ошибка сервера, попробуйте позже',
};

export const getUserFriendlyError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.status === 401 && error.endpoint === '/auth/token') {
      return error.message || 'Неверный email или пароль';
    }

    if (error.status === 400) {
      return error.message || 'Неверные данные';
    }

    if (typeof error.status === 'number' && statusMessages[error.status]) {
      return statusMessages[error.status];
    }

    return error.message || 'Произошла неизвестная ошибка';
  }

  if (error instanceof TypeError) {
    return 'Нет соединения с сервером';
  }

  return 'Произошла неизвестная ошибка';
};
