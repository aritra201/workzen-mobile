import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { THEME, THEME_STORAGE_KEY } from '../constants/theme';
import { darkColors, lightColors } from './colors';
import { getItem, setItem } from '../utils/themeStorage';

const ThemeContext = createContext(null);

function paletteForTheme(theme) {
  return theme === THEME.DARK ? darkColors : lightColors;
}

async function readStoredTheme() {
  const stored = await getItem(THEME_STORAGE_KEY);
  if (stored === THEME.DARK || stored === THEME.LIGHT) {
    return stored;
  }
  return null;
}

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState(THEME.LIGHT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readStoredTheme();
      if (cancelled) return;
      if (stored) {
        setThemeState(stored);
      } else if (systemScheme === 'dark') {
        setThemeState(THEME.DARK);
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [systemScheme]);

  const setTheme = useCallback(async (next) => {
    const value = next === THEME.DARK ? THEME.DARK : THEME.LIGHT;
    setThemeState(value);
    await setItem(THEME_STORAGE_KEY, value);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === THEME.DARK ? THEME.LIGHT : THEME.DARK);
  }, [theme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === THEME.DARK,
      colors: paletteForTheme(theme),
      setTheme,
      toggleTheme,
      ready,
    }),
    [theme, setTheme, toggleTheme, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: THEME.LIGHT,
      isDark: false,
      colors: lightColors,
      setTheme: () => {},
      toggleTheme: () => {},
      ready: true,
    };
  }
  return ctx;
}
