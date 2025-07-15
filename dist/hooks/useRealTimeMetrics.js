"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRealTimeMetrics = useRealTimeMetrics;
const react_1 = require("react");
const DataStream_1 = require("../services/DataStream");
const SelfDiagnostics_1 = require("../services/SelfDiagnostics");
function useRealTimeMetrics() {
    const [metrics, setMetrics] = (0, react_1.useState)(null);
    const [health, setHealth] = (0, react_1.useState)(null);
    const [alerts, setAlerts] = (0, react_1.useState)([]);
    const [diagnostics, setDiagnostics] = (0, react_1.useState)(null);
    const [repair, setRepair] = (0, react_1.useState)(null);
    const [improvement, setImprovement] = (0, react_1.useState)(null);
    const [update, setUpdate] = (0, react_1.useState)(null);
    const [connectionStatus, setConnectionStatus] = (0, react_1.useState)('disconnected');
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [feedback, setFeedback] = (0, react_1.useState)('');
    const [userCommand, setUserCommand] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const subscriptions = [
            DataStream_1.dataStream.getMetricsStream().subscribe(setMetrics),
            SelfDiagnostics_1.selfDiagnostics.getHealthStream().subscribe(setHealth),
            SelfDiagnostics_1.selfDiagnostics.getAlertsStream().subscribe(setAlerts),
            DataStream_1.dataStream.getDiagnosticsStream().subscribe(setDiagnostics),
            DataStream_1.dataStream.getRepairStream().subscribe(setRepair),
            DataStream_1.dataStream.getImprovementStream().subscribe(setImprovement),
            DataStream_1.dataStream.getUpdateStream().subscribe(setUpdate),
            DataStream_1.dataStream.getConnectionStatus().subscribe(setConnectionStatus),
            DataStream_1.dataStream.getFeedbackStream().subscribe(setFeedback),
            DataStream_1.dataStream.getUserCommandStream().subscribe(setUserCommand),
        ];
        setIsLoading(false);
        return () => {
            subscriptions.forEach((sub) => sub.unsubscribe());
        };
    }, []);
    return {
        metrics,
        health,
        alerts,
        diagnostics,
        repair,
        improvement,
        update,
        isLoading,
        hasAlerts: (alerts === null || alerts === void 0 ? void 0 : alerts.length) > 0,
        connectionStatus,
        feedback,
        userCommand,
        sendUserCommand: DataStream_1.dataStream.sendUserCommand.bind(DataStream_1.dataStream),
    };
}
