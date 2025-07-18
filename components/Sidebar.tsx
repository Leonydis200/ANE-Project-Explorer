import React from 'react'
import { Home, Bell, Info, Settings2 } from 'lucide-react'

interface SidebarProps {
  active: string
  onSelect: (id: string) => void
}

const sidebarItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'notifications', icon: Bell, label: 'Alerts' },
  { id: 'info', icon: Info, label: 'Info' },
  { id: 'settings', icon: Settings2, label: 'Settings' },
]

export default function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <aside className="flex flex-col items-center py-6 px-2 space-y-6 bg-muted w-16 shadow-md">
      {sidebarItems.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className={`p-2 rounded-md transition-colors hover:bg-primary/20 ${
            active === id ? 'bg-primary text-white' : 'text-muted-foreground'
          }`}
          title={label}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </aside>
  )
}