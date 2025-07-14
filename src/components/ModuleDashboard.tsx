// ModuleDashboard.tsx
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ModernHeader from './ModernHeader'
import { Brain, ActivitySquare, Bot, Radar, Settings2, ArrowRight } from 'lucide-react'

const iconMap: Record<string, JSX.Element> = {
	Brain: <Brain className="w-5 h-5" />,
	ActivitySquare: <ActivitySquare className="w-5 h-5" />,
	Bot: <Bot className="w-5 h-5" />,
	Radar: <Radar className="w-5 h-5" />,
	Settings2: <Settings2 className="w-5 h-5" />,
}

type Module = {
	id: string
	title: string
	icon: string
	description: string
	color: string
	metrics: Record<string, string | number>
}

export default function ModuleDashboard() {
	const [modules, setModules] = useState<Module[]>([])
	const [tab, setTab] = useState('overview')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		fetch('/api/modules.json')
			.then((res) => res.json())
			.then((data) => {
				setModules(data)
				setLoading(false)
			})
			.catch(() => {
				setError('Failed to load modules.')
				setLoading(false)
			})
	}, [])

	const currentModule = modules.find((m) => m.id === tab)

	if (loading) return <div className="p-6 text-muted-foreground">Loading modules...</div>
	if (error) return <div className="p-6 text-red-500">{error}</div>
	if (!currentModule) return <div className="p-6 text-red-500">Module not found.</div>

	return (
		<div className="app-background px-8 py-6">
			<div className="fancy-blur top-0 left-0" />
			<div className="fancy-blur bottom-0 right-0" />
			
			<header className="mb-8">
				<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					ANE System Dashboard
				</h1>
				<p className="text-lg text-foreground/60 mt-2">
					Monitor and control your AI systems
				</p>
			</header>

			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{modules.map((mod) => (
					<motion.div
						key={mod.id}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="module-card"
					>
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-white/10 rounded-xl">
								{iconMap[mod.icon]}
							</div>
							<div>
								<h3 className="text-xl font-semibold text-white mb-1">
									{mod.title}
								</h3>
								<p className="text-white/80 text-sm">
									{mod.description}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-6">
							{Object.entries(mod.metrics).map(([key, value]) => (
								<div key={key} className="metric-card">
									<div className="text-xs uppercase text-foreground/60">
										{key}
									</div>
									<div className="text-lg font-semibold mt-1">
										{value}
									</div>
								</div>
							))}
						</div>

						<Link
							to={`/detail/${mod.id}`}
							className="glass-panel w-full flex items-center justify-center gap-2 py-3 rounded-xl
									 text-primary hover:bg-primary hover:text-white transition-all"
						>
							View Details
							<ArrowRight className="w-4 h-4" />
						</Link>
					</motion.div>
				))}
			</div>
		</div>
	)
}