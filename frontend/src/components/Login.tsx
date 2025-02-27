import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Failed to login");
    }
  };

  return (
    <div
  className="login-page"
  style={{
    backgroundImage: `
      url('/data/ucla_marks.png')
    `,
    backgroundSize: "133px 76px", // Adjust image size
    backgroundPosition: "50px 50px", // Offset second pattern
    backgroundRepeat: "repeat",
    backgroundColor: "rgb(5, 162, 255)", // Set filler color
  }}
>


      {/* Login Container */}
      <div className="login-container">
        <h2>Log in with email</h2>
        <p>Explore UCLA's Campus</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Get Started</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
