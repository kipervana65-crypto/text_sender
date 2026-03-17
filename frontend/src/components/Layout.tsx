import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const Layout = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main className="mx-auto max-w-3xl px-4 py-6">
      <Outlet />
    </main>
  </div>
);
