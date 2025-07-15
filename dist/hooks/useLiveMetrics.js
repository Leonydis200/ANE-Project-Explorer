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
exports.useLiveMetrics = void 0;
const react_1 = require("react");
const DataStream_1 = require("../services/DataStream");
const SelfDiagnostics_1 = require("../services/SelfDiagnostics");
const SystemImprovement_1 = require("../services/SystemImprovement");
const useLiveMetrics = () => {
    const [metrics, setMetrics] = (0, react_1.useState)([]);
    const [systemHealth, setSystemHealth] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const [diagnostics, setDiagnostics] = (0, react_1.useState)(null);
    const [improvementStatus, setImprovementStatus] = (0, react_1.useState)('idle');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [tab, setTab] = (0, react_1.useState)('overview');
    const [connectionStatus, setConnectionStatus] = (0, react_1.useState)('disconnected');
    const [feedback, setFeedback] = (0, react_1.useState)('');
    const [improvementHistory, setImprovementHistory] = (0, react_1.useState)([]);
    const refreshData = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        setLoading(true);
        try {
            const results = yield SelfDiagnostics_1.selfDiagnostics.runDiagnostics();
            setDiagnostics(results);
            setFeedback('Diagnostics refreshed');
        }
        catch (err) {
            console.error('Diagnostics refresh error:', err);
            setError(err);
        }
        finally {
            setLoading(false);
        }
    }), []);
    const updateMetrics = (data) => {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
        const nlp = data.nlp || {};
        const emotions = data.emotions || {};
        const prediction = data.prediction || {};
        const control = data.control || {};
        const newMetrics = [
            {
                id: 'overview',
                metrics: {
                    uptime: `${(_a = data.uptime) !== null && _a !== void 0 ? _a : 0}%`,
                    nodes: (_b = data.nodes) !== null && _b !== void 0 ? _b : 0,
                    status: (_c = data.status) !== null && _c !== void 0 ? _c : 'unknown',
                },
                health: (_d = data.health) !== null && _d !== void 0 ? _d : 0,
                status: (_e = data.statusLevel) !== null && _e !== void 0 ? _e : 'degraded',
            },
            {
                id: 'nlp',
                metrics: {
                    throughput: `${(_f = nlp.throughput) !== null && _f !== void 0 ? _f : 0} req/min`,
                    models: (_g = nlp.models) !== null && _g !== void 0 ? _g : 0,
                    latency: `${(_h = nlp.latency) !== null && _h !== void 0 ? _h : 0}ms`,
                },
                health: (_j = nlp.health) !== null && _j !== void 0 ? _j : 0,
                status: (_k = nlp.status) !== null && _k !== void 0 ? _k : 'degraded',
            },
            {
                id: 'emotions',
                metrics: {
                    sentimentAccuracy: `${(_l = emotions.sentimentAccuracy) !== null && _l !== void 0 ? _l : 0}%`,
                    emotionalRange: `${(_m = emotions.emotionalRange) !== null && _m !== void 0 ? _m : 0} layers`,
                },
                health: (_o = emotions.health) !== null && _o !== void 0 ? _o : 0,
                status: (_p = emotions.status) !== null && _p !== void 0 ? _p : 'degraded',
            },
            {
                id: 'prediction',
                metrics: {
                    predictionAccuracy: `${(_q = prediction.predictionAccuracy) !== null && _q !== void 0 ? _q : 0}%`,
                    modelsTrained: (_r = prediction.modelsTrained) !== null && _r !== void 0 ? _r : 0,
                },
                health: (_s = prediction.health) !== null && _s !== void 0 ? _s : 0,
                status: (_t = prediction.status) !== null && _t !== void 0 ? _t : 'degraded',
            },
            {
                id: 'control',
                metrics: {
                    activeProcesses: (_u = control.activeProcesses) !== null && _u !== void 0 ? _u : 0,
                    systemLoad: `${(_v = control.systemLoad) !== null && _v !== void 0 ? _v : 0}%`,
                    alerts: (_w = control.alerts) !== null && _w !== void 0 ? _w : 0,
                },
                health: (_x = control.health) !== null && _x !== void 0 ? _x : 0,
                status: (_y = control.status) !== null && _y !== void 0 ? _y : 'degraded',
            },
        ];
        setMetrics(newMetrics);
    };
    (0, react_1.useEffect)(() => {
        const subscriptions = [
            DataStream_1.dataStream.getMetricsStream().subscribe(data => {
                setSystemHealth(data);
                updateMetrics(data);
            }),
            SelfDiagnostics_1.selfDiagnostics.getHealthStream().subscribe(setDiagnostics),
            SystemImprovement_1.systemImprovement.getStatusStream().subscribe(setImprovementStatus),
            DataStream_1.dataStream.getConnectionStatus().subscribe(setConnectionStatus),
            SystemImprovement_1.systemImprovement.getFeedbackStream().subscribe(setFeedback),
            SystemImprovement_1.systemImprovement.getImprovementHistory().subscribe(setImprovementHistory),
        ];
        SelfDiagnostics_1.selfDiagnostics.startMonitoring();
        setLoading(false);
        return () => {
            subscriptions.forEach(sub => sub.unsubscribe());
        };
    }, []);
    return {
        metrics,
        systemHealth,
        error,
        diagnostics,
        improvementStatus,
        refreshData,
        loading,
        tab,
        setTab,
        connectionStatus,
        feedback,
        improvementHistory,
        triggerUserImprovement: SystemImprovement_1.systemImprovement.triggerUserImprovement.bind(SystemImprovement_1.systemImprovement),
    };
};
exports.useLiveMetrics = useLiveMetrics;
