import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Location {
  _id: string;
  ucla_name: string;
  address: string;
  coordinates: string;
  image_storage: string;
  views?: number;
  likes?: number;
  dislikes?: number;
}

export interface GameResult {
  user_id?: string;
  email?: string;
  score: number;
  location_ids: string[];
  guesses: Array<{
    location_id: string;
    user_guess: {
      lat: number;
      lng: number;
    };
    distance: number;
    score: number;
  }>;
}

const gameService = {
  // Get random locations for a game
  getRandomLocations: async (count = 5): Promise<Location[]> => {
    const response = await api.get(`/game/locations/random?count=${count}`);
    return response.data.locations;
  },
  
  // Get daily challenge locations
  getDailyLocations: async (count = 5): Promise<Location[]> => {
    const response = await api.get(`/game/locations/daily?count=${count}`);
    return response.data.locations;
  },
  
  // Get lobby-specific locations
  getLobbyLocations: async (lobbyId: string, count = 5): Promise<Location[]> => {
    const response = await api.get(`/game/locations/lobby/${lobbyId}?count=${count}`);
    return response.data.locations;
  },
  
  // Save game results
  saveGameResult: async (result: GameResult): Promise<string> => {
    const response = await api.post('/game/results', result);
    return response.data.game_id;
  },
  
  // Get leaderboard
  getLeaderboard: async (limit = 10) => {
    const response = await api.get(`/game/leaderboard?limit=${limit}`);
    return response.data.leaderboard;
  },
  
  // Get user's game history
  getUserGames: async (userId: string) => {
    const response = await api.get(`/game/user/${userId}/games`);
    return response.data.games;
  },
  
  // Interactions with locations
  incrementLocationView: async (locationId: string) => {
    await api.post(`/game/location/${locationId}/view`);
  },
  
  likeLocation: async (locationId: string, liked = true) => {
    await api.post(`/game/location/${locationId}/like?liked=${liked}`);
  },
  
  addComment: async (locationId: string, comment: string) => {
    await api.post(`/game/location/${locationId}/comment?comment=${encodeURIComponent(comment)}`);
  }
};

export default gameService;