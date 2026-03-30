# Text Sender

## Работа с backend только через `uv`

Ниже минимальный сценарий, чтобы запустить backend локально.

### 1) Установи `uv`

```bash
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# проверить
uv --version
```

### 2) Подготовь переменные окружения

```bash
cp .env.example .env
```

Заполни SMTP-переменные для отправки кода подтверждения email через Gmail:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

> `SMTP_PASSWORD` — это **App Password** Google, не обычный пароль от аккаунта.

При необходимости скорректируй:
- `DATABASE_URL`
- `SECRET_KEY`
- `VITE_API_BASE_URL`

### 3) Установи зависимости backend через `uv`

```bash
uv sync
```

### 4) Прогони миграции

```bash
uv run alembic upgrade head
```

### 5) Запусти backend

```bash
uv run uvicorn app.main:app --reload
```

Backend будет доступен на `http://127.0.0.1:8000`.

---

## Частые команды (`uv`)

```bash
# запустить любой python-скрипт в окружении проекта
uv run python script.py

# откат/перенакат миграций
uv run alembic downgrade -1
uv run alembic upgrade head
```

---

## Docker

`Dockerfile.backend` и `docker-compose.yml` уже настроены на запуск backend через `uv run`.

```bash
docker compose up --build
```

---

## Подтверждение email

После регистрации пользователь должен:
1. Открыть страницу подтверждения email.
2. Отправить код на Gmail.
3. Ввести 6-значный код из письма.

Пока email не подтверждён, доступ к защищённым эндпоинтам будет закрыт.
