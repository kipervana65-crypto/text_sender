# Text Sender

## Настройка `.env`

1. Скопируйте шаблон:

```bash
cp .env.example .env
```

2. Заполните SMTP-переменные для отправки кода подтверждения email через Gmail:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

> `SMTP_PASSWORD` — это **App Password** Google, не обычный пароль от аккаунта.

3. При необходимости скорректируйте:
- `DATABASE_URL`
- `SECRET_KEY`
- `VITE_API_BASE_URL`

## Подтверждение email

После регистрации пользователь должен:
1. Открыть страницу подтверждения email.
2. Отправить код на Gmail.
3. Ввести 6-значный код из письма.

Пока email не подтверждён, доступ к защищённым эндпоинтам будет закрыт.
