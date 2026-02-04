import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      // Check if theme is already set on the document (from main.tsx)
      const htmlTheme = document.documentElement.classList.contains('dark') ? 'dark' : 
                       document.documentElement.classList.contains('light') ? 'light' : null;
      if (htmlTheme) return htmlTheme;
      
      // Otherwise check localStorage
      const stored = localStorage.getItem('theme') as Theme;
      if (stored) return stored;
      
      // Fall back to system preference
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
}
