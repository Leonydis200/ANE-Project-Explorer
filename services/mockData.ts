import { EnhancedSystemMetrics } from './DataStream'

export function generateMockData(): EnhancedSystemMetrics {
  return {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    network: Math.random() * 1000,
    errorRate: Math.random() * 5,
    throughput: Math.random() * 1000,
    latency: Math.random() * 200,
    uptime: 99.9,
    nodes: Math.floor(Math.random() * 10) + 1,
    status: 'Operational',
    statusLevel: Math.random() > 0.9 ? 'degraded' : 'healthy',
    health: Math.random() * 100,
    nlp: {
      throughput: Math.random() * 500,
      models: Math.floor(Math.random() * 5) + 1,
      latency: Math.random() * 100,
      health: Math.random() * 100,
      status: Math.random() > 0.9 ? 'degraded' : 'healthy'
    },
    emotions: {
      sentimentAccuracy: Math.random() * 100,
      emotionalRange: Math.random() * 10,
      health: Math.random() * 100,
      status: Math.random() > 0.9 ? 'degraded' : 'healthy'
    },
    prediction: {
      predictionAccuracy: Math.random() * 100,
      modelsTrained: Math.floor(Math.random() * 100),
      health: Math.random() * 100,
      status: Math.random() > 0.9 ? 'degraded' : 'healthy'
    },
    control: {
      activeProcesses: Math.floor(Math.random() * 50),
      systemLoad: Math.random() * 100,
      alerts: Math.floor(Math.random() * 5),
      health: Math.random() * 100,
      status: Math.random() > 0.9 ? 'degraded' : 'healthy'
    }
  }
}

export function simulateMetricsStream() {
  return setInterval(generateMockData, 1000)
}
