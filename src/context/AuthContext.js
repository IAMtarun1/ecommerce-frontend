import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Load user from localStorage
      const userData = JSON.parse(localStorage.getItem('user') || 'null');
      if (userData) {
        setUser(userData);
      }
    }
    setLoading(false);
  }, [token]);

  // Check token validity periodically
  useEffect(() => {
    if (!token) return;

    const checkTokenValidity = async () => {
      try {
        // Make a lightweight request to check if token is still valid
        await authAPI.checkEmail('dummy@test.com');
      } catch (error) {
        if (error.response?.status === 401) {
          console.log('Token expired during periodic check');
          logout();
        }
      }
    };

    // Check token every 5 minutes
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      console.log('Login response:', response.data);
      
      if (response.data.success) {
        const newToken = response.data.token;
        const userData = response.data.user;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(newToken);
        setUser(userData);
        
        console.log('✅ Login successful, token saved');
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      console.log('Register response:', response.data);
      
      if (response.data.success) {
        const newToken = response.data.token;
        const newUser = response.data.user;
        
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        setToken(newToken);
        setUser(newUser);
        
        console.log('✅ Registration successful, token saved');
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    console.log('👋 User logged out');
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'ADMIN',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
