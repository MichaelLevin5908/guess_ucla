import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Leaderboard.css';

interface LeaderboardEntry {
  name: string;
  score: number;
}

const Leaderboard: React.FC = () => {
  const { user } = useAuth0();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // need to implement using call from databse
    const Leaderboard: LeaderboardEntry[] = [
      { name: 'Alice', score: 150 },
      { name: 'Bob', score: 130 },
      { name: 'Charlie', score: 120 },
    ];
    setLeaderboard(Leaderboard);
  }, []);

  return (
    <div className="leaderboard-container">
      <header className="leaderboard-header">
        <h1>Leaderboard</h1>
      </header>
      <main className="leaderboard-content">
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.name}</td>
                <td>{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
};

export default Leaderboard;