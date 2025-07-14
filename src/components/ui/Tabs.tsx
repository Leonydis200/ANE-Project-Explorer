import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Tab {
  title: string
  value: string
}

// Remove the incorrect extension here
interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (value: string) => void
  children: React.ReactNode
  divProps?: React.HTMLAttributes<HTMLDivElement>
}

interface TabsContentProps {
  value: string
  activeTab: string
  children: React.ReactNode
}

export const Tabs = ({ tabs, activeTab, onChange, children, divProps }: TabsProps) => {
  return (
    <div {...divProps}>
      <div className="flex space-x-4 border-b border-muted p-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            role="tab"
            aria-selected={activeTab === tab.value}
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
      <div className="relative min-h-[100px] mt-4">
        {children}
      </div>
    </div>
  )
}

export const TabsContent = ({ value, activeTab, children }: TabsContentProps) => {
  return (
    <AnimatePresence mode="wait">
      {activeTab === value && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
