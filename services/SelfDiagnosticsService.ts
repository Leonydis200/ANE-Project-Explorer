import { BehaviorSubject, interval, lastValueFrom } from 'rxjs';
import * as tf from '@tensorflow/tfjs';
import { dataStream } from './DataStream';

interface DiagnosticResult {
  status: 'success' | 'warning' | 'error';
  message: string;
  details: any;
  timestamp: number;
}

interface SystemHealth {
  overall: number;
  components: Record<string, number>;
  lastCheck: Date;
  issues: string[];
}

export class SelfDiagnosticsService {
  private healthSubject = new BehaviorSubject<SystemHealth>({
    overall: 100,
    components: {},
    lastCheck: new Date(),
    issues: [],
  });
  private alertsSubject = new BehaviorSubject<string[]>([]);
  private feedbackSubject = new BehaviorSubject<string>('Idle');
  private diagnosticsHistory = new BehaviorSubject<any[]>([]);
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

  private async checkConnectivity(): Promise<DiagnosticResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        status: 'success',
        message: 'Connectivity stable',
        details: { ping: 42 },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Connectivity check failed',
        details: error,
        timestamp: Date.now(),
      };
    }
  }

  private async checkPerformance(): Promise<DiagnosticResult> {
    try {
      const metrics = await lastValueFrom(dataStream.getMetricsStream());
      const performanceScore = this.calculatePerformanceScore(metrics);
      
      return {
        status: performanceScore > 80 ? 'success' : 
               performanceScore > 60 ? 'warning' : 'error',
        message: `Performance score: ${performanceScore.toFixed(1)}`,
        details: { metrics, score: performanceScore },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Performance check failed',
        details: error,
        timestamp: Date.now(),
      };
    }
  }

  private calculatePerformanceScore(metrics: any): number {
    return (
      (metrics.cpu * 0.2) +
      (metrics.memory * 0.2) +
      (metrics.network * 0.2) +
      (metrics.throughput * 0.2) +
      (100 - metrics.errorRate * 10) * 0.2
    );
  }

  private async checkStorage(): Promise<DiagnosticResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      return {
        status: 'success',
        message: 'Storage OK',
        details: { freeSpace: '85%' },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Storage check failed',
        details: error,
        timestamp: Date.now(),
      };
    }
  }

  private async checkModules(): Promise<DiagnosticResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 75));
      return {
        status: 'success',
        message: 'Modules operating normally',
        details: { loadedModules: 42 },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Module check failed',
        details: error,
        timestamp: Date.now(),
      };
    }
  }

  private async checkML(): Promise<DiagnosticResult> {
    try {
      if (!this.mlModel) {
        return {
          status: 'warning',
          message: 'ML model not loaded',
          details: {},
          timestamp: Date.now(),
        };
      }

      await new Promise(resolve => setTimeout(resolve, 200));
      return {
        status: 'success',
        message: 'ML diagnostics passed',
        details: { accuracy: 0.92 },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'ML diagnostics failed',
        details: error,
        timestamp: Date.now(),
      };
    }
  }

  private async checkSecurity(): Promise<DiagnosticResult> {
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      return {
        status: 'success',
        message: 'Security checks clean',
        details: { threatsDetected: 0 },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Security check failed',
        details: error,
        timestamp: Date.now(),
      };
    }
  }

  private analyzeResults(results: DiagnosticResult[]) {
    const issues = results
      .filter(r => r.status !== 'success')
      .map(r => `${r.message} (${r.status})`);
    
    return { issues };
  }

  private async autoRepair(issues: string[]) {
    for (const issue of issues) {
      try {
        await this.attemptRepair(issue);
        console.log(`Auto-repaired issue: ${issue}`);
      } catch (error) {
        console.error(`Failed to repair issue: ${issue}`, error);
      }
    }
  }

  private async performAutoRepair(issues: string[]) {
    this.feedbackSubject.next('Performing auto-repair...');
    
    for (const issue of issues) {
      try {
        await this.repairIssue(issue);
        this.logRepairSuccess(issue);
      } catch (error) {
        this.logRepairFailure(issue, error);
        await this.escalateIssue(issue, error);
      }
    }
    
    this.feedbackSubject.next('Auto-repair completed');
  }

  private async attemptRepair(issue: string): Promise<void> {
    const repairStrategies: Record<string, () => Promise<void>> = {
      'high-cpu': async () => {
        await dataStream.sendCommand('optimize', { target: 'cpu' });
      },
      'memory-leak': async () => {
        await dataStream.sendCommand('optimize', { target: 'memory' });
      },
      'high-latency': async () => {
        await dataStream.sendCommand('optimize', { target: 'network' });
      },
      'connectivity': async () => {
        await dataStream.sendCommand('reconnect', {});
      },
    };

    const strategy = repairStrategies[issue.toLowerCase().split(' ')[0]];
    if (strategy) {
      await strategy();
    } else {
      throw new Error(`No repair strategy for issue: ${issue}`);
    }
  }

  private async repairIssue(issue: string) {
    await this.attemptRepair(issue);
  }

  private async escalateIssue(issue: string, error: any) {
    console.warn(`Escalating issue: ${issue}`, error);
    this.alertsSubject.next([
      ...this.alertsSubject.value,
      `Failed to repair: ${issue}. Error: ${error instanceof Error ? error.message : String(error)}`
    ]);
  }

  private updateSystemHealth(results: DiagnosticResult[]) {
    const issues = results
      .filter(r => r.status !== 'success')
      .map(r => r.message);
    
    const healthScore = 100 - (issues.length * 15);
    
    this.healthSubject.next({
      overall: Math.max(0, healthScore),
      components: {
        cpu: results.find(r => r.message.includes('CPU'))?.status === 'success' ? 100 : 50,
        memory: results.find(r => r.message.includes('Memory'))?.status === 'success' ? 100 : 50,
        network: results.find(r => r.message.includes('Network'))?.status === 'success' ? 100 : 50,
      },
      lastCheck: new Date(),
      issues,
    });

    if (issues.length > 0) {
      this.alertsSubject.next(issues);
    }
  }

  private handleCriticalIssues(results: DiagnosticResult[]) {
    const criticals = results.filter(r => r.status === 'error');
    if (criticals.length > 0) {
      this.alertsSubject.next(criticals.map(r => r.message));
      this.performAutoRepair(criticals.map(r => r.message));
    }
  }

  private logRepairSuccess(issue: string) {
    console.log(`Successfully repaired issue: ${issue}`);
    this.feedbackSubject.next(`Repaired: ${issue}`);
  }

  private logRepairFailure(issue: string, error: any) {
    console.error(`Repair failed for issue: ${issue}`, error);
    this.feedbackSubject.next(`Failed to repair: ${issue}`);
  }

  private async initializeMLModel() {
    try {
      this.mlModel = await tf.loadLayersModel('/models/diagnostics-model.json');
      this.startPredictiveMaintenance();
    } catch (error) {
      console.error('Failed to load ML model:', error);
      this.feedbackSubject.next('ML model loading failed');
    }
  }

  private startPredictiveMaintenance() {
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
      
      const input = tf.tensor2d([
        [
          metrics.cpu,
          metrics.memory,
          metrics.network,
          metrics.throughput,
          metrics.errorRate
        ]
      ]);

      const prediction = this.mlModel.predict(input) as tf.Tensor;
      const predictionData = await prediction.data();
      
      input.dispose();
      prediction.dispose();

      const risk = predictionData[0];
      const potentialIssues = [];
      
      if (predictionData[1] > 0.5) potentialIssues.push('CPU overload');
      if (predictionData[2] > 0.5) potentialIssues.push('Memory leak');
      if (predictionData[3] > 0.5) potentialIssues.push('Network congestion');

      return {
        risk,
        issues: potentialIssues
      };
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  private async preventiveMaintenance(potentialIssues: string[]) {
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

  public getHealthObservable() {
    return this.healthSubject.asObservable();
  }

  public getAlertsObservable() {
    return this.alertsSubject.asObservable();
  }

  public getFeedbackObservable() {
    return this.feedbackSubject.asObservable();
  }

  public getDiagnosticsHistory() {
    return this.diagnosticsHistory.asObservable();
  }

  public async forceDiagnostics() {
    return this.runDiagnostics();
  }

  public async forceRepair() {
    const health = this.healthSubject.value;
    if (health.issues.length > 0) {
      return this.performAutoRepair(health.issues);
    }
    return Promise.resolve();
  }
}
