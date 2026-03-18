# Text Sender

Text Sender — fullstack-приложение для работы с текстовыми блоками и комментариями.

## Что умеет проект
- Регистрация и авторизация пользователей (JWT access/refresh).
- Создание, обновление, удаление и просмотр текстовых блоков.
- Комментирование блоков с пагинацией комментариев.
- SPA-фронтенд на React + Vite для работы с API.

## Стек
- **Backend:** FastAPI, SQLAlchemy (async), PostgreSQL, Alembic.
- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **Инфраструктура:** Docker, Docker Compose.

## Структура
- `app/` — backend API и бизнес-логика.
- `alembic/` — миграции БД.
- `frontend/` — клиентское приложение.
- `docker-compose.yml` — запуск всего проекта в контейнерах.

---

## Быстрый запуск через Docker (рекомендуется)

### Требования
- Docker
- Docker Compose (плагин `docker compose`)

### Запуск
```bash
docker compose up --build
```

После запуска:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/docs

Остановка:
```bash
docker compose down
```

Остановка с удалением тома БД:
```bash
docker compose down -v
```

---

## Локальный запуск без Docker

### 1) Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Создайте `.env` в корне проекта:
```env
DATABASE_URL=postgresql+asyncpg://text_sender:text_sender@localhost:5432/text_sender
SECRET_KEY=super_secret_key_change_me
```

Запуск backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
```

Создайте `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
```

Запуск frontend:
```bash
npm run dev
```

По умолчанию frontend будет доступен на http://localhost:5173.

---

## Переменные окружения

### Backend
- `DATABASE_URL` — строка подключения к PostgreSQL (обязательная).
- `SECRET_KEY` — секретный ключ для подписи JWT (обязательный).

### Frontend
- `VITE_API_BASE_URL` — базовый URL backend API.

---

## Полезные команды Docker

Пересобрать и запустить в фоне:
```bash
docker compose up -d --build
```

Посмотреть логи:
```bash
docker compose logs -f
```

Применить миграции вручную (если потребуется):
```bash
docker compose exec backend alembic upgrade head
```

