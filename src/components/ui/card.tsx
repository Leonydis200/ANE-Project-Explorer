import { ReactNode } from 'react'

export function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-md">{children}</div>
}

export function CardContent({ children }: { children: ReactNode }) {
  return <div className="card-content">{children}</div>
}
