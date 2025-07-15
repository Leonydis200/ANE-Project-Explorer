import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'

const steps = [
  {
    title: 'Welcome to ANE Project Explorer',
    content: "Let's get you set up with your personalized experience.",
  },
  {
    title: 'Choose Your Theme',
    content: 'Select your preferred visual theme for the best experience.',
  },
  {
    title: 'Module Navigation',
    content: 'Explore different modules using the sidebar navigation.',
  },
]

export default function WelcomeWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [preferences, setPreferences] = useState({
    name: '',
    theme: 'system',
    notifications: true,
  })

  const handleComplete = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences))
    localStorage.setItem('wizardComplete', 'true')
    onComplete()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-primary">{steps[step].title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{steps[step].content}</p>
            
            {/* Step-specific content */}
            {step === 0 && (
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full p-2 border rounded"
                value={preferences.name}
                onChange={e => setPreferences(p => ({ ...p, name: e.target.value }))}
              />
            )}
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(s => s - 1)}
                className={`flex items-center ${step === 0 ? 'invisible' : ''}`}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </button>
              
              <button
                onClick={() => {
                  if (step === steps.length - 1) handleComplete()
                  else setStep(s => s + 1)
                }}
                className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
              >
                {step === steps.length - 1 ? 'Get Started' : 'Next'}
                {step !== steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
