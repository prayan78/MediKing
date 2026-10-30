import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mediking_token') || null);
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [dateSystem, setDateSystemState] = useState(
    () => localStorage.getItem('mediking_date_system') || 'AD'
  );
  const [loading, setLoading] = useState(true);

  const setDateSystem = (value) => {
    localStorage.setItem('mediking_date_system', value);
    setDateSystemState(value);
    window.dispatchEvent(new CustomEvent('date-system-changed', { detail: value }));
  };

  const loadDateSystem = async () => {
    try {
      const { data } = await api.get('/settings');
      setDateSystem(data.data.dateSystem || 'AD');
    } catch (error) {
      console.error('[Settings Init Error]:', error);
    }
  };

  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('mediking_token');
      if (storedToken) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          setCurrentBranch(data.user.branch);
          await loadDateSystem();

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

  useEffect(() => {
    if (!token) return undefined;

    const syncDateSystem = async () => {
      try {
        const { data } = await api.get('/settings');
        const system = data.data.dateSystem || 'AD';
        if (system !== localStorage.getItem('mediking_date_system')) setDateSystem(system);
      } catch (error) {
        console.error('[Date Preference Sync Error]:', error);
      }
    };

    const interval = window.setInterval(syncDateSystem, 60000);
    window.addEventListener('focus', syncDateSystem);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncDateSystem);
    };
  }, [token]);

  const login = async (usernameOrEmail, password) => {
    const res = await api.post('/auth/login', { usernameOrEmail, password });
    const { token: newToken, user: newUser } = res.data;
    
    localStorage.setItem('mediking_token', newToken);
    localStorage.setItem('mediking_view_mode', 'launcher');
    setToken(newToken);
    setUser(newUser);
    setCurrentBranch(newUser.branch);
    await loadDateSystem();

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
        dateSystem,
        setDateSystem,
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
