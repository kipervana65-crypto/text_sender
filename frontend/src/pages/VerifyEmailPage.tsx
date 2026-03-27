import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from '../components/StatusMessage';

const isGmailEmail = (value: string) => /@gmail\.com$/i.test(value);

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialEmailFromQuery = useMemo(() => new URLSearchParams(location.search).get('email') ?? '', [location.search]);

  useEffect(() => {
    if (!initialEmailFromQuery) return;
    setEmail(initialEmailFromQuery);
  }, [initialEmailFromQuery]);

  const sendCode = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Введите email, чтобы отправить код подтверждения');
      return;
    }

    if (!isGmailEmail(trimmedEmail)) {
      setError('Для подтверждения поддерживаются только Gmail-адреса (@gmail.com)');
      return;
    }

    setSendingCode(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.sendVerificationCode(trimmedEmail);
      setSuccessMessage('Код отправлен на почту. Проверьте входящие и папку «Спам».');
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedCode = code.trim();

    if (!trimmedEmail || !trimmedCode) {
      setError('Заполните email и код подтверждения');
      return;
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('Код подтверждения должен состоять из 6 цифр');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await api.verifyEmail(trimmedEmail, trimmedCode);
      setSuccessMessage('Почта успешно подтверждена. Переадресуем на страницу входа...');
      setTimeout(() => navigate('/login'), 900);
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded border bg-white p-4">
      <h1 className="mb-2 text-xl font-semibold">Подтверждение email</h1>
      <p className="mb-4 text-sm text-slate-600">
        Укажите Gmail и введите код из письма, чтобы активировать аккаунт.
      </p>

      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <StatusMessage message={error} type="error" /> : null}
        {successMessage ? <StatusMessage message={successMessage} type="success" /> : null}

        <div>
          <label className="mb-1 block text-sm">Gmail</label>
          <input
            className="w-full rounded border px-3 py-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your_email@gmail.com"
            required
          />
        </div>

        <button
          className="w-full rounded border border-slate-300 px-4 py-2 text-slate-900 disabled:opacity-50"
          disabled={sendingCode}
          onClick={sendCode}
          type="button"
        >
          {sendingCode ? 'Отправляем код...' : 'Отправить код'}
        </button>

        <div>
          <label className="mb-1 block text-sm">Код подтверждения</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="6 цифр"
            required
          />
        </div>

        <button className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading}>
          {loading ? 'Проверяем...' : 'Подтвердить email'}
        </button>
      </form>

      <p className="mt-3 text-sm text-slate-600">
        Уже подтвердили почту?{' '}
        <Link className="text-slate-900 underline" to="/login">
          Войти
        </Link>
      </p>
    </section>
  );
};
