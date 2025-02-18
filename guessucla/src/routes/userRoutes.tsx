import { RouteObject } from 'react-router-dom';
import Login from '../pages/Login';
import Game from '../pages/Game';
import ProtectedRoute from '../components/ProtectedRoute';

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
  }
];