import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Define types for player scores
interface PlayerScore {
  email: string;
  score: number;
  played_at: string;
}

const Profile: React.FC = () => {
  const { currentProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      try {
        setPlayerScores([
          { email: "bruin1@ucla.edu", score: 4850, played_at: "2023-03-05T14:30:00Z" },
          { email: "bruin2@ucla.edu", score: 4200, played_at: "2023-03-06T11:20:00Z" },
          { email: currentProfile?.email || "you@ucla.edu", score: 3950, played_at: "2023-03-06T09:45:00Z" },
          { email: "bruin4@ucla.edu", score: 3700, played_at: "2023-03-04T16:15:00Z" },
          { email: "bruin5@ucla.edu", score: 3200, played_at: "2023-03-07T13:10:00Z" },
        ]);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError("Failed to load scores");
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [currentProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGame = () => {
    navigate("/game");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url('/data/ucla_marks.png')`,
        backgroundSize: "133px 76px",
        backgroundPosition: "50px 50px",
        backgroundRepeat: "repeat",
        backgroundColor: "rgb(5, 162, 255)",
        height: "auto", // Changed from 100vh to auto
        minHeight: "100vh", // Keep minimum height
        paddingTop: "30px", // Add some top padding
        paddingBottom: "30px" // Add some bottom padding
      }}
    >
      <div className="login-container" style={{ width: "80%", maxWidth: "800px" }}>
        <h2>Profile</h2>
        
        {/* Profile specific content based on authentication */}
        {currentProfile ? (
          <>
            <p>Email: {currentProfile.email}</p>
            <div className="profile-actions">
              <button onClick={handleGame} className="game-button">Play New Game</button>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </>
        ) : (
          <button onClick={handleGame} style={{ marginBottom: "20px" }}>
            Get Guessing
          </button>
        )}
        
        {/* Leaderboard section - always shown regardless of login state */}
        <div className="leaderboard-section" style={{ marginTop: "30px" }}>
          <h3>Top Scores</h3>
          {isLoading ? (
            <p>Loading scores...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {playerScores
                  .sort((a, b) => b.score - a.score)
                  .map((player, index) => (
                    <tr 
                      key={index} 
                      className={currentProfile && player.email === currentProfile.email ? "current-player" : ""}
                    >
                      <td>{index + 1}</td>
                      <td>{player.email}</td>
                      <td>{player.score}</td>
                      <td>{formatDate(player.played_at)}</td>
                    </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
