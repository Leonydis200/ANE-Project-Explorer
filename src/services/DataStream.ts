import { io, Socket } from 'socket.io-client'
import { BehaviorSubject, interval, Observable } from 'rxjs'
import { map, mergeMap, retryWhen, delay, take } from 'rxjs/operators'
import { generateMockData } from './mockData'

export interface SystemMetrics {
  cpu: number
  memory: number
  network: number
  errorRate: number
  throughput: number
  latency: number
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'error'

export interface EnhancedSystemMetrics extends SystemMetrics {
  uptime: number
  nodes: number
  status: string
  statusLevel: 'healthy' | 'degraded' | 'critical'
  health: number
  nlp: {
    throughput: number
    models: number
    latency: number
    health: number
    status: 'healthy' | 'degraded' | 'critical'
  }
  emotions: {
    sentimentAccuracy: number
    emotionalRange: number
    health: number
    status: 'healthy' | 'degraded' | 'critical'
  }
  prediction: {
    predictionAccuracy: number
    modelsTrained: number
    health: number
    status: 'healthy' | 'degraded' | 'critical'
  }
  control: {
    activeProcesses: number
    systemLoad: number
    alerts: number
    health: number
    status: 'healthy' | 'degraded' | 'critical'
  }
}

export interface AdvancedMetrics extends EnhancedSystemMetrics {
  performance: {
    cpu: {
      usage: number
      temperature: number
      cores: number[]
    }
    memory: {
      total: number
      used: number
      free: number
      cached: number
    }
    storage: {
      total: number
      used: number
      free: number
      readSpeed: number
      writeSpeed: number
    }
  }
  selfImprovement: {
    lastOptimization: Date
    optimizationScore: number
    learningRate: number
    adaptationLevel: number
  }
}

export class DataStreamService {
  private socket: Socket
  private metrics = new BehaviorSubject<AdvancedMetrics>(this.getInitialMetrics())
  private connectionStatus = new BehaviorSubject<ConnectionStatus>('disconnected')
  private mockInterval: NodeJS.Timeout | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.socket = this.initializeSocket()
    this.setupMetricsCollection()
    this.setupSelfImprovement()
  }

  private initializeSocket(): Socket {
    const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 5000
    })

    this.setupSocketHandlers(socket)
    return socket
  }

  private setupSocketHandlers(socket: Socket) {
    socket.on('connect', () => {
      this.connectionStatus.next('connected')
      this.reconnectAttempts = 0
      console.log('Connected to metrics server')
    })

    socket.on('disconnect', () => {
      this.connectionStatus.next('disconnected')
      this.handleDisconnect()
    })

    socket.on('metrics', this.handleMetricsUpdate.bind(this))
    socket.on('error', this.handleError.bind(this))
  }

  private setupMetricsCollection() {
    interval(1000).pipe(
      mergeMap(() => this.collectSystemMetrics().pipe(
        retryWhen(errors => 
          errors.pipe(
            map((error, index) => {
              if (index >= this.maxReconnectAttempts) throw error;
              console.warn(`Retrying metrics collection (${index + 1}/${this.maxReconnectAttempts})`, error);
              return index;
            }),
            delay(1000)
          )
        )
      ))
    ).subscribe({
      next: metrics => this.metrics.next(metrics),
      error: error => {
        console.error('Fatal metrics collection error:', error);
        this.connectionStatus.next('error');
      }
    });
  }

  private setupSelfImprovement() {
    interval(3600000).subscribe(() => { // Every hour
      this.performSelfImprovement()
    })
  }

  private async performSelfImprovement() {
    const currentMetrics = this.metrics.value
    const optimizations = await this.calculateOptimizations(currentMetrics)
    
    if (optimizations.length > 0) {
      await this.applyOptimizations(optimizations)
      this.notifyOptimizations(optimizations)
    }
  }

  private getInitialMetrics(): AdvancedMetrics {
    return {
      cpu: 0,
      memory: 0,
      network: 0,
      errorRate: 0,
      throughput: 0,
      latency: 0,
      uptime: 0,
      nodes: 0,
      status: 'unknown',
      statusLevel: 'healthy',
      health: 100,
      nlp: {
        throughput: 0,
        models: 0,
        latency: 0,
        health: 100,
        status: 'healthy',
      },
      emotions: {
        sentimentAccuracy: 0,
        emotionalRange: 0,
        health: 100,
        status: 'healthy',
      },
      prediction: {
        predictionAccuracy: 0,
        modelsTrained: 0,
        health: 100,
        status: 'healthy',
      },
      control: {
        activeProcesses: 0,
        systemLoad: 0,
        alerts: 0,
        health: 100,
        status: 'healthy',
      },
      performance: {
        cpu: {
          usage: 0,
          temperature: 0,
          cores: [],
        },
        memory: {
          total: 0,
          used: 0,
          free: 0,
          cached: 0,
        },
        storage: {
          total: 0,
          used: 0,
          free: 0,
          readSpeed: 0,
          writeSpeed: 0,
        },
      },
      selfImprovement: {
        lastOptimization: new Date(),
        optimizationScore: 100,
        learningRate: 0,
        adaptationLevel: 0,
      },
    }
  }

  private handleMetricsUpdate(data: SystemMetrics) {
    this.metrics.next(data)
  }

  private handleError(error: any) {
    this.connectionStatus.next('error')
    console.error('Socket error:', error)
  }

  private handleDisconnect() {
    this.reconnectAttempts++
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      setTimeout(() => {
        this.socket.connect()
      }, 1000)
    } else {
      console.error('Max reconnect attempts reached')
    }
  }

  private collectSystemMetrics(): Observable<AdvancedMetrics> {
    // Implement actual metrics collection logic here
    return new Observable<AdvancedMetrics>(subscriber => {
      const metrics = generateMockData() as AdvancedMetrics
      subscriber.next(metrics)
      subscriber.complete()
    })
  }

  private async calculateOptimizations(metrics: AdvancedMetrics): Promise<any[]> {
    const optimizations = [];
    
    if (metrics.cpu > 80) {
      optimizations.push({ type: 'cpu', action: 'scale' });
    }
    
    if (metrics.memory > 85) {
      optimizations.push({ type: 'memory', action: 'cleanup' });
    }
    
    if (metrics.errorRate > 5) {
      optimizations.push({ type: 'errorRate', action: 'investigate' });
    }
    
    return optimizations;
  }

  private async applyOptimizations(optimizations: any[]) {
    for (const opt of optimizations) {
      try {
        await this.socket.emit('optimize', opt);
        console.log(`Applied optimization: ${opt.type}`);
      } catch (error) {
        console.error(`Failed to apply optimization: ${opt.type}`, error);
      }
    }
  }

  private notifyOptimizations(optimizations: any[]) {
    // Implement optimization notification logic here
  }

  getMetricsStream() {
    return this.metrics.asObservable()
  }

  getConnectionStatus() {
    return this.connectionStatus.asObservable()
  }

  sendCommand(command: string, payload: any) {
    if (this.socket.connected) {
      this.socket.emit('command', { command, payload })
      return true
    }
    return false
  }

  disconnect() {
    this.socket.disconnect()
    if (this.mockInterval) {
      clearInterval(this.mockInterval)
    }
    this.metrics.complete()
    this.connectionStatus.complete()
  }
}

export const dataStream = new DataStreamService()
