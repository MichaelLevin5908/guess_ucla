import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated);
    if (!isLoading && isAuthenticated) {
      navigate('/game', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="login-container">
      <h1>Welcome to Guess UCLA</h1>
      {!isAuthenticated && (
        <button
          onClick={() =>
            loginWithRedirect({
              appState: { returnTo: '/game' },
              authorizationParams: {
                redirect_uri: `${window.location.origin}/game`
              }
            })
          }
          className="login-button"
        >
          Log In
        </button>
      )}
    </div>
  );
};

export default Login;