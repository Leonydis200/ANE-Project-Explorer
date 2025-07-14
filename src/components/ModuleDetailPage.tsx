import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Brain, ActivitySquare, Bot, Radar, Settings2 } from 'lucide-react'

const iconMap: Record<string, JSX.Element> = {
  Brain: <Brain className="w-8 h-8" />,
  ActivitySquare: <ActivitySquare className="w-8 h-8" />,
  Bot: <Bot className="w-8 h-8" />,
  Radar: <Radar className="w-8 h-8" />,
  Settings2: <Settings2 className="w-8 h-8" />,
}

type Module = {
  id: string
  title: string
  icon: string
  description: string
  color: string
  metrics: Record<string, string | number>
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams()
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/modules.json')
      .then((res) => res.json())
      .then((data: Module[]) => {
        const found = data.find((m) => m.id === moduleId)
        setModule(found || null)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load module.')
        setLoading(false)
      })
  }, [moduleId])

  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!module) return <div className="p-6 text-red-500">Module not found.</div>

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Link to="/" className="text-primary underline mb-4 block">&larr; Back to Dashboard</Link>
      <div className={`rounded-xl shadow-lg p-6 ${module.color} text-white`}>
        <div className="flex items-center gap-4 mb-4">
          {iconMap[module.icon] || <Brain className="w-8 h-8" />}
          <h1 className="text-2xl font-bold">{module.title}</h1>
        </div>
        <p className="mb-4">{module.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(module.metrics).map(([key, value]) => (
            <div key={key} className="bg-white/10 p-4 rounded-lg shadow">
              <div className="text-xs uppercase text-white/80">{key}</div>
              <div className="text-lg font-semibold">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
