// SidebarLayout.tsx

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Brain, ActivitySquare, Bot, Radar, Settings2, Bell } from 'lucide-react'
import NotificationDrawer from './NotificationDrawer'

const navItems = [
	{ id: 'overview', icon: <Brain />, label: 'Overview' },
	{ id: 'nlp', icon: <ActivitySquare />, label: 'NLP' },
	{ id: 'emotions', icon: <Bot />, label: 'Emotions' },
	{ id: 'prediction', icon: <Radar />, label: 'Prediction' },
	{ id: 'control', icon: <Settings2 />, label: 'Control' },
]

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
		const location = useLocation()
		const [drawerOpen, setDrawerOpen] = useState(false)

		return (
			<div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
				{/* Sidebar */}
				<aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg">
					<div className="p-6">
						<h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							ANE Explorer
						</h2>
					</div>

					<nav className="px-3 py-6 space-y-2">
						{navItems.map((item) => (
							<Link
								key={item.id}
								to={`/${item.id}`}
								className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
									${location.pathname.includes(item.id)
										? 'bg-primary text-white'
										: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
									}`}
							>
								{item.icon}
								<span className="font-medium">{item.label}</span>
								{location.pathname.includes(item.id) && (
									<motion.div
										layoutId="active-nav"
										className="absolute left-0 w-1 h-full bg-primary rounded-r"
									/>
								)}
							</Link>
						))}
					</nav>

					<div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
						<button
							onClick={() => setDrawerOpen(!drawerOpen)}
							className="w-full flex items-center justify-center gap-2 p-2 rounded-xl
									 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700
									 transition-colors duration-200"
						>
							<Bell className="w-5 h-5" />
							<span className="font-medium">Notifications</span>
						</button>
					</div>
				</aside>

				<div className="flex-1 flex flex-col">
					{/* Main content */}
					<main className="flex-1 overflow-y-auto p-4">
						{children}
					</main>

					{/* Notifications */}
					<NotificationDrawer 
						open={drawerOpen} 
						onClose={() => setDrawerOpen(false)} 
					/>
				</div>
			</div>
		)
	}
