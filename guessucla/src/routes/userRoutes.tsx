import { RouteObject } from 'react-router-dom';
import Login from '../pages/Login';
import Game from '../pages/Game';
import ProtectedRoute from '../components/ProtectedRoute';
import Auth0Callback from '../components/Auth0Callback';

export const userRoutes: RouteObject[] = [
  {
    path: '/',
    element: <Login />
  },
  {
    path: '/game',
    element: (
      <ProtectedRoute>
        <Game />
      </ProtectedRoute>
    )
  },
  {
    path: '/callback',
    element: <Auth0Callback />
  }
];