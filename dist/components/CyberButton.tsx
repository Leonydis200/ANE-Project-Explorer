import React from 'react'

export function CyberButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      className="bg-accent text-black px-4 py-2 font-mono text-sm rounded-lg border border-accent/50 hover:bg-accent/80 transition-all shadow-neon"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

