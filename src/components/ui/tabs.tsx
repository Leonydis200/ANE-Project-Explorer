import * as React from 'react'

interface Tab {
  title: string
  value: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (value: string) => void
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex space-x-4 border-b border-muted p-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {tab.title}
        </button>
      ))}
    </div>
  )
}
