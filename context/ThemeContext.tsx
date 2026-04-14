import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeColors } from '@/constants/Colors';

const ThemeContext = createContext<any>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState('dark');

  useEffect(() => {
    AsyncStorage.getItem('nex-theme').then((saved) => {
      if (saved) setThemeId(saved);
    });
  }, []);

  const changeTheme = async (id: string) => {
    setThemeId(id);
    await AsyncStorage.setItem('nex-theme', id);
  };

  const theme = ThemeColors[themeId as keyof typeof ThemeColors] || ThemeColors.dark;

  return (
    <ThemeContext.Provider value={{ themeId, changeTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);