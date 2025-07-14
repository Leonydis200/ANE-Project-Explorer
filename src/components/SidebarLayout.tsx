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
			<div className="flex min-h-screen">
				<aside className="w-64 border-r border-white/10 bg-white/5 backdrop-blur-xl">
					<div className="p-6">
						<h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							ANE Explorer
						</h2>
					</div>

					<nav className="mt-6 px-3 space-y-2">
						{navItems.map((item) => (
							<Link
								key={item.id}
								to={`/${item.id}`}
								className={`nav-item ${
									location.pathname.includes(item.id)
										? 'bg-primary/15 text-primary'
										: 'text-muted-foreground'
								}`}
							>
								{item.icon}
								<span>{item.label}</span>
								{location.pathname.includes(item.id) && (
									<motion.div
										layoutId="active-nav"
										className="absolute left-0 w-1 h-full bg-primary rounded-r"
									/>
								)}
							</Link>
						))}
					</nav>

					<div className="absolute bottom-0 w-full p-4">
						<button
							onClick={() => setDrawerOpen(!drawerOpen)}
							className="w-full nav-item justify-center"
						>
							<Bell className="w-5 h-5" />
						</button>
					</div>
				</aside>

				<main className="flex-1 overflow-auto">
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>

				<NotificationDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
			</div>
		)
	}
