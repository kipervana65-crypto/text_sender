import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-semibold text-slate-900">
          Text Sender
        </Link>

        <div className="flex items-center gap-3 text-sm">
          {isAuthenticated ? (
            <>
              <span className="text-slate-600">{user?.username}</span>
              <button className="rounded bg-slate-900 px-3 py-1.5 text-white" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-700 hover:text-slate-900">
                Войти
              </Link>
              <Link to="/register" className="rounded bg-slate-900 px-3 py-1.5 text-white">
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
