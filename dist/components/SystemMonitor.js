"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SystemMonitor;
const react_1 = __importDefault(require("react"));
const react_chartjs_2_1 = require("react-chartjs-2");
const framer_motion_1 = require("framer-motion");
const DataStream_1 = require("../services/DataStream");
const SelfDiagnostics_1 = require("../services/SelfDiagnostics");
function SystemMonitor() {
    var _a, _b, _c;
    const [metrics, setMetrics] = useState(null);
    const [health, setHealth] = useState(null);
    const [performanceMetrics, setPerformanceMetrics] = useState({});
    const [optimizationStatus, setOptimizationStatus] = useState({});
    const [update, setUpdate] = useState(null);
    useEffect(() => {
        const subscriptions = [
            DataStream_1.dataStream.getMetricsStream().subscribe(setMetrics),
            SelfDiagnostics_1.selfDiagnostics.getHealthStream().subscribe(setHealth),
            DataStream_1.dataStream.getPerformanceMetrics().subscribe(setPerformanceMetrics),
            DataStream_1.dataStream.getUpdateStream().subscribe(setUpdate)
        ];
        return () => subscriptions.forEach(sub => sub.unsubscribe());
    }, []);
    const chartData = {
        labels: performanceMetrics.timestamps,
        datasets: [
            {
                label: 'CPU Usage',
                data: performanceMetrics.cpu,
                borderColor: '#4caf50',
                fill: false
            },
            {
                label: 'Memory Usage',
                data: performanceMetrics.memory,
                borderColor: '#2196f3',
                fill: false
            }
        ]
    };
    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                },
                title: {
                    display: true,
                    text: 'Time',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Usage',
                },
                ticks: {
                    beginAtZero: true,
                    callback: (value) => `${value}%`,
                },
            },
        },
    };
    return (<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">System Performance</h2>
        <react_chartjs_2_1.Line data={chartData} options={chartOptions}/>
      </framer_motion_1.motion.div>
      
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Health Status</h2>
        <div>
          <span className={`px-3 py-1 rounded-full ${(health === null || health === void 0 ? void 0 : health.overall) > 80 ? 'bg-success text-white' : (health === null || health === void 0 ? void 0 : health.overall) > 60 ? 'bg-warning text-white' : 'bg-danger text-white'}`}>
            {(_a = health === null || health === void 0 ? void 0 : health.overall) !== null && _a !== void 0 ? _a : 'N/A'}%
          </span>
          <div className="mt-2 text-sm text-gray-500">Last check: {(_b = health === null || health === void 0 ? void 0 : health.lastCheck) === null || _b === void 0 ? void 0 : _b.toLocaleString()}</div>
        </div>
      </framer_motion_1.motion.div>
      
      <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Alerts & Notifications</h2>
        <ul>
          {((_c = health === null || health === void 0 ? void 0 : health.issues) === null || _c === void 0 ? void 0 : _c.length)
            ? health.issues.map((issue, idx) => (<li key={idx} className="text-danger">{issue}</li>))
            : <li className="text-success">No critical issues detected.</li>}
        </ul>
        <div className="flex gap-2 mt-4">
          <button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfDiagnostics()}>
            Run Diagnostics
          </button>
          <button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfRepair()}>
            Run Self-Repair
          </button>
          <button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfImprovement()}>
            Run Self-Improvement
          </button>
          <button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfUpdate()}>
            Run Self-Update
          </button>
        </div>
        {update && (<div className="mt-2 text-success bg-success/10 p-2 rounded">
            Update Status: {JSON.stringify(update)}
          </div>)}
      </framer_motion_1.motion.div>
    </div>);
}
