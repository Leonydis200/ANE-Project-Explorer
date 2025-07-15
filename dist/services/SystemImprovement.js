"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.systemImprovement = exports.SystemImprovementService = void 0;
const DataStream_1 = require("./DataStream");
const rxjs_1 = require("rxjs");
const tf = __importStar(require("@tensorflow/tfjs"));
const SelfDiagnostics_1 = require("./SelfDiagnostics");
class SystemImprovementService {
    constructor() {
        this.metrics = new rxjs_1.BehaviorSubject({
            performanceScore: 0,
            optimizationLevel: 0,
            lastImprovement: new Date(),
            suggestions: []
        });
        this.statusStream = new rxjs_1.BehaviorSubject('idle');
        this.feedbackStream = new rxjs_1.BehaviorSubject('Idle');
        this.improvementHistory = new rxjs_1.BehaviorSubject([]);
        this.initializeImprovement();
    }
    getStatusStream() {
        return this.statusStream.asObservable();
    }
    getFeedbackStream() {
        return this.feedbackStream.asObservable();
    }
    getImprovementHistory() {
        return this.improvementHistory.asObservable();
    }
    triggerUserImprovement() {
        return __awaiter(this, void 0, void 0, function* () {
            this.feedbackStream.next('User improvement triggered');
            yield this.analyzeAndImprove();
            this.improvementHistory.next([
                ...this.improvementHistory.value,
                { time: new Date(), status: 'completed' }
            ]);
        });
    }
    initializeImprovement() {
        setInterval(() => this.analyzeAndImprove(), 3600000); // Every hour
    }
    analyzeAndImprove() {
        return __awaiter(this, void 0, void 0, function* () {
            this.statusStream.next('analyzing');
            const currentMetrics = yield (0, rxjs_1.lastValueFrom)(DataStream_1.dataStream.getMetricsStream());
            const diagnostics = yield SelfDiagnostics_1.selfDiagnostics.runDiagnostics();
            const improvements = this.calculateImprovements(currentMetrics, diagnostics);
            const optimizations = yield this.applyImprovements(improvements);
            this.metrics.next({
                performanceScore: this.calculatePerformanceScore(currentMetrics),
                optimizationLevel: optimizations.level,
                lastImprovement: new Date(),
                suggestions: optimizations.suggestions
            });
            this.statusStream.next('idle');
        });
    }
    analyzeAndOptimize() {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = yield this.getCurrentMetrics();
            const model = yield this.loadOptimizationModel();
            const suggestions = yield model.predict(metrics);
            yield this.applyOptimizations(suggestions);
            this.updateLearningRate(suggestions);
        });
    }
    calculatePerformanceScore(metrics) {
        return ((metrics.cpu * 0.2) +
            (metrics.memory * 0.2) +
            (metrics.network * 0.2) +
            (metrics.throughput * 0.2) +
            (100 - metrics.errorRate * 10) * 0.2);
    }
    calculateImprovements(metrics, diagnostics) {
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
    applyImprovements(improvements) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = {
                level: 0,
                suggestions: []
            };
            for (const imp of improvements) {
                try {
                    yield DataStream_1.dataStream.sendCommand('improve', imp);
                    results.level += 1;
                    results.suggestions.push(`Applied ${imp.type} improvement for ${imp.target}`);
                }
                catch (error) {
                    console.error(`Failed to apply improvement:`, error);
                    results.suggestions.push(`Failed to improve ${imp.target}: ${error.message}`);
                }
            }
            return results;
        });
    }
    applyOptimizations(suggestions) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const suggestion of suggestions) {
                try {
                    yield this.validateOptimization(suggestion);
                    yield this.implementOptimization(suggestion);
                    this.logSuccess(suggestion);
                }
                catch (error) {
                    this.logFailure(error);
                    yield this.rollback(suggestion);
                }
            }
        });
    }
    loadOptimizationModel() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield tf.loadLayersModel('/models/optimization.json');
        });
    }
    // --- Stubbed helper methods ---
    getCurrentMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
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
                    status: 'healthy'
                },
                emotions: {
                    sentimentAccuracy: 0,
                    emotionalRange: 0,
                    health: 100,
                    status: 'healthy'
                },
                prediction: {
                    predictionAccuracy: 0,
                    modelsTrained: 0,
                    health: 100,
                    status: 'healthy'
                },
                control: {
                    activeProcesses: 0,
                    systemLoad: 0,
                    alerts: 0,
                    health: 100,
                    status: 'healthy'
                },
                performance: {
                    cpu: {
                        usage: 0,
                        temperature: 0,
                        cores: []
                    },
                    memory: {
                        total: 0,
                        used: 0,
                        free: 0,
                        cached: 0
                    },
                    storage: {
                        total: 0,
                        used: 0,
                        free: 0,
                        readSpeed: 0,
                        writeSpeed: 0
                    }
                },
                selfImprovement: {
                    lastOptimization: new Date(),
                    optimizationScore: 0,
                    learningRate: 0,
                    adaptationLevel: 0
                }
            };
        });
    }
    updateLearningRate(suggestions) {
        // Implementation
    }
    validateOptimization(suggestion) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementation
        });
    }
    implementOptimization(suggestion) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementation
        });
    }
    rollback(suggestion) {
        return __awaiter(this, void 0, void 0, function* () {
            // Implementation
        });
    }
    logSuccess(suggestion) {
        console.log('Optimization applied successfully:', suggestion);
    }
    logFailure(error) {
        console.error('Optimization failed:', error);
    }
}
exports.SystemImprovementService = SystemImprovementService;
// ✅ Export the singleton
exports.systemImprovement = new SystemImprovementService();
