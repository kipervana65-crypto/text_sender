import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUserFriendlyError } from '../utils/errorMessages';
import { StatusMessage } from '../components/StatusMessage';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/');
    } catch (e) {
      setError(getUserFriendlyError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md rounded border bg-white p-4">
      <h1 className="mb-4 text-xl font-semibold">Вход</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        {error ? <StatusMessage message={error} type="error" /> : null}
        <div>
          <label className="mb-1 block text-sm">Email</label>
          <input className="w-full rounded border px-3 py-2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
    </section>
  );
};
