import React, { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LogEntry {
  id: number
  message: string
  timestamp: string
}

export default function NotificationDrawer({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [logs, setLogs] = useState<LogEntry[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Date.now(),
        message: `Alert: Metric threshold breached at ${new Date().toLocaleTimeString()}`,
        timestamp: new Date().toLocaleString(),
      }
      setLogs(prev => [newLog, ...prev.slice(0, 9)])
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900 border rounded-lg shadow-xl p-4"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">System Alerts</h2>
            <button onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No recent alerts.</p>
          ) : (
            logs.map(log => (
              <div key={log.id} className="mb-2 p-3 bg-muted rounded">
                <div className="text-sm font-medium">{log.message}</div>
                <div className="text-xs text-muted-foreground">{log.timestamp}</div>
              </div>
            ))
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}