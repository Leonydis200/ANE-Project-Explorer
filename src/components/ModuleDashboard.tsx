// ModuleDashboard.tsx
import React, { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react'

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
		<div className="p-6 space-y-6 max-w-7xl mx-auto">
			<Tabs value={tab} onValueChange={setTab} className="w-full">
				<TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
					{modules.map((mod) => (
						<TabsTrigger key={mod.id} value={mod.id} className="flex items-center gap-2">
							{iconMap[mod.icon] || <span className="w-5 h-5" />}
							<span className="text-sm font-medium">{mod.title}</span>
						</TabsTrigger>
					))}
				</TabsList>

				<AnimatePresence mode="wait">
					<TabsContent key={tab} value={tab} asChild>
						<motion.div
							key={tab}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.4 }}
							className="space-y-4"
						>
							<Card className={`p-4 ${currentModule.color} text-white`}>
								<h2 className="text-xl font-bold">{currentModule.title}</h2>
								<p className="text-sm opacity-80">{currentModule.description}</p>
							</Card>
							<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
								{Object.entries(currentModule.metrics).map(([key, value]) => (
									<Card key={key} className="bg-muted">
										<CardContent className="p-4">
											<div className="text-xs uppercase text-muted-foreground">{key}</div>
											<div className="text-lg font-semibold">{value}</div>
										</CardContent>
									</Card>
								))}
							</div>
						</motion.div>
					</TabsContent>
				</AnimatePresence>
			</Tabs>
		</div>
	)
}