import React, { createContext, useState, useEffect, useContext } from 'react';

const SettingContext = createContext();

export const SettingProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:5000/api/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingContext.Provider value={{ settings, loading }}>
      {children}
    </SettingContext.Provider>
  );
};

export const useSettings = () => {
  return useContext(SettingContext);
};
