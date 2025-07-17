import React from 'react';
import { useTheme } from '../ThemeProvider';

const themes = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
  { value: 'system', label: 'System', icon: '💻' },
] as const;

type ThemeValue = typeof themes[number]['value'];

export const ThemeSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <nav
      aria-label="Theme switcher"
      className={`flex items-center gap-2 ${className}`}
    >
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          aria-label={`Switch to ${label} theme`}
          aria-pressed={theme === value}
          tabIndex={0}
          className={`px-2 py-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors text-lg
            ${theme === value ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
          onClick={() => setTheme(value as ThemeValue)}
        >
          <span aria-hidden="true">{icon}</span>
          <span className="sr-only">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default ThemeSwitcher;
