import { dataStream } from './DataStream'
import { selfDiagnostics } from './SelfDiagnostics'
import { BehaviorSubject, lastValueFrom } from 'rxjs'

interface ImprovementMetrics {
  performanceScore: number
  optimizationLevel: number
  lastImprovement: Date
  suggestions: string[]
}

export class SystemImprovementService {
  private metrics = new BehaviorSubject<ImprovementMetrics>({
    performanceScore: 0,
    optimizationLevel: 0,
    lastImprovement: new Date(),
    suggestions: []
  })

  constructor() {
    this.initializeImprovement()
  }

  private initializeImprovement() {
    setInterval(() => this.analyzeAndImprove(), 3600000) // Every hour
  }

  private async analyzeAndImprove() {
    const currentMetrics = await lastValueFrom(dataStream.getMetricsStream())
    const diagnostics = await selfDiagnostics.runDiagnostics()
    
    const improvements = this.calculateImprovements(currentMetrics, diagnostics)
    const optimizations = await this.applyImprovements(improvements)
    
    this.metrics.next({
      performanceScore: this.calculatePerformanceScore(currentMetrics),
      optimizationLevel: optimizations.level,
      lastImprovement: new Date(),
      suggestions: optimizations.suggestions
    })
  }

  private calculatePerformanceScore(metrics: EnhancedSystemMetrics): number {
    return (
      (metrics.cpu * 0.2) +
      (metrics.memory * 0.2) +
      (metrics.network * 0.2) +
      (metrics.throughput * 0.2) +
      (100 - metrics.errorRate * 10) * 0.2
    )
  }

  private calculateImprovements(metrics: any, diagnostics: any) {
    const improvements = [];
    
    if (metrics.cpu > 75) {
      improvements.push({
        type: 'performance',
        target: 'cpu',
        action: 'optimize',
        priority: 'high'
      });
    }

    if (metrics.errorRate > 2) {
      improvements.push({
        type: 'reliability',
        target: 'error-handling',
        action: 'enhance',
        priority: 'critical'
      });
    }

    if (metrics.latency > 150) {
      improvements.push({
        type: 'performance',
        target: 'network',
        action: 'optimize',
        priority: 'medium'
      });
    }

    return improvements;
  }

  private async applyImprovements(improvements: any[]) {
    const results = {
      level: 0,
      suggestions: [] as string[]
    };

    for (const imp of improvements) {
      try {
        await dataStream.sendCommand('improve', imp);
        results.level += 1;
        results.suggestions.push(`Applied ${imp.type} improvement for ${imp.target}`);
      } catch (error) {
        console.error(`Failed to apply improvement:`, error);
        results.suggestions.push(`Failed to improve ${imp.target}: ${error.message}`);
      }
    }

    return results;
  }
}

export const systemImprovement = new SystemImprovementService()
