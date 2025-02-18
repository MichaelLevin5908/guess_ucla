import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Game.css';

const Game: React.FC = () => {
  const { user, logout } = useAuth0();
  const [guess, setGuess] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');

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