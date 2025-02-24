import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/api";
import { ProfileResponse } from "../types/types";

interface AuthContextType {
  currentProfile: ProfileResponse | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  return useContext(AuthContext) as AuthContextType;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentProfile, setCurrentProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function login(email: string, password: string) {
    const response = await api.post("/login", { email, password });
    localStorage.setItem("token", response.data.access_token);
    await fetchProfile();
  }

  async function register(name: string, email: string, password: string) {
    await api.post("/register", { name, email, password });
  }

  async function logout() {
    localStorage.removeItem("token");
    setCurrentProfile(null);
  }

  async function fetchProfile() {
    try {
      const response = await api.get("/me");
      setCurrentProfile(response.data);
    } catch (error) {
      setCurrentProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  const value = {
    currentProfile,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
