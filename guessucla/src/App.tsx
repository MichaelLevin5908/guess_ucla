import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { userRoutes } from './routes/userRoutes';
import './App.css';

const router = createBrowserRouter(userRoutes);

const onRedirectCallback = (appState: { returnTo?: string } = {}) => {
  window.history.replaceState(
    {},
    document.title,
    appState.returnTo ? appState.returnTo : window.location.pathname
  );
};

function App() {
  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN!}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID!}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/api/v2/`,
        scope: "openid profile email"
      }}
      onRedirectCallback={onRedirectCallback}
    >
      <RouterProvider router={router} />
    </Auth0Provider>
  );
}

export default App;
