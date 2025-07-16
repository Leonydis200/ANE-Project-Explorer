import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map, mergeMap, retryWhen, delay, take } from 'rxjs/operators';

export interface SystemMetrics {
  cpu: number;
  memory: number;
  network: number;
  errorRate: number;
  throughput: number;
  latency: number;
}

export interface EnhancedSystemMetrics extends SystemMetrics {
  uptime: number;
  nodes: number;
  status: string;
  statusLevel: 'healthy' | 'degraded' | 'critical';
  health: number;
  nlp: {
    throughput: number;
    models: number;
    latency: number;
    health: number;
    status: 'healthy' | 'degraded' | 'critical';
  };
  emotions: {
    sentimentAccuracy: number;
    emotionalRange: number;
    health: number;
    status: 'healthy' | 'degraded' | 'critical';
  };
  prediction: {
    predictionAccuracy: number;
    modelsTrained: number;
    health: number;
    status: 'healthy' | 'degraded' | 'critical';
  };
  control: {
    activeProcesses: number;
    systemLoad: number;
    alerts: number;
    health: number;
    status: 'healthy' | 'degraded' | 'critical';
  };
}

export interface AdvancedMetrics extends EnhancedSystemMetrics {
  performance: {
    cpu: {
      usage: number;
      temperature: number;
      cores: number[];
    };
    memory: {
      total: number;
      used: number;
      free: number;
      cached: number;
    };
    storage: {
      total: number;
      used: number;
      free: number;
      readSpeed: number;
      writeSpeed: number;
    };
  };
  selfImprovement: {
    lastOptimization: Date;
    optimizationScore: number;
    learningRate: number;
    adaptationLevel: number;
  };
}

export class DataStreamService {
  private socket: Socket;
  private metricsSubject = new BehaviorSubject<AdvancedMetrics>(this.getInitialMetrics());
  private connectionStatus = new BehaviorSubject<'connected' | 'disconnected' | 'error'>('disconnected');
  private maxReconnectAttempts = 5;
  private reconnectAttempts = 0;

  constructor() {
    this.socket = this.initializeSocket();
    this.setupSocketHandlers();
  }

  private initializeSocket(): Socket {
    return io(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      timeout: 5000,
      transports: ['websocket'],
    });
  }

  private setupSocketHandlers() {
    this.socket.on('connect', () => {
      this.connectionStatus.next('connected');
      this.reconnectAttempts = 0;
      console.log('Connected to metrics server');
    });

    this.socket.on('disconnect', () => {
      this.connectionStatus.next('disconnected');
      this.handleDisconnect();
    });

    this.socket.on('metrics', (data: AdvancedMetrics) => {
      this.metricsSubject.next(data);
    });

    this.socket.on('error', (error: any) => {
      this.connectionStatus.next('error');
      console.error('Socket error:', error);
    });
  }

  private handleDisconnect() {
    this.reconnectAttempts++;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.socket.connect();
      }, 1000);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  public setupMetricsCollection() {
    interval(1000).pipe(
      mergeMap(() => this.collectSystemMetrics().pipe(
        retryWhen(errors => errors.pipe(
          delay(1000),
          take(this.maxReconnectAttempts)
        ))
      ))
    ).subscribe({
      next: metrics => this.metricsSubject.next(metrics),
      error: error => {
        console.error('Metrics collection error:', error);
        this.connectionStatus.next('error');
      }
    });
  }

  private collectSystemMetrics(): Observable<AdvancedMetrics> {
    return new Observable<AdvancedMetrics>(subscriber => {
      const handler = (metrics: AdvancedMetrics) => {
        subscriber.next(metrics);
        subscriber.complete();
      };
      
      this.socket.once('systemMetrics', handler);
      this.socket.emit('requestSystemMetrics');
      
      return () => {
        this.socket.off('systemMetrics', handler);
      };
    });
  }

  public getMetricsStream(): Observable<AdvancedMetrics> {
    return this.metricsSubject.asObservable();
  }

  public getConnectionStatus() {
    return this.connectionStatus.asObservable();
  }

  public sendCommand(type: string, payload: any) {
    return new Promise((resolve, reject) => {
      this.socket.emit('command', { type, payload }, (response: any) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
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
        learningRate: 0.001,
        adaptationLevel: 0,
      },
    };
  }
}

export const dataStream = new DataStreamService();