# Text Sender

Text Sender — fullstack-приложение для работы с текстовыми блоками и комментариями.

## Что внутри
- **Backend:** FastAPI + SQLAlchemy (async) + PostgreSQL.
- **Frontend:** React + TypeScript + Vite (сборка и раздача через Nginx).
- **Инфраструктура:** Docker Compose (3 сервиса: `db`, `backend`, `frontend`).

## Структура проекта
- `app/` — backend API и бизнес-логика.
- `alembic/` — миграции БД.
- `frontend/` — клиентское приложение.
- `Dockerfile.backend` — образ backend.
- `frontend/Dockerfile` — образ frontend.
- `docker-compose.yml` — оркестрация сервисов.

---

## Быстрый запуск (рекомендуется)

### Требования
- Docker Desktop (или Docker Engine + Compose plugin)
- Команда `docker compose` должна быть доступна в терминале

### 1) Сборка и запуск
```bash
docker compose up --build
```

### 2) Проверить, что всё поднялось
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs

### 3) Остановить
```bash
docker compose down
```

### 4) Полная очистка (вместе с БД)
```bash
docker compose down -v
```

---

## Локальный запуск без Docker

### Backend
```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Создайте `.env` в корне:
```env
DATABASE_URL=postgresql+asyncpg://text_sender:text_sender@localhost:5432/text_sender
SECRET_KEY=super_secret_key_change_me
```

Запуск backend:
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
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

---

## Переменные окружения

### Backend
- `DATABASE_URL` — URL подключения к PostgreSQL.
- `SECRET_KEY` — секретный ключ JWT.

### Frontend
- `VITE_API_BASE_URL` — базовый URL backend API.

---

## Полезные Docker-команды

Запуск в фоне:
```bash
docker compose up -d --build
```

Логи:
```bash
docker compose logs -f
```

Пересоздать только frontend:
```bash
docker compose build frontend && docker compose up -d frontend
```

Открыть shell в backend-контейнере:
```bash
docker compose exec backend sh
```

Применить миграции:
```bash
docker compose exec backend alembic upgrade head
```

---

## Troubleshooting (Windows / Docker Desktop)

### 1) `version is obsolete`
В Compose V2 поле `version` не нужно. В этом проекте оно уже убрано из `docker-compose.yml`.

### 2) `unable to get image ... 500 Internal Server Error`
Обычно это проблема локального Docker Desktop/кэша. Выполните:

```bash
docker compose down --remove-orphans
docker image rm text-sender-frontend:latest text-sender-backend:latest
docker builder prune -f
docker compose up --build
```

Если не помогло:
1. Перезапустите Docker Desktop.
2. Выполните `docker version` и проверьте, что клиент и сервер отвечают.
3. Обновите Docker Desktop до актуальной версии.

### 3) Frontend не видит backend
Проверьте, что фронт собран с правильным `VITE_API_BASE_URL`:
- в Docker Compose используется `http://localhost:8000`;
- локально — в `frontend/.env`.

