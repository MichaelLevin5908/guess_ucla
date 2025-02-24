export interface ProfileResponse {
  user_id: string;
  name: string;
  email: string;
}

export interface AuthContextType {
  currentProfile: ProfileResponse | null; 
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>; 
  logout: () => void;
  loading: boolean;
}