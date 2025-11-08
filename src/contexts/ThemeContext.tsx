import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'slate' | 'midnight' | 'ocean';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themeClasses: Record<Theme, string[]> = {
  light: ['theme-light'],
  dark: ['theme-dark'],
  slate: ['theme-slate'],
  midnight: ['theme-midnight'],
  ocean: ['theme-ocean'],
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;

    Object.values(themeClasses).forEach(classes => {
      classes.forEach(className => root.classList.remove(className));
    });

    root.classList.remove('light', 'dark');

    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.add('dark');
      themeClasses[theme].forEach(className => root.classList.add(className));
    }

    localStorage.setItem('theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
