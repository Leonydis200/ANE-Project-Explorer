"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataStream = exports.DataStreamService = void 0;
const socket_io_client_1 = require("socket.io-client");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class DataStreamService {
    constructor() {
        this.metrics = new rxjs_1.BehaviorSubject(this.getInitialMetrics());
        this.connectionStatus = new rxjs_1.BehaviorSubject('disconnected');
        this.performanceMetrics = new rxjs_1.BehaviorSubject({
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
        });
        this.diagnosticsStream = new rxjs_1.BehaviorSubject(null);
        this.repairStream = new rxjs_1.BehaviorSubject(null);
        this.improvementStream = new rxjs_1.BehaviorSubject(null);
        this.updateStream = new rxjs_1.BehaviorSubject(null);
        this.userCommandStream = new rxjs_1.BehaviorSubject(null);
        this.feedbackStream = new rxjs_1.BehaviorSubject('');
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.socket = (0, socket_io_client_1.io)('http://localhost:3000');
        // Remove these method calls if they don't exist
        // this.setupAutoOptimization();
        // this.initializeMonitoring();
        // this.setupLiveStreams();
        this.socket.on('update', (data) => this.updateStream.next(data));
    }
    initializeSocket() {
        const socket = (0, socket_io_client_1.io)(process.env.REACT_APP_WS_URL || 'ws://localhost:3001', {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 5000
        });
        this.setupSocketHandlers(socket);
        return socket;
    }
    setupSocketHandlers(socket) {
        socket.on('connect', () => {
            this.connectionStatus.next('connected');
            console.log('Connected to metrics server');
        });
        socket.on('disconnect', () => {
            this.connectionStatus.next('disconnected');
            this.handleDisconnect();
        });
        socket.on('metrics', this.handleMetricsUpdate.bind(this));
        socket.on('error', this.handleError.bind(this));
    }
    setupMetricsCollection() {
        (0, rxjs_1.interval)(1000).pipe((0, operators_1.mergeMap)(() => this.collectSystemMetrics().pipe((0, operators_1.retryWhen)(errors => errors.pipe((0, operators_1.map)((error, index) => {
            if (index >= this.maxReconnectAttempts)
                throw error;
            console.warn(`Retrying metrics collection (${index + 1}/${this.maxReconnectAttempts})`, error);
            return index;
        }), (0, operators_1.delay)(1000)))))).subscribe({
            next: metrics => this.metrics.next(metrics),
            error: error => {
                console.error('Fatal metrics collection error:', error);
                this.connectionStatus.next('error');
            }
        });
    }
    getInitialMetrics() {
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
        };
    }
    handleMetricsUpdate(data) {
        this.metrics.next(data);
    }
    handleError(error) {
        this.connectionStatus.next('error');
        console.error('Socket error:', error);
    }
    handleDisconnect() {
        this.reconnectAttempts++;
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
            setTimeout(() => {
                this.socket.connect();
            }, 1000);
        }
        else {
            console.error('Max reconnect attempts reached');
        }
    }
    collectSystemMetrics() {
        // Listen for 'systemMetrics' event from backend for real data
        return new rxjs_1.Observable(subscriber => {
            const handler = (metrics) => {
                subscriber.next(metrics);
                subscriber.complete();
            };
            this.socket.once('systemMetrics', handler);
            this.socket.emit('requestSystemMetrics');
            // Optionally handle completion/error
        });
    }
    getHardwareMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request hardware metrics from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestHardwareMetrics');
                this.socket.once('hardwareMetrics', (metrics) => {
                    resolve(metrics);
                });
                setTimeout(() => reject(new Error('Timeout getting hardware metrics')), 5000);
            });
        });
    }
    getMLMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request ML metrics from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestMLMetrics');
                this.socket.once('mlMetrics', (metrics) => {
                    resolve(metrics);
                });
                setTimeout(() => reject(new Error('Timeout getting ML metrics')), 5000);
            });
        });
    }
    collectCPUMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request CPU metrics from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestCPUMetrics');
                this.socket.once('cpuMetrics', (metrics) => {
                    resolve(metrics);
                });
                setTimeout(() => reject(new Error('Timeout getting CPU metrics')), 5000);
            });
        });
    }
    collectMemoryMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request memory metrics from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestMemoryMetrics');
                this.socket.once('memoryMetrics', (metrics) => {
                    resolve(metrics);
                });
                setTimeout(() => reject(new Error('Timeout getting memory metrics')), 5000);
            });
        });
    }
    collectDiskMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request disk metrics from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestDiskMetrics');
                this.socket.once('diskMetrics', (metrics) => {
                    resolve(metrics);
                });
                setTimeout(() => reject(new Error('Timeout getting disk metrics')), 5000);
            });
        });
    }
    collectNetworkMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request network metrics from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestNetworkMetrics');
                this.socket.once('networkMetrics', (metrics) => {
                    resolve(metrics);
                });
                setTimeout(() => reject(new Error('Timeout getting network metrics')), 5000);
            });
        });
    }
    measureResponseTime() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request response time from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestResponseTime');
                this.socket.once('responseTime', (time) => {
                    resolve(time);
                });
                setTimeout(() => reject(new Error('Timeout getting response time')), 5000);
            });
        });
    }
    calculateErrorRate() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request error rate from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestErrorRate');
                this.socket.once('errorRate', (rate) => {
                    resolve(rate);
                });
                setTimeout(() => reject(new Error('Timeout getting error rate')), 5000);
            });
        });
    }
    measureThroughput() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request throughput from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestThroughput');
                this.socket.once('throughput', (tp) => {
                    resolve(tp);
                });
                setTimeout(() => reject(new Error('Timeout getting throughput')), 5000);
            });
        });
    }
    calculateAvailability() {
        return __awaiter(this, void 0, void 0, function* () {
            // Request availability from backend
            return new Promise((resolve, reject) => {
                this.socket.emit('requestAvailability');
                this.socket.once('availability', (avail) => {
                    resolve(avail);
                });
                setTimeout(() => reject(new Error('Timeout getting availability')), 5000);
            });
        });
    }
    setupMLMetricsCollection() {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup ML metrics collection if needed (no-op for live data)
            return Promise.resolve();
        });
    }
    initializeSystemHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup system health monitoring if needed (no-op for live data)
            return Promise.resolve();
        });
    }
    startRealTimeUpdates() {
        // Listen for real-time updates from backend
        this.socket.on('metrics', (metrics) => {
            this.metrics.next(metrics);
        });
    }
    optimizeCPU() {
        return __awaiter(this, void 0, void 0, function* () {
            // Send optimization command to backend
            this.socket.emit('optimizeCPU');
            return Promise.resolve();
        });
    }
    optimizeMemory() {
        return __awaiter(this, void 0, void 0, function* () {
            // Send optimization command to backend
            this.socket.emit('optimizeMemory');
            return Promise.resolve();
        });
    }
    optimizeNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            // Send optimization command to backend
            this.socket.emit('optimizeNetwork');
            return Promise.resolve();
        });
    }
    notifyOptimizations(optimizations) {
        // Implement optimization notification logic here
        optimizations.forEach(opt => {
            this.feedbackStream.next(`Optimization triggered: ${opt.type} - ${opt.action}`);
        });
    }
    generateSimulatedMetrics() {
        // Fallback simulated metrics
        return Object.assign(Object.assign({}, this.metrics.value), { processingMetrics: {
                messageQueue: Math.floor(Math.random() * 100),
                processingTime: Math.random() * 100,
                errorRate: Math.random() * 5,
                successRate: 95 + Math.random() * 5,
            }, learningMetrics: {
                modelAccuracy: 80 + Math.random() * 20,
                learningRate: Math.random(),
                iterations: Math.floor(Math.random() * 1000),
                lastTrainingDate: new Date(Date.now() - Math.random() * 10000000),
            }, resourceMetrics: {
                cpuUsage: Array.from({ length: 4 }, () => Math.random() * 100),
                memoryUsage: Math.random() * 16384,
                diskSpace: Math.random() * 512000,
                networkBandwidth: Math.random() * 1000,
            } });
    }
}
exports.DataStreamService = DataStreamService;
exports.dataStream = new DataStreamService();
