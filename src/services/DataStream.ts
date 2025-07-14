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
  private userCommandStream = new BehaviorSubject<any>(null)
  private feedbackStream = new BehaviorSubject<string>('')

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

  private handleMetricsUpdate(data: AdvancedMetrics) {
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
    // Listen for 'systemMetrics' event from backend for real data
    return new Observable<AdvancedMetrics>(subscriber => {
      const handler = (metrics: AdvancedMetrics) => {
        subscriber.next(metrics)
      }
      this.socket.once('systemMetrics', handler)
      this.socket.emit('requestSystemMetrics')
      // Optionally handle completion/error
    })
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async collectSystemMetrics(): Observable<AdvancedMetrics> {
    // Listen for 'systemMetrics' event from backend for real data
    return new Observable<AdvancedMetrics>(subscriber => {
      const handler = (metrics: AdvancedMetrics) => {
        subscriber.next(metrics)
      }
      this.socket.once('systemMetrics', handler)
      this.socket.emit('requestSystemMetrics')
      // Optionally handle completion/error
    })
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics> {
    // Request ML metrics from backend
    return new Promise<MLMetrics>((resolve, reject) => {
      this.socket.emit('requestMLMetrics')
      this.socket.once('mlMetrics', (metrics: MLMetrics) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async collectCPUMetrics() {
    // Request CPU metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestCPUMetrics')
      this.socket.once('cpuMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectMemoryMetrics() {
    // Request memory metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestMemoryMetrics')
      this.socket.once('memoryMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectDiskMetrics() {
    // Request disk metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestDiskMetrics')
      this.socket.once('diskMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async collectNetworkMetrics() {
    // Request network metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestNetworkMetrics')
      this.socket.once('networkMetrics', (metrics: any) => {
        resolve(metrics)
      })
    })
  }

  private async measureResponseTime() {
    // Request response time from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestResponseTime')
      this.socket.once('responseTime', (time: number) => {
        resolve(time)
      })
    })
  }

  private calculateErrorRate() {
    // Request error rate from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestErrorRate')
      this.socket.once('errorRate', (rate: number) => {
        resolve(rate)
      })
    })
  }

  private async measureThroughput() {
    // Request throughput from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestThroughput')
      this.socket.once('throughput', (tp: number) => {
        resolve(tp)
      })
    })
  }

  private calculateAvailability() {
    // Request availability from backend
    return new Promise<number>((resolve, reject) => {
      this.socket.emit('requestAvailability')
      this.socket.once('availability', (avail: number) => {
        resolve(avail)
      })
    })
  }

  private async setupMLMetricsCollection() {
    // Setup ML metrics collection if needed (no-op for live data)
    return Promise.resolve()
  }

  private async initializeSystemHealth() {
    // Setup system health monitoring if needed (no-op for live data)
    return Promise.resolve()
  }

  private startRealTimeUpdates() {
    // Listen for real-time updates from backend
    this.socket.on('metrics', (metrics: AdvancedMetrics) => {
      this.metrics.next(metrics)
    })
  }

  private async optimizeCPU() {
    // Send optimization command to backend
    this.socket.emit('optimizeCPU')
    return Promise.resolve()
  }

  private async optimizeMemory() {
    // Send optimization command to backend
    this.socket.emit('optimizeMemory')
    return Promise.resolve()
  }

  private async optimizeNetwork() {
    // Send optimization command to backend
    this.socket.emit('optimizeNetwork')
    return Promise.resolve()
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
        ...mlMetrics,
      };
    } catch (error) {
      console.error('Failed to collect real metrics, using simulated data');
      return this.generateSimulatedMetrics();
    }
  }

  private async getHardwareMetrics() {
    // Request hardware metrics from backend
    return new Promise<any>((resolve, reject) => {
      this.socket.emit('requestHardwareMetrics')
      this.socket.once('hardwareMetrics', (metrics: any) => {
        resolve(metrics)
      })
      // Optionally add timeout/error handling
    })
  }

  private async getMLMetrics(): Promise<MLMetrics>