import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login: React.FC = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  return (
    <div className="login-container">
      <h1>Welcome to Guess UCLA</h1>
      {!isAuthenticated && (
        <button 
          onClick={() => loginWithRedirect()}
          className="login-button"
        >
          Log In
        </button>
      )}
    </div>
  );
};

export default Login;