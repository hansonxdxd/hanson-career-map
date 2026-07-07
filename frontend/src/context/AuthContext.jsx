import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // null = checking, false = not auth, object = auth
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      setUser(false);
      setChecking(false);
      return;
    }
    getMe()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem('cms_token');
        setUser(false);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem('cms_token', data.access_token);
    const me = await getMe();
    setUser(me);
    return me;
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
