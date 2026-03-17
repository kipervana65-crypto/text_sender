import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { BlockPage } from '../pages/BlockPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/blocks/:id',
        element: <BlockPage />,
      },
    ],
  },
]);
