// SidebarLayout.tsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Brain, ActivitySquare, Bot, Radar, Settings2, Bell } from 'lucide-react'
import NotificationDrawer from './NotificationDrawer'

const navItems = [
  { id: 'overview', icon: <Brain />, label: 'Overview' },
  { id: 'nlp', icon: <ActivitySquare />, label: 'NLP' },
  { id: 'emotions', icon: <Bot />, label: 'Emotions' },
  { id: 'prediction', icon: <Radar />, label: 'Prediction' },
  { id: 'control', icon: <Settings2 />, label: 'Control' },
]

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-16 sm:w-20 border-r border-muted bg-muted/30 flex flex-col items-center py-4 space-y-6">
        {navItems.map((item) => (
          <Link
            to={`/${item.id}`}
            key={item.id}
            className={`group relative flex flex-col items-center text-muted-foreground hover:text-primary transition ${
              location.pathname.includes(item.id) ? 'text-primary' : ''
            }`}
          >
            <div className="text-xl">{item.icon}</div>
            <span className="hidden sm:block text-xs mt-1">{item.label}</span>
            {location.pathname.includes(item.id) && (
              <motion.span
                layoutId="active-pill"
                className="absolute left-0 h-full w-1 bg-primary rounded-r"
              />
            )}
          </Link>
        ))}

        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="mt-auto p-2 rounded hover:bg-accent text-muted-foreground hover:text-primary"
        >
          <Bell />
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>

      <NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
