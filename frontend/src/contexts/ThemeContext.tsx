import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeConfig {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    accent: string;
    accentSecondary: string;
    accentMuted: string;
  };
  gradients: {
    background: string;
    surface: string;
    card: string;
    accent: string;
  };
  elevation: {
    shadow: string;
    glow: string;
    hover: string;
  };
  charts: {
    primary: string;
    secondary: string;
    accent: string;
    hover: string;
    grid: string;
    text: string;
  };
}

interface ThemeContextType {
  theme: ThemeConfig;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const lightTheme: ThemeConfig = {
  mode: 'light',
  colors: {
    primary: '#6366f1',
    secondary: '#6b7280',
    background: '#fafbfc',
    surface: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e2e8f0',
    accent: '#6366f1',
    accentSecondary: '#8b5cf6',
    accentMuted: '#a5b4fc',
  },
  gradients: {
    background: 'linear-gradient(135deg, #fafbfc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    surface: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    card: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
    accent: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  elevation: {
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    glow: '0 0 20px rgba(99, 102, 241, 0.15)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 25px rgba(99, 102, 241, 0.2)',
  },
  charts: {
    primary: '#64748b',
    secondary: '#94a3b8',
    accent: '#6366f1',
    hover: '#8b5cf6',
    grid: '#f1f5f9',
    text: '#9ca3af',
  },
};

const darkTheme: ThemeConfig = {
  mode: 'dark',
  colors: {
    primary: '#818cf8',
    secondary: '#9ca3af',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    border: '#475569',
    accent: '#818cf8',
    accentSecondary: '#a78bfa',
    accentMuted: '#6366f1',
  },
  gradients: {
    background: 'radial-gradient(ellipse at top, #1e293b 0%, #0f172a 50%, #020617 100%)',
    surface: 'linear-gradient(145deg, #334155 0%, #1e293b 100%)',
    card: 'linear-gradient(135deg, #334155 0%, #1f2937 100%)',
    accent: 'linear-gradient(135deg, #818cf8, #a78bfa)',
  },
  elevation: {
    shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(129, 140, 248, 0.2)',
    hover: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3), 0 0 25px rgba(129, 140, 248, 0.25)',
  },
  charts: {
    primary: '#94a3b8',
    secondary: '#64748b',
    accent: '#818cf8',
    hover: '#a78bfa',
    grid: '#334155',
    text: '#94a3b8',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'genai-dashboard-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode;
    if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [themeMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setThemeMode(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};