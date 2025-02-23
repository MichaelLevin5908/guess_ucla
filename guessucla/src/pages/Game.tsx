import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import '../styles/Game.css';

declare global {
  interface Window {
    google: any;
  }
}

const Game: React.FC = () => {
  const { user, logout, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const [guess, setGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [latLng, setLatLng] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  // Check authentication and token
  useEffect(() => {
    const checkAuthAndToken = async () => {
      if (!isAuthenticated) {
        navigate('/', { replace: true });
        return;
      }

      try {
        const token = await getAccessTokenSilently();
        if (!token) {
          console.error('No token available');
          navigate('/', { replace: true });
          return;
        }

        localStorage.setItem('auth_token', token);
        
        initializeMap();
      } catch (error) {
        console.error('Authentication error:', error);
        navigate('/', { replace: true });
      }
    };

    checkAuthAndToken();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  // Initialize map
  const initializeMap = () => {
    const geocoder = new window.google.maps.Geocoder();
    const address = "UCLA";
    geocoder.geocode({ address }, (results: any, status: any) => {
      if (status === window.google.maps.GeocoderStatus.OK) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        setLatLng({ lat, lng });
      }
    });
  };

  const handleGuess = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Add game logic here
    setFeedback(`Your guess was: ${guess}`);
    setGuess('');
  };

  return (
    <div className="game-container">
      <header className="game-header">
        <h1>Guess UCLA</h1>
        <div className="user-info">
          <img src={user?.picture} alt={user?.name} className="avatar" />
          <span>{user?.name}</span>
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="logout-button"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="game-content">
        <div className="image-container">
          {/* Add your UCLA location image here */}
          <img src="/placeholder.jpg" alt="UCLA Location" className="location-image" />
          {latLng.lat !== 0 && (
            <p className="location-coords">
              UCLA Coordinates: {latLng.lat.toFixed(4)}, {latLng.lng.toFixed(4)}
            </p>
          )}
        </div>

        <form onSubmit={handleGuess} className="guess-form">
          <input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Enter your guess..."
            className="guess-input"
          />
          <button type="submit" className="guess-button">
            Submit Guess
          </button>
        </form>

        {feedback && <p className="feedback">{feedback}</p>}
      </main>
    </div>
  );
};

export default Game;