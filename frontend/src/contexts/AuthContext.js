import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Token expiration time in milliseconds (should match backend setting)
const TOKEN_EXPIRE_MS = 8 * 60 * 60 * 1000; // 8 hours

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get('/api/v1/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Setup axios interceptor for 401 responses
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setSessionExpired(true);
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    if (token) {
      // Check if token has expired
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        setSessionExpired(true);
        logout();
        setLoading(false);
        return;
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser, logout]);

  // Periodically check token expiration
  useEffect(() => {
    const checkExpiration = () => {
      const tokenExpiry = localStorage.getItem('tokenExpiry');
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        setSessionExpired(true);
        logout();
      }
    };

    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [logout]);

  const login = async (username, password) => {
    const response = await axios.post('/api/v1/auth/login', { username, password });
    const { access_token } = response.data;

    // Store token and expiry time
    const expiryTime = Date.now() + TOKEN_EXPIRE_MS;
    localStorage.setItem('token', access_token);
    localStorage.setItem('tokenExpiry', expiryTime.toString());

    axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setSessionExpired(false);
    await fetchUser();
  };

  const dismissSessionExpired = () => {
    setSessionExpired(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      loading,
      sessionExpired,
      dismissSessionExpired
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
