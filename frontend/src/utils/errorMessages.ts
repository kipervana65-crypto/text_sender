import { ApiError } from '../types/api';

const statusMessages: Record<number, string> = {
  401: 'Сессия истекла, пожалуйста войдите снова',
  403: 'У вас нет доступа',
  404: 'Контент не найден',
  500: 'Ошибка сервера, попробуйте позже',
};

const backendMessageMap: Record<string, string> = {
  'Email already registered': 'Пользователь с таким email уже существует',
  'Username already registered': 'Пользователь с таким username уже существует',
  'Incorrect email or password': 'Неверный email/username или пароль',
  'Email is not verified': 'Email не подтверждён. Подтвердите почту, чтобы войти.',
  'Email already verified': 'Email уже подтверждён',
  'Invalid verification code': 'Неверный код подтверждения',
  'user not found': 'Пользователь с таким email не найден',
  'the code was sent to the email': 'Код отправлен на почту',
  'email confirmed': 'Почта успешно подтверждена',
};

export const getUserFriendlyError = (error: unknown): string => {
  if (error instanceof ApiError) {
    if (error.message && backendMessageMap[error.message]) {
      return backendMessageMap[error.message];
    }

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
