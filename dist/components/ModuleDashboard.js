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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModuleDashboard;
const DataStream_1 = require("../services/DataStream");
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const react_router_dom_1 = require("react-router-dom");
const lucide_react_1 = require("lucide-react");
const useLiveMetrics_1 = require("../hooks/useLiveMetrics");
const iconMap = {
    Brain: <lucide_react_1.Brain className="w-5 h-5"/>,
    ActivitySquare: <lucide_react_1.ActivitySquare className="w-5 h-5"/>,
    Bot: <lucide_react_1.Bot className="w-5 h-5"/>,
    Radar: <lucide_react_1.Radar className="w-5 h-5"/>,
    Settings2: <lucide_react_1.Settings2 className="w-5 h-5"/>,
};
function ModuleDashboard() {
    const { metrics, systemHealth, error, refreshData, loading, tab, setTab, connectionStatus, feedback, improvementHistory, triggerUserImprovement } = (0, useLiveMetrics_1.useLiveMetrics)();
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        if (autoRefresh) {
            const interval = setInterval(refreshData, 5000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshData]);
    const currentModule = metrics.find((m) => m.id === tab);
    if (loading)
        return <div className="p-6 text-muted-foreground">Loading modules...</div>;
    if (error)
        return <div className="p-6 text-red-500">{error.message}</div>;
    if (!currentModule)
        return <div className="p-6 text-red-500">Module not found.</div>;
    return (<div className="app-background px-8 py-6">
			<div className="fancy-blur top-0 left-0"/>
			<div className="fancy-blur bottom-0 right-0"/>
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
					ANE System Dashboard
				</h1>
				<div className="flex items-center gap-4">
					<span className={`px-3 py-1 rounded-full ${connectionStatus === 'connected' ? 'bg-success text-white' : 'bg-danger text-white'}`}>
						{connectionStatus}
					</span>
					<button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-4 py-2 rounded-lg ${autoRefresh ? 'bg-primary text-white' : 'bg-gray-200'}`}>
						Auto Refresh
					</button>
					<button onClick={refreshData} className="px-4 py-2 bg-secondary text-white rounded-lg">
						Refresh Now
					</button>
				</div>
			</div>
			<div className="flex gap-2 mb-4">
				{metrics.map((mod) => (<div key={mod.id}>
    						{iconMap[mod.icon]}
    					{mod.title}
    					{mod.description}
  			</div>))}
			</div>
			<div className="flex gap-3 mb-4">
				<button className="btn btn-ghost" onClick={triggerUserImprovement}>
					Run Self-Improvement
				</button>
				<button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfDiagnostics()}>
					Run Diagnostics
				</button>
				<button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfRepair()}>
					Run Self-Repair
				</button>
				<button className="btn btn-ghost" onClick={() => DataStream_1.dataStream.triggerSelfUpdate()}>
					Run Self-Update
				</button>
			</div>
			{feedback && (<div className="mb-4 bg-info/10 text-info p-2 rounded">
					Feedback: {feedback}
				</div>)}
			{improvementHistory.length > 0 && (<div className="mb-4 bg-accent/10 text-accent p-2 rounded">
					Improvement History: {JSON.stringify(improvementHistory)}
				</div>)}
			<div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
				{metrics.map((mod) => (<framer_motion_1.motion.div key={mod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="module-card">
						<div className="flex items-start gap-4 mb-6">
							<div className="p-3 bg-white/10 rounded-xl">
								{iconMap[mod.icon]}
							</div>
							<div>
								<h3 className="text-xl font-semibold text-white mb-1">
									{mod.title}
								</h3>
								<p className="text-white/80 text-sm">
									{mod.description}
								</p>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-6">
							{Object.entries(mod.metrics).map(([key, value]) => (<div key={key} className="metric-card">
									<div className="text-xs uppercase text-foreground/60">
										{key}
									</div>
									<div className="text-lg font-semibold mt-1">
										{value}
									</div>
								</div>))}
						</div>

						<react_router_dom_1.Link to={`/detail/${mod.id}`} className="glass-panel w-full flex items-center justify-center gap-2 py-3 rounded-xl
									 text-primary hover:bg-primary hover:text-white transition-all">
							View Details
							<lucide_react_1.ArrowRight className="w-4 h-4"/>
						</react_router_dom_1.Link>
					</framer_motion_1.motion.div>))}
			</div>
		</div>);
}
