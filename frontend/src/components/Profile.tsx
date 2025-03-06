import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate} from "react-router-dom";

const Profile: React.FC = () => {
  const { currentProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGame = () => {
    navigate("/game");
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
      }}
    >
      <div className="login-container">
        <h2>Profile</h2>
        {currentProfile ? (
          <>
            <p>Email: {currentProfile.email}</p>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <button onClick={handleGame}> 
            Get Guessing
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
