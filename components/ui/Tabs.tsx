import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface Tab {
  title: string
  value: string
}

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
  const tabRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      tabRefs.current[(idx + 1) % tabs.length]?.focus()
    } else if (e.key === 'ArrowLeft') {
      tabRefs.current[(idx - 1 + tabs.length) % tabs.length]?.focus()
    }
  }

  return (
    <div {...divProps}>
      <div className="flex space-x-4 border-b border-muted p-2" role="tablist">
        {tabs.map((tab, idx) => (
          <button
            key={tab.value}
            ref={el => tabRefs.current[idx] = el}
            onClick={() => onChange(tab.value)}
            onKeyDown={e => handleKeyDown(e, idx)}
            role="tab"
            aria-selected={activeTab === tab.value}
            tabIndex={activeTab === tab.value ? 0 : -1}
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
      <div className="relative min-h-[100px] mt-4" role="tabpanel">
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
