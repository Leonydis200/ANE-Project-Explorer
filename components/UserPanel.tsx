import React, { useState } from 'react'

export default function UserPanel() {
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-primary">👋 Welcome to ANE Project Explorer</h2>
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Enter your name:
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-2 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-primary"
              placeholder="Your name"
              required
            />
          </label>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition"
          >
            Start Exploring
          </button>
        </form>
      ) : (
        <div className="text-lg text-gray-800">
          Hello, <span className="font-semibold text-primary">{name}</span>! 🎉
        </div>
      )}
    </div>
  )
}
