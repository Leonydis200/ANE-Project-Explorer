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
exports.default = EnhancedModuleDashboard;
// EnhancedModuleDashboard.tsx
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const Tabs_1 = require("@/components/ui/Tabs");
const lucide_react_1 = require("lucide-react");
const iconMap = {
    Brain: <lucide_react_1.Brain className="w-5 h-5"/>,
    ActivitySquare: <lucide_react_1.ActivitySquare className="w-5 h-5"/>,
    Bot: <lucide_react_1.Bot className="w-5 h-5"/>,
    Radar: <lucide_react_1.Radar className="w-5 h-5"/>,
    Settings2: <lucide_react_1.Settings2 className="w-5 h-5"/>,
};
function EnhancedModuleDashboard() {
    const [modules, setModules] = (0, react_1.useState)([]);
    const [tab, setTab] = (0, react_1.useState)('overview');
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        fetch('/api/modules.json')
            .then((res) => res.json())
            .then((data) => {
            setModules(data);
            setLoading(false);
        })
            .catch(() => {
            setError('Failed to load modules.');
            setLoading(false);
        });
    }, []);
    const currentModule = modules.find((m) => m.id === tab);
    if (loading)
        return <div className="p-6 text-muted-foreground">Loading modules...</div>;
    if (error)
        return <div className="p-6 text-red-500">{error}</div>;
    if (!currentModule)
        return <div className="p-6 text-red-500">Module not found.</div>;
    return (<div className="p-6 space-y-6 max-w-7xl mx-auto">
			<Tabs_1.Tabs tabs={modules.map(m => ({ title: m.title, value: m.id }))} activeTab={tab} onChange={setTab}>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
					{modules.map((mod) => (<button key={mod.id} onClick={() => setTab(mod.id)} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap
								${tab === mod.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
							{iconMap[mod.icon] || <span className="w-5 h-5"/>}
							<span className="text-sm font-medium">{mod.title}</span>
						</button>))}
				</div>
				<Tabs_1.TabsContent value={tab} activeTab={tab}>
					<framer_motion_1.motion.div key={tab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="space-y-4">
						<div className={`p-4 rounded-lg text-white ${currentModule.color} shadow-lg flex flex-col md:flex-row md:items-center gap-4`}>
							<div className="flex items-center gap-3">
								{iconMap[currentModule.icon] || <span className="w-5 h-5"/>}
								<h2 className="text-xl font-bold">{currentModule.title}</h2>
							</div>
							<div className="flex-1">
								<p className="text-sm opacity-80">{currentModule.description}</p>
							</div>
							<a href={`/detail/${currentModule.id}`} className="ml-auto mt-2 md:mt-0 px-4 py-2 bg-white text-primary rounded shadow hover:bg-primary hover:text-white transition">
								View Details
							</a>
						</div>
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
							{Object.entries(currentModule.metrics).map(([key, value]) => (<div key={key} className="bg-muted p-4 rounded-lg shadow border border-gray-200">
									<div className="text-xs uppercase text-muted-foreground">{key}</div>
									<div className="text-lg font-semibold text-foreground">{value}</div>
								</div>))}
						</div>
					</framer_motion_1.motion.div>
				</Tabs_1.TabsContent>
			</Tabs_1.Tabs>
		</div>);
}
