import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Define a more specific User type
interface User {
  id: string;
  email: string;
  plan_type?: string; // Or other relevant user fields
  // Add other fields like name if available from your backend user object
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean; // To handle initial loading state
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    // On component mount, try to load auth data from localStorage
    console.log('AuthProvider: Attempting to load data from localStorage...');
    try {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (storedAccessToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken); // Load refresh token
        setIsAuthenticated(true);
        console.log('AuthProvider: Data loaded from localStorage. User authenticated.', parsedUser);
      } else {
        console.log('AuthProvider: No valid data found in localStorage.');
      }
    } catch (error) {
      console.error('AuthProvider: Error loading data from localStorage', error);
      // Ensure state is clean if localStorage is corrupted
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setAccessToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false); // Finished loading attempt
      console.log('AuthProvider: Initial loading finished.');
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const login = (userData: User, newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
    setIsAuthenticated(true);
    console.log('AuthContext: User logged in', userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    console.log('AuthContext: User logged out');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, accessToken, refreshToken, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
