import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar: React.FC = () => {
  const { currentProfile, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Guess UCLA
        </Link>
        <p className="navbar-description">
          The GeoGuesser for UCLA - Test your knowledge of UCLA's campus!
        </p>
      </div>
      <ul className="navbar-links">
        {currentProfile ? (
          <>
            <li>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
            </li>
            <li>
              <button onClick={logout} className="navbar-button">
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
            </li>
            <li>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;