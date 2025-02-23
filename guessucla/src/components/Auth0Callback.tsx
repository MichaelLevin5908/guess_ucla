import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const Auth0Callback: React.FC = () => {
  const { error, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [isTokenReceived, setIsTokenReceived] = useState(false);

  useEffect(() => {
    const getToken = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          localStorage.setItem('auth_token', token);
          setIsTokenReceived(true);
        } catch (error) {
          console.error('Error getting token:', error);
        }
      }
    };

    getToken();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (error) {
    return <div>Authentication error: {error.message}</div>;
  }

  if (isTokenReceived) {
    return <Navigate to="/game" replace />;
  }

  return <div>Loading...</div>;
};

export default Auth0Callback;