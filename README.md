# Text Sender

Text Sender — fullstack-приложение для текстовых блоков и комментариев.

## Что в проекте
- **Backend:** FastAPI + SQLAlchemy (async) + PostgreSQL
- **Frontend:** React + TypeScript + Vite
- **Запуск:** Docker Compose (db + backend + frontend)

## Быстрый запуск через Docker (рекомендуется)

### Требования
- Docker Desktop (или Docker Engine)
- Docker Compose V2 (`docker compose`)

### Запуск
```bash
docker compose up --build
```

### Доступные адреса
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs

### Остановка
```bash
docker compose down
```

### Остановка + удаление данных БД
```bash
docker compose down -v
```

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

## Важные переменные окружения

### Backend
- `DATABASE_URL` — URL подключения к PostgreSQL
- `SECRET_KEY` — секрет для JWT

### Frontend
- `VITE_API_BASE_URL` — URL backend API

## Troubleshooting

### Предупреждение `version is obsolete`
В Compose V2 поле `version` не требуется. В этом проекте оно не используется.

### Ошибка `unable to get image ... 500 Internal Server Error`
Попробуйте очистку и пересборку:

```bash
docker compose down --remove-orphans
docker builder prune -f
docker compose up --build
```
