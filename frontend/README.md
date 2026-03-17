# Text Sender Frontend

Frontend для backend API из этого репозитория.

## Стек
- Vite
- React + TypeScript
- Tailwind CSS
- React Router

## Переменные окружения
Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Доступные переменные:
- `VITE_API_BASE_URL` — базовый URL backend API (по умолчанию `http://127.0.0.1:8000`).

## Установка и запуск
```bash
npm install
npm run dev
```

## Сборка
```bash
npm run build
```

## Что реализовано
- `/login` — логин по email/password
- `/register` — регистрация
- `/` — создание текстового блока (только авторизованный пользователь)
- `/blocks/:id` — просмотр блока и комментариев, добавление комментария для авторизованных
- Хранение access/refresh токена в `localStorage`
- `Authorization: Bearer <token>` для защищенных запросов
- Глобальная обработка и логирование API-ошибок
- Error Boundary для UI-ошибок
