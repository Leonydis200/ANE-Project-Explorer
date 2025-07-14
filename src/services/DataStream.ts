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

export interface MLMetrics {
  modelAccuracy: number
  trainingProgress: number
  predictionConfidence: number
  adaptationRate: number
  lastTrainingDate: Date
}

export interface RealTimeMetrics extends AdvancedMetrics {
  processingMetrics: {
    messageQueue: number;
    processingTime: number;
    errorRate: number;
    successRate: number;
  };
  learningMetrics: {
    modelAccuracy: number;
    learningRate: number;
    iterations: number;
    lastTrainingDate: Date;
  };
  resourceMetrics: {
    cpuUsage: number[];
    memoryUsage: number;
    diskSpace: number;
    networkBandwidth: number;
  };
}

interface PerformanceMetrics {
  systemLoad: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
  availability: number;
  resourceUtilization: {
    cpu: number[];
    memory: number;
    disk: number;
    network: number;
  };
}

export class DataStreamService {
  private socket: Socket
  private metrics = new BehaviorSubject<AdvancedMetrics>(this.getInitialMetrics())
  private connectionStatus = new BehaviorSubject<ConnectionStatus>('disconnected')
  private performanceMetrics = new BehaviorSubject<PerformanceMetrics>({
    systemLoad: 0,
    responseTime: 0,
    errorRate: 0,
    throughput: 0,
    availability: 100,
    resourceUtilization: {
      cpu: [],
      memory: 0,
      disk: 0,
      network: 0
    }
  })
  private diagnosticsStream = new BehaviorSubject<any>(null)
  private repairStream = new BehaviorSubject<any>(null)
  private improvementStream = new BehaviorSubject<any>(null)
  private updateStream = new BehaviorSubject<any>(null)

  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  constructor() {
    this.socket = this.initializeSocket()
    this.setupMetricsCollection()
    this.setupAutoOptimization()
    this.initializeMonitoring()
    this.setupLiveStreams()

    this.socket.on('update', (data) => this.updateStream.next(data))
  }

  private initializeSocket(): Socket {
    const socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 5000
    })

    this.setupSocketHandlers(socket)
    return socket
  }

  private setupSocketHandlers(socket: Socket) {
    socket.on('connect', () => {
      this.connectionStatus.next('connected')
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

  private async collectRealTimeMetrics(): Promise<RealTimeMetrics> {
    // Collect real hardware metrics if available
    try {
      const hwMetrics = await this.getHardwareMetrics();
      const mlMetrics = await this.getMLMetrics();
      return {
        ...this.metrics.value,
        ...hwMetrics,
        ml: mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Implementation to get real hardware metrics
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Implementation to get ML metrics
  }

  private setupAutoOptimization() {
    interval(300000).subscribe(() => { // Every 5 minutes
      this.optimizePerformance();
    });
  }

  private async optimizePerformance() {
    const metrics = await this.collectSystemMetrics().toPromise();
    if (metrics.cpu > 80 || metrics.memory > 85) {
      await this.performResourceOptimization();
    }
  }

  private async performResourceOptimization() {
    // Implementation for resource optimization
    const optimizations = [
      this.optimizeCPU(),
      this.optimizeMemory(),
      this.optimizeNetwork()
    ];
    
    await Promise.all(optimizations);
  }

  private async initializeMonitoring() {
    try {
      await this.setupPerformanceMonitoring();
      await this.setupMLMetricsCollection();
      await this.initializeSystemHealth();
      this.startRealTimeUpdates();
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      this.connectionStatus.next('error');
    }
  }

  private setupPerformanceMonitoring() {
    interval(1000).pipe(
      mergeMap(() => this.collectPerformanceMetrics()),
      retryWhen(errors => 
        errors.pipe(
          delay(1000),
          take(5)
        )
      )
    ).subscribe({
      next: (metrics) => this.performanceMetrics.next(metrics),
      error: (error) => this.handleMonitoringError(error)
    });
  }

  private async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    // Implement real metrics collection
    const metrics = await Promise.all([
      this.collectCPUMetrics(),
      this.collectMemoryMetrics(),
      this.collectDiskMetrics(),
      this.collectNetworkMetrics()
    ]);

    return {
      systemLoad: metrics[0].load,
      responseTime: await this.measureResponseTime(),
      errorRate: this.calculateErrorRate(),
      throughput: await this.measureThroughput(),
      availability: this.calculateAvailability(),
      resourceUtilization: {
        cpu: metrics[0].utilization,
        memory: metrics[1],
        disk: metrics[2],
        network: metrics[3]
      }
    };
  }

  private async collectCPUMetrics() {
    // Implementation
  }

  private async collectMemoryMetrics() {
    // Implementation
  }

  private async collectDiskMetrics() {
    // Implementation
  }

  private async collectNetworkMetrics() {
    // Implementation
  }

  private setupLiveStreams() {
    this.socket.on('diagnostics', (data) => this.diagnosticsStream.next(data))
    this.socket.on('repair', (data) => this.repairStream.next(data))
    this.socket.on('improvement', (data) => this.improvementStream.next(data))
  }

  getDiagnosticsStream() {
    return this.diagnosticsStream.asObservable()
  }
  getRepairStream() {
    return this.repairStream.asObservable()
  }
  getImprovementStream() {
    return this.improvementStream.asObservable()
  }

  // Add performance metrics stream getter
  getPerformanceMetrics() {
    return this.performanceMetrics.asObservable()
  }

  // Add metrics stream getter for UI hooks
  getMetricsStream() {
    return this.metrics.asObservable()
  }

  // Add connection status stream getter
  getConnectionStatus() {
    return this.connectionStatus.asObservable()
  }

  getUpdateStream() {
    return this.updateStream.asObservable()
  }

  triggerSelfDiagnostics() {
    this.socket.emit('triggerDiagnostics')
  }
  triggerSelfRepair() {
    this.socket.emit('triggerRepair')
  }
  triggerSelfImprovement() {
    this.socket.emit('triggerImprovement')
  }
  triggerSelfUpdate() {
    this.socket.emit('triggerUpdate')
  }
}
