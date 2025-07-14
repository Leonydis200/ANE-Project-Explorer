import React, { useState, useEffect } from 'react'
import { useTheme } from './ThemeProvider'
import { Moon, Sun, Monitor } from 'lucide-react'

export default function UserPreferences() {
  const { theme, setTheme } = useTheme()
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('userPreferences')
    return saved ? JSON.parse(saved) : { name: '', notifications: true }
  })

  const updatePreferences = (updates: Partial<typeof preferences>) => {
    const newPrefs = { ...preferences, ...updates }
    setPreferences(newPrefs)
    localStorage.setItem('userPreferences', JSON.stringify(newPrefs))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Preference</h3>
        <div className="flex gap-4">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Monitor, label: 'System' },
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => setTheme(value as 'light' | 'dark' | 'system')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                theme === value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferences.notifications}
            onChange={e => updatePreferences({ notifications: e.target.checked })}
            className="rounded border-gray-300"
          />
          Enable notifications
        </label>
      </div>
    </div>
  )
}
