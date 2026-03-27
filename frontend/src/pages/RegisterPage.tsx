import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from '../components/StatusMessage';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGmailEmail = /@gmail\.com$/i.test(email.trim());

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isGmailEmail) {
        setError('Для регистрации и подтверждения почты используйте Gmail (@gmail.com)');
        return;
      }

      await register(email, username, password);
      navigate(`/verify-email?email=${encodeURIComponent(email.trim())}`);
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Регистрация</h1>
      <StatusMessage
        message="Важно: подтверждение аккаунта работает только для Gmail-адресов (@gmail.com)."
        type="warning"
      />
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <StatusMessage message={error} type="error" /> : null}
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input className="w-full rounded border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1 block text-sm">Username</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            pattern="^[A-Za-z0-9_]{1,32}$"
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
          {loading ? 'Создание...' : 'Создать аккаунт'}
        </button>
      </form>
      <p className="mt-3 text-sm text-slate-600">
        Уже есть аккаунт?{' '}
        <Link className="text-slate-900 underline" to="/login">
          Войти
        </Link>
      </p>
    </section>
  );
};
