import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { cn } from '../lib/utils';

// Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeColor {
  light: string;
  dark: string;
  cssVariable: string;
}

export type ThemeColors = Record<string, ThemeColor>;

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
  addColor: (name: string, color: ThemeColor) => void;
}

// Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Default color scheme
const DEFAULT_COLORS = {
  primary: {
    light: '#2563eb',
    dark: '#3b82f6',
    cssVariable: '--primary',
  },
  background: {
    light: '#ffffff',
    dark: '#0f172a',
    cssVariable: '--background',
  },
  foreground: {
    light: '#020817',
    dark: '#f8fafc',
    cssVariable: '--foreground',
  },
  muted: {
    light: '#f1f5f9',
    dark: '#1e293b',
    cssVariable: '--muted',
  },
  accent: {
    light: '#f1f5f9',
    dark: '#1e293b',
    cssVariable: '--accent',
  },
  success: {
    light: '#10b981',
    dark: '#34d399',
    cssVariable: '--success',
  },
  warning: {
    light: '#f59e0b',
    dark: '#fbbf24',
    cssVariable: '--warning',
  },
  error: {
    light: '#ef4444',
    dark: '#f87171',
    cssVariable: '--error',
  },
  info: {
    light: '#3b82f6',
    dark: '#60a5fa',
    cssVariable: '--info',
  },
} as const satisfies Record<string, ThemeColor>;

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  enableSystem?: boolean;
  enableColorScheme?: boolean;
  disableTransitionOnChange?: boolean;
  onThemeChange?: (theme: Theme) => void;
  onResolvedThemeChange?: (theme: 'light' | 'dark') => void;
}

// Helper functions to safely access localStorage
const getLocalStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage access denied', error);
    return null;
  }
};

const setLocalStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    console.warn('Failed to set localStorage', error);
  }
};

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  enableSystem = true,
  enableColorScheme = true,
  disableTransitionOnChange = true,
  onThemeChange,
  onResolvedThemeChange,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = getLocalStorage(storageKey);
    return storedTheme ? (storedTheme as Theme) : defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (!enableSystem) return 'light';
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return theme === 'dark' ? 'dark' : 'light';
  });

  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);
  const currentResolvedTheme = useRef(resolvedTheme);

  const applyTheme = useCallback((newTheme: Theme) => {
    if (typeof window === 'undefined') return;

    const root = window.document.documentElement;
    const isDark = newTheme === 'dark' || 
                  (newTheme === 'system' && 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Apply theme classes
    root.classList.remove('light', 'dark');
    root.classList.add(isDark ? 'dark' : 'light');
    
    // Update data-theme attribute
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    
    // Update color scheme
    if (enableColorScheme) {
      root.style.colorScheme = isDark ? 'dark' : 'light';
    }

    // Apply CSS variables for colors
    Object.values(colors).forEach(({ light, dark, cssVariable }) => {
      root.style.setProperty(cssVariable, isDark ? dark : light);
    });

    const newResolvedTheme = isDark ? 'dark' : 'light';
    setResolvedTheme(newResolvedTheme);
    currentResolvedTheme.current = newResolvedTheme;
    onResolvedThemeChange?.(newResolvedTheme);
  }, [colors, enableColorScheme, onResolvedThemeChange]);

  // Apply theme changes to the document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const newResolvedTheme = (() => {
      if (!enableSystem) return 'light';
      if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return theme === 'dark' ? 'dark' : 'light';
    })();

    if (newResolvedTheme === currentResolvedTheme.current) return;

    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);

    if (enableColorScheme) {
      root.style.colorScheme = newResolvedTheme;
    }

    requestAnimationFrame(() => {
      Object.values(colors).forEach((color) => {
        root.style.setProperty(
          color.cssVariable,
          newResolvedTheme === 'dark' ? color.dark : color.light
        );
      });
    });

    currentResolvedTheme.current = newResolvedTheme;
    setResolvedTheme(newResolvedTheme);
    onResolvedThemeChange?.(newResolvedTheme);
  }, [theme, colors, enableColorScheme, enableSystem, onResolvedThemeChange]);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      setThemeState('system'); // Force re-render
      applyTheme('system');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (disableTransitionOnChange && typeof window !== 'undefined') {
        document.documentElement.classList.add('no-transition');
      }

      if (theme === newTheme) return;

      setLocalStorage(storageKey, newTheme);
      setThemeState(newTheme);
      onThemeChange?.(newTheme);

      if (disableTransitionOnChange && typeof window !== 'undefined') {
        requestAnimationFrame(() => {
          document.documentElement.offsetHeight;
          document.documentElement.classList.remove('no-transition');
        });
      }
    },
    [disableTransitionOnChange, storageKey, theme, onThemeChange]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  const addColor = useCallback((name: string, color: ThemeColor) => {
    setColors((prev) => {
      if (prev[name] && 
          prev[name].light === color.light && 
          prev[name].dark === color.dark && 
          prev[name].cssVariable === color.cssVariable) {
        return prev;
      }
      return {
        ...prev,
        [name]: color,
      };
    });
  }, []);

  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    colors,
    addColor,
  }), [theme, resolvedTheme, setTheme, toggleTheme, colors, addColor]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function withTheme<P extends { theme?: ThemeContextType }>(
  WrappedComponent: React.ComponentType<P>
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  const ComponentWithTheme = (props: Omit<P, 'theme'>) => {
    const theme = useTheme();
    return <WrappedComponent {...(props as P)} theme={theme} />;
  };
  
  ComponentWithTheme.displayName = `withTheme(${displayName})`;
  return ComponentWithTheme;
}

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'p-2 rounded-md',
          theme === 'light' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted/50'
        )}
        aria-label="Light theme"
      >
        ☀️
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'p-2 rounded-md',
          theme === 'dark' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted/50'
        )}
        aria-label="Dark theme"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('system')}
        className={cn(
          'p-2 rounded-md',
          theme === 'system' 
            ? 'bg-primary text-primary-foreground' 
            : 'hover:bg-muted/50'
        )}
        aria-label="System theme"
      >
        💻
      </button>
    </div>
  );
};