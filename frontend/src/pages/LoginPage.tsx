import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from '../components/StatusMessage';
import { ApiError } from '../types/api';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmailLink, setVerifyEmailLink] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setVerifyEmailLink(null);

    try {
      await login(identifier.trim(), password);
      navigate('/');
    } catch (e) {
      setError(getUserFriendlyError(e));

      if (e instanceof ApiError && e.message === 'Email is not verified' && identifier.includes('@')) {
        setVerifyEmailLink(`/verify-email?email=${encodeURIComponent(identifier.trim())}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Вход</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <StatusMessage message={error} type="error" /> : null}
        {verifyEmailLink ? (
          <StatusMessage
            type="info"
            message="Перейдите на страницу подтверждения email и запросите код для входа в аккаунт."
          />
        ) : null}
        <div>
          <label className="mb-1 block text-sm">Email или username</label>
          <input
            className="w-full rounded border px-3 py-2"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm">Пароль</label>
          <input
            className="w-full rounded border px-3 py-2"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="w-full rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-50" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-600">
        Нет аккаунта?{' '}
        <Link className="text-slate-900 underline" to="/register">
          Зарегистрироваться
        </Link>
      </p>
      {verifyEmailLink ? (
        <p className="mt-2 text-sm text-slate-600">
          Не подтверждён email?{' '}
          <Link className="text-slate-900 underline" to={verifyEmailLink}>
            Подтвердить почту
          </Link>
        </p>
      ) : null}
    </section>
  );
};
