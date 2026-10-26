import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mediking_token') || null);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mediking_token');
      if (storedToken) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          setCurrentBranch(data.user.branch);

          // Fetch branches list
          const branchRes = await api.get('/branches');
          setBranches(branchRes.data.data || []);
        } catch (err) {
          console.error('[Auth Init Error]:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    const { token: newToken, user: newUser } = res.data;
    
    localStorage.setItem('mediking_token', newToken);
    localStorage.setItem('mediking_view_mode', 'launcher');
    setToken(newToken);
    setUser(newUser);
    setCurrentBranch(newUser.branch);

    // Refresh branches
    try {
      const branchRes = await api.get('/branches', {
        headers: { Authorization: `Bearer ${newToken}` }
      });
      setBranches(branchRes.data.data || []);
    } catch (e) {
      console.warn('Could not fetch branches after login', e);
    }

    return newUser;
  };

  const logout = () => {
    localStorage.removeItem('mediking_token');
    localStorage.removeItem('mediking_user');
    localStorage.removeItem('mediking_view_mode');
    setToken(null);
    setUser(null);
    setCurrentBranch(null);
  };

  const switchBranch = async (branchId) => {
    try {
      const res = await api.post('/auth/switch-branch', { branchId });
      setCurrentBranch(res.data.branch);
      return res.data;
    } catch (error) {
      console.error('Error switching branch:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        branches,
        currentBranch,
        setCurrentBranch,
        switchBranch,
        login,
        logout,
        loading,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
