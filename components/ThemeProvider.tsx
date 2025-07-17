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

// Helper function to safely access localStorage
getLocalStorage = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn('localStorage access denied', error);
    return null;
  }
};

// Helper function to safely set localStorage
setLocalStorage = (key: string, value: string): void => {
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
    try {
      return (getLocalStorage(storageKey) as Theme) || defaultTheme;
    } catch (e) {
      console.warn('Failed to read theme from localStorage', e);
      return defaultTheme;
    }
  });

  // Memoize the resolved theme to prevent unnecessary re-renders
  const resolvedTheme = useCallback((): 'light' | 'dark' => {
    if (!enableSystem) return 'light';

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? 'dark' : 'light';
    }

    return theme === 'dark' ? 'dark' : 'light';
  }, [theme, enableSystem]);

  // Store the current resolved theme in a ref to avoid unnecessary effects
  const currentResolvedTheme = useRef(resolvedTheme());

  const [colors, setColors] = useState<Record<string, ThemeColor>>(DEFAULT_COLORS);

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
      const colorScheme = isDark ? 'dark' : 'light';
      root.style.colorScheme = colorScheme;
    }

    // Apply CSS variables for colors
    Object.values(colors).forEach(({ light, dark, cssVariable }) => {
      root.style.setProperty(cssVariable, isDark ? dark : light);
    });

    setResolvedTheme(isDark ? 'dark' : 'light');
  }, [colors, enableColorScheme]);

  // Apply theme changes to the document
  useEffect(() => {
    const root = window.document.documentElement;
    const newResolvedTheme = resolvedTheme();

    // Only update if the theme has actually changed
    if (newResolvedTheme === currentResolvedTheme.current) return;

    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(newResolvedTheme);

    // Apply color scheme if enabled
    if (enableColorScheme) {
      root.style.colorScheme = newResolvedTheme;
    }

    // Batch DOM updates with requestAnimationFrame for better performance
    requestAnimationFrame(() => {
      // Apply CSS variables for colors
      Object.values(colors).forEach((color) => {
        root.style.setProperty(
          color.cssVariable,
          newResolvedTheme === 'dark' ? color.dark : color.light
        );
      });
    });

    // Update the ref
    currentResolvedTheme.current = newResolvedTheme;
    
    // Call the optional callback
    onResolvedThemeChange?.(newResolvedTheme);
  }, [resolvedTheme, colors, enableColorScheme, onResolvedThemeChange]);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.textContent = `
        * {
          transition: none !important;
        }
      `;
      document.head.appendChild(css);
      
      // Force a reflow
      const _ = window.getComputedStyle(document.body).opacity;
      
      return () => {
        // Remove the style element after the component is unmounted
        requestAnimationFrame(() => {
          document.head.removeChild(css);
        });
      };
    }
  }, [theme, disableTransitionOnChange]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  // Memoize the setTheme function to prevent unnecessary re-renders
  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (disableTransitionOnChange) {
        document.documentElement.classList.add('no-transition');
      }

      // Only update if theme has actually changed
      if (theme === newTheme) return;

      // Save to localStorage
      setLocalStorage(storageKey, newTheme);

      // Update state
      setThemeState(newTheme);
      
      // Call the optional callback
      onThemeChange?.(newTheme);

      // Re-enable transitions after a short delay
      if (disableTransitionOnChange) {
        // Force reflow
        requestAnimationFrame(() => {
          document.documentElement.offsetHeight;
          document.documentElement.classList.remove('no-transition');
        });
      }
    },
    [disableTransitionOnChange, storageKey, theme, onThemeChange]
  );

  // Memoize the toggle function
  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Handle system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      // Force a re-render when system theme changes and theme is set to 'system'
      setThemeState('system');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableSystem, theme]);

  // Memoize the addColor function to prevent unnecessary re-renders
  const addColor = useCallback((name: string, color: ThemeColor) => {
    setColors((prev) => {
      // Only update if the color is new or has changed
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

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme: resolvedTheme(),
    setTheme,
    toggleTheme,
    isDark: resolvedTheme() === 'dark',
    colors,
    addColor,
  }), [theme, resolvedTheme, setTheme, toggleTheme, colors, addColor]);

  // Use React.memo to prevent unnecessary re-renders of children
  const MemoizedChildren = useMemo(() => children, [children]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {MemoizedChildren}
    </ThemeContext.Provider>
  );
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

// Higher-order component for class components
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
};

export const ThemeSwitcher = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
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
        type="button"
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
        type="button"
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
