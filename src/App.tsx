import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import ModuleDashboard from '@/components/ModuleDashboard'
import ModuleDetailPage from '@/components/ModuleDetailPage'
import NotFoundPage from '@/components/NotFoundPage'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route
            path="/"
            element={
              <AnimatedPage>
                <ModuleDashboard />
              </AnimatedPage>
            }
          />

          <Route
            path="/module/:id"
            element={
              <AnimatedPage>
                <ModuleDetailPage />
              </AnimatedPage>
            }
          />

          <Route
            path="*"
            element={
              <AnimatedPage>
                <NotFoundPage />
              </AnimatedPage>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

function AnimatedPage({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default App
