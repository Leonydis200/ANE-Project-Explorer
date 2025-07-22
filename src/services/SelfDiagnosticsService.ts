import { BehaviorSubject, interval, lastValueFrom, Observable } from 'rxjs';
import * as tf from '@tensorflow/tfjs';
import { dataStream } from './DataStream';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details: unknown;
  timestamp: number;
}

interface SystemHealth {
  status: 'online' | 'offline' | 'degraded';
  overall: number;
  components: Record<string, number>;
  lastCheck: Date;
  issues: string[];
  indicators: {
    id: string;
    name: string;
    status: 'ok' | 'warning' | 'critical';
    value: number;
    unit: string;
  }[];
}

export class SelfDiagnosticsService {
  private healthSubject = new BehaviorSubject<SystemHealth>({
    status: 'online',
    overall: 100,
    components: {},
    lastCheck: new Date(),
    issues: [],
    indicators: []
  });
  
  private alertsSubject = new BehaviorSubject<string[]>([]);
  private feedbackSubject = new BehaviorSubject<string>('Idle');
  private diagnosticsHistory = new BehaviorSubject<Array<{
    timestamp: Date;
    results: DiagnosticResult[];
  }>>([]);
  
  private mlModel: tf.LayersModel | null = null;

  constructor() {
    this.initializeMonitoring();
    this.setupAutomaticRepair();
    this.initializeMLModel();
  }

  private initializeMonitoring() {
    interval(60000).subscribe(async () => {
      const results = await this.runDiagnostics();
      this.updateSystemHealth(results);
      this.handleCriticalIssues(results);
    });
  }

  private setupAutomaticRepair() {
    interval(300000).subscribe(async () => {
      const health = this.healthSubject.value;
      if (health.issues.length > 0) {
        await this.performAutoRepair(health.issues);
      }
    });
  }

  public async runDiagnostics(): Promise<DiagnosticResult[]> {
    this.feedbackSubject.next('Running diagnostics...');
    
    const checks = await Promise.all([
      this.checkConnectivity(),
      this.checkPerformance(),
      this.checkStorage(),
      this.checkModules(),
      this.checkML(),
      this.checkSecurity(),
    ]);

    const analysis = this.analyzeResults(checks);
    if (analysis.issues.length > 0) {
      await this.autoRepair(analysis.issues);
    }

    this.diagnosticsHistory.next([
      ...this.diagnosticsHistory.value,
      { timestamp: new Date(), results: checks }
    ]);

    this.feedbackSubject.next('Diagnostics complete');
    return checks;
  }

  // ... (other private methods remain the same)

  public getHealthStream(): Observable<SystemHealth> {
    return new Observable<SystemHealth>(subscriber => {
      // Initial health data
      subscriber.next(this.healthSubject.value);
      
      // Subscribe to health updates
      const subscription = this.healthSubject.subscribe(subscriber);
      
      // Cleanup function
      return () => subscription.unsubscribe();
    });
  }

  public getAlertsObservable(): Observable<string[]> {
    return this.alertsSubject.asObservable();
  }

  public getFeedbackObservable(): Observable<string> {
    return this.feedbackSubject.asObservable();
  }

  public getDiagnosticsHistory(): Observable<Array<{
    timestamp: Date;
    results: DiagnosticResult[];
  }>> {
    return this.diagnosticsHistory.asObservable();
  }

  public async forceDiagnostics(): Promise<DiagnosticResult[]> {
    return this.runDiagnostics();
  }

  public async forceRepair(): Promise<void> {
    const health = this.healthSubject.value;
    if (health.issues.length > 0) {
      await this.performAutoRepair(health.issues);
    }
  }

  private async initializeMLModel(): Promise<void> {
    try {
      this.mlModel = await tf.loadLayersModel('/models/diagnostics-model.json');
      this.feedbackSubject.next('ML model loaded successfully');
      this.startPredictiveMaintenance();
    } catch (error) {
      console.error('Failed to load ML model:', error);
      this.feedbackSubject.next('ML model loading failed');
      this.alertsSubject.next([
        ...this.alertsSubject.value,
        'Failed to load diagnostic ML model'
      ]);
    }
  }

  private startPredictiveMaintenance(): void {
    interval(300000).subscribe(async () => {
      try {
        const prediction = await this.predictSystemIssues();
        if (prediction.risk > 0.7) {
          await this.preventiveMaintenance(prediction.issues);
        }
      } catch (error) {
        console.error('Predictive maintenance error:', error);
      }
    });
  }

  private async predictSystemIssues(): Promise<{ risk: number; issues: string[] }> {
    if (!this.mlModel) {
      throw new Error('ML model not loaded');
    }

    try {
      const metrics = await lastValueFrom(dataStream.getMetricsStream());
      
      // Convert metrics to tensor
      const input = tf.tensor2d([
        [
          metrics.cpu,
          metrics.memory,
          metrics.network,
          metrics.disk,
          metrics.errorRate || 0
        ]
      ]);

      // Make prediction
      const prediction = this.mlModel.predict(input) as tf.Tensor;
      const predictionData = await prediction.data();
      
      // Cleanup tensors
      input.dispose();
      prediction.dispose();

      // Interpret results
      const risk = predictionData[0];
      const potentialIssues: string[] = [];
      
      if (predictionData[1] > 0.5) potentialIssues.push('CPU overload');
      if (predictionData[2] > 0.5) potentialIssues.push('Memory leak');
      if (predictionData[3] > 0.5) potentialIssues.push('Network congestion');
      if (predictionData[4] > 0.5) potentialIssues.push('Disk I/O bottleneck');

      return {
        risk,
        issues: potentialIssues
      };
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  private async preventiveMaintenance(potentialIssues: string[]): Promise<void> {
    this.feedbackSubject.next('Performing preventive maintenance...');
    
    const maintenanceActions: Record<string, () => Promise<void>> = {
      'CPU overload': async () => {
        await dataStream.sendCommand('throttle', { target: 'cpu', level: 0.8 });
      },
      'Memory leak': async () => {
        await dataStream.sendCommand('restart', { component: 'memory-manager' });
      },
      'Network congestion': async () => {
        await dataStream.sendCommand('optimize', { target: 'network', qos: 'high' });
      }
    };

    for (const issue of potentialIssues) {
      try {
        const action = maintenanceActions[issue];
        if (action) {
          await action();
          console.log(`Preventive action taken for: ${issue}`);
        }
      } catch (error) {
        console.error(`Preventive action failed for ${issue}:`, error);
      }
    }

    this.feedbackSubject.next('Preventive maintenance completed');
  }
}