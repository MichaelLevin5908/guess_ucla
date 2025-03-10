import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// Define types for player scores
interface PlayerScore {
  email: string;
  score: number;
  played_at: string;
}

// Define lobby interface
interface Lobby {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { currentProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [availableLobbies, setAvailableLobbies] = useState<Lobby[]>([]);
  const [showLobbyOptions, setShowLobbyOptions] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchScores = async () => {
      setIsLoading(true);
      try {
        // Fetch leaderboard scores
        setPlayerScores([
          { email: "bruin1@ucla.edu", score: 4850, played_at: "2023-03-05T14:30:00Z" },
          { email: "bruin2@ucla.edu", score: 4200, played_at: "2023-03-06T11:20:00Z" },
          { email: currentProfile?.email || "you@ucla.edu", score: 3950, played_at: "2023-03-06T09:45:00Z" },
          { email: "bruin4@ucla.edu", score: 3700, played_at: "2023-03-04T16:15:00Z" },
          { email: "bruin5@ucla.edu", score: 3200, played_at: "2023-03-07T13:10:00Z" },
        ]);
        
        // Fetch available lobbies (mock data for now)
        setAvailableLobbies([
          { id: "lobby1", name: "Royce Hall Challenge", players: 3, maxPlayers: 5, createdAt: "2023-03-07T12:30:00Z" },
          { id: "lobby2", name: "Bruin Plaza Game", players: 2, maxPlayers: 4, createdAt: "2023-03-07T13:15:00Z" },
          { id: "lobby3", name: "Campus Tour", players: 1, maxPlayers: 3, createdAt: "2023-03-07T13:45:00Z" },
        ]);
        
        setIsLoading(false);
      } catch (err) {
        //console.error("Error fetching data:", err);
        setError("Failed to load data");
        setIsLoading(false);
      }
    };

    fetchScores();
  }, [currentProfile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNewGame = () => {
    navigate("/game");
  };
  
  const handleJoinLobby = (lobbyId: string) => {
    navigate(`/game?lobby=${lobbyId}`);
  };
  
  const handleCreateLobby = () => {
    const newLobbyId = `lobby_${Date.now()}`;
    navigate(`/game?lobby=${newLobbyId}&create=true`);
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
        height: "auto",
        minHeight: "100vh",
        paddingTop: "30px",
        paddingBottom: "30px"
      }}
    >
      <div className="login-container" style={{ width: "80%", maxWidth: "800px" }}>
        <h2>Profile</h2>
        
        {/* Profile specific content based on authentication */}
        {currentProfile ? (
          <>
            <p>Email: {currentProfile.email}</p>
            <div className="profile-actions" style={{ marginTop: "20px" }}>
              <button onClick={handleLogout} className="logout-button">Logout</button>
            </div>
          </>
        ) : (
          <>
            {!showLobbyOptions ? (
              <div className="game-options" style={{ 
                display: "flex", 
                flexDirection: "column",
                gap: "15px",
                margin: "20px 0"
              }}>
                <button 
                  onClick={() => setShowLobbyOptions(true)}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#0039A6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Play with Others
                </button>
                
                <button 
                  onClick={handleNewGame}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#3A71C6",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Play Solo Game
                </button>
              </div>
            ) : (
              <div className="lobby-selection" style={{ margin: "20px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <h3 style={{ margin: 0 }}>Available Lobbies</h3>
                  <button 
                    onClick={() => setShowLobbyOptions(false)}
                    style={{
                      padding: "5px 10px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    }}
                  >
                    Back
                  </button>
                </div>
                
                {/* Create Lobby Button */}
                <button 
                  onClick={handleCreateLobby}
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    margin: "0 0 15px 0",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "16px"
                  }}
                >
                  Create New Lobby
                </button>
                
                {/* List of available lobbies */}
                {availableLobbies.length > 0 ? (
                  <div className="lobbies-list" style={{ 
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }}>
                    {availableLobbies.map(lobby => (
                      <div 
                        key={lobby.id}
                        style={{
                          padding: "12px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}
                      >
                        <div>
                          <h4 style={{ margin: "0 0 5px 0" }}>{lobby.name}</h4>
                          <p style={{ margin: 0, fontSize: "14px" }}>
                            Players: {lobby.players}/{lobby.maxPlayers} • 
                            Created: {formatDate(lobby.createdAt)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleJoinLobby(lobby.id)}
                          style={{
                            padding: "8px 15px",
                            backgroundColor: lobby.players < lobby.maxPlayers ? "#0039A6" : "#6c757d",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: lobby.players < lobby.maxPlayers ? "pointer" : "not-allowed",
                          }}
                          disabled={lobby.players >= lobby.maxPlayers}
                        >
                          {lobby.players < lobby.maxPlayers ? "Join" : "Full"}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No active lobbies found. Create one to start playing with others!</p>
                )}
              </div>
            )}
          </>
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
