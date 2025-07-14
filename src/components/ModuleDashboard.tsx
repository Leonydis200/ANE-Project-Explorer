// ModuleDashboard.tsx
import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tabs, TabsContent } from '@/components/ui/Tabs'
import { Brain, ActivitySquare, Bot, Radar, Settings2, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

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
		<div className="p-8">
			<header className="mb-8">
				<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
					ANE Dashboard
				</h1>
				<p className="text-muted-foreground mt-2">
					Explore and monitor your AI systems
				</p>
			</header>

			<Tabs tabs={modules.map(m => ({ title: m.title, value: m.id }))} activeTab={tab} onChange={setTab}>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
					{modules.map((mod) => (
						<button
							key={mod.id}
							onClick={() => setTab(mod.id)}
							className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap
								${tab === mod.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
						>
							{iconMap[mod.icon] || <span className="w-5 h-5" />}
							<span className="text-sm font-medium">{mod.title}</span>
						</button>
					))}
				</div>
				<TabsContent value={tab} activeTab={tab}>
					<motion.div
						key={tab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						transition={{ duration: 0.4 }}
						className="space-y-4"
					>
						<div className={`p-4 rounded-lg text-white ${currentModule.color} shadow-lg flex flex-col md:flex-row md:items-center gap-4`}>
							<div className="flex items-center gap-3">
								{iconMap[currentModule.icon] || <span className="w-5 h-5" />}
								<h2 className="text-xl font-bold">{currentModule.title}</h2>
							</div>
							<div className="flex-1">
								<p className="text-sm opacity-80">{currentModule.description}</p>
							</div>
							<Link
								to={`/detail/${currentModule.id}`}
								className="ml-auto mt-2 md:mt-0 px-4 py-2 bg-white text-primary rounded shadow hover:bg-primary hover:text-white transition"
							>
								View Details
							</Link>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{Object.entries(currentModule.metrics).map(([key, value]) => (
								<div key={key} className="bg-muted p-4 rounded-lg shadow border border-gray-200">
									<div className="text-xs uppercase text-muted-foreground">{key}</div>
									<div className="text-lg font-semibold text-foreground">{value}</div>
								</div>
							))}
						</div>
					</motion.div>
				</TabsContent>
			</Tabs>
		</div>
	)
}