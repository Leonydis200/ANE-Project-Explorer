import React from 'react'

export function CyberPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="cyber-glow p-6 rounded-2xl border border-primary shadow-md">
      <h2 className="text-accent text-2xl font-mono mb-4">{title}</h2>
      <div className="text-light font-mono text-sm space-y-2">{children}</div>
    </div>
  )
}

