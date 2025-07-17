import { Brain } from 'lucide-react'
import { ThemeSwitcher } from './common/ThemeSwitcher'

export default function ModernHeader() {
  return (
    <header className="dashboard-header flex items-center justify-between gap-4 px-4 py-2">
      <div className="logo-section flex items-center gap-3">
        <div className="logo-icon">
          <Brain />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ANE Explorer</h1>
          <p className="text-sm opacity-80">Advanced AI System Monitoring</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="status-badge flex items-center gap-2">
          <span className="status-indicator" />
          <span>System Status: Online</span>
        </div>
        <ThemeSwitcher />
      </div>
    </header>
  )
}
