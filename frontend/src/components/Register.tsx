import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate("/login");
    } catch (err) {
      setError("Failed to register");
    }
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
        <h2>Register</h2>
        <p>Join UCLA's Campus</p>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            required
          />
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
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
