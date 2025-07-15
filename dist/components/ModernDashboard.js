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
exports.default = ModernDashboard;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = require("react-hot-toast");
const tabs_1 = require("@/components/ui/tabs");
const tooltip_1 = require("@/components/ui/tooltip");
const badge_1 = require("@/components/ui/badge");
const card_1 = require("@/components/ui/card");
const useRealTimeMetrics_1 = require("../hooks/useRealTimeMetrics");
const DataStream_1 = require("../services/DataStream");
const modules = [
    {
        id: 'overview',
        title: 'Overview',
        description: 'System performance metrics',
        alerts: 2,
        color: 'bg-indigo-200',
        icon: <lucide_react_1.Brain className="w-5 h-5"/>,
        metrics: {
            latency: '120ms',
            performance: '94%',
            errors: 3,
            uptime: '99.9%',
            memory: '512MB',
        },
    },
    {
        id: 'network',
        title: 'Network',
        description: 'Network health and traffic',
        alerts: 0,
        color: 'bg-green-200',
        icon: <lucide_react_1.Info className="w-5 h-5"/>,
        metrics: {
            requests: '3500/s',
            bandwidth: '1.2Gbps',
            packetLoss: '0.2%',
        },
    },
];
const categories = ['all', 'development', 'research', 'maintenance'];
function ModernDashboard() {
    const [tab, setTab] = (0, react_1.useState)('overview');
    const [expandedMetrics, setExpandedMetrics] = (0, react_1.useState)({});
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [searchQuery, setSearchQuery] = (0, react_1.useState)('');
    const [selectedCategory, setSelectedCategory] = (0, react_1.useState)('all');
    const [showModal, setShowModal] = (0, react_1.useState)(false);
    const [autoRefresh, setAutoRefresh] = (0, react_1.useState)(true);
    const { diagnostics, repair, improvement, feedback } = (0, useRealTimeMetrics_1.useRealTimeMetrics)();
    (0, react_1.useEffect)(() => {
        fetch('/api/projects.json')
            .then(res => res.json())
            .then(setProjects)
            .catch(console.error);
    }, []);
    (0, react_1.useEffect)(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                fetch('/api/projects.json')
                    .then(res => res.json())
                    .then(setProjects);
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [autoRefresh]);
    const handleTabChange = (newTab) => {
        setTab(newTab);
        react_hot_toast_1.toast.dismiss();
        const module = modules.find(m => m.id === newTab);
        if (module === null || module === void 0 ? void 0 : module.alerts) {
            (0, react_hot_toast_1.toast)(<div className="flex items-start gap-3">
          <lucide_react_1.AlertCircle className="text-yellow-500 mt-0.5 flex-shrink-0"/>
          <div>
            <p className="font-medium">
              {module.title} has {module.alerts} active alert
              {module.alerts > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              Check the monitoring panel for details
            </p>
          </div>
        </div>, { duration: 3000 });
        }
    };
    const toggleMetricExpansion = (moduleId) => {
        setExpandedMetrics(prev => (Object.assign(Object.assign({}, prev), { [moduleId]: !prev[moduleId] })));
    };
    const filteredProjects = projects.filter(p => (selectedCategory === 'all' || p.type === selectedCategory) &&
        (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description.toLowerCase().includes(searchQuery.toLowerCase())));
    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        development: projects.filter(p => p.type === 'development').length,
        attention: projects.filter(p => p.status === 'warning' || p.status === 'error').length,
    };
    return (<div className="modern-layout">
      <div className="glass-container flex">
        {/* Sidebar */}
        <aside className="glass-sidebar">
          <div className="p-6 border-b border-border">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              ANE Explorer
            </h1>
          </div>
          <div className="p-4">
            <div className="relative">
              <lucide_react_1.FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Search projects..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20" onChange={e => setSearchQuery(e.target.value)}/>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {categories.map(cat => (<button key={cat} className={`nav-item${selectedCategory === cat ? ' active' : ''}`} onClick={() => setSelectedCategory(cat)}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-white">Projects Overview</h2>
              <div className="flex gap-3">
                <button className="btn btn-ghost" onClick={() => setAutoRefresh(!autoRefresh)}>
                  <lucide_react_1.RefreshCw className="w-4 h-4 mr-2"/>
                  {autoRefresh ? 'Auto Refresh On' : 'Auto Refresh Off'}
                </button>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                  <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
                  New Project
                </button>
              </div>
            </div>

            <tabs_1.Tabs value={tab} onValueChange={handleTabChange} className="w-full mb-8">
              <tabs_1.TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {modules.map(module => (<tooltip_1.Tooltip key={module.id}>
                    <tooltip_1.TooltipTrigger asChild>
                      <tabs_1.TabsTrigger value={module.id} className="flex flex-col items-center justify-center h-auto py-4 relative">
                        {module.alerts > 0 && (<span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>)}
                        <div className={`p-3 rounded-lg mb-2 ${module.color}`}>{module.icon}</div>
                        <span className="font-medium">{module.title}</span>
                      </tabs_1.TabsTrigger>
                    </tooltip_1.TooltipTrigger>
                    <tooltip_1.TooltipContent side="bottom">{module.description}</tooltip_1.TooltipContent>
                  </tooltip_1.Tooltip>))}
              </tabs_1.TabsList>

              <framer_motion_1.AnimatePresence mode="wait">
                {modules.map(module => (<tabs_1.TabsContent key={module.id} value={module.id}>
                    <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
                      <card_1.Card>
                        <card_1.CardContent className="p-6">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${module.color}`}>{module.icon}</div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-bold">{module.title}</h3>
                                  {module.alerts > 0 && (<badge_1.Badge variant="destructive" className="gap-1">
                                      <lucide_react_1.AlertCircle className="w-4 h-4"/>
                                      {module.alerts} Alert{module.alerts > 1 ? 's' : ''}
                                    </badge_1.Badge>)}
                                </div>
                                <p className="text-muted-foreground mt-1">{module.description}</p>
                              </div>
                            </div>
                            <div className="bg-muted/50 rounded-lg px-4 py-2 flex items-center gap-2">
                              <lucide_react_1.Info className="w-4 h-4 text-muted-foreground"/>
                              <span className="text-sm">Last updated: Just now</span>
                            </div>
                          </div>

                          <div className="mt-8">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-sm font-medium text-muted-foreground">PERFORMANCE METRICS</h4>
                              {Object.keys(module.metrics).length > 3 && (<button onClick={() => toggleMetricExpansion(module.id)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
                                  {expandedMetrics[module.id] ? 'Show Less' : 'Show More'}
                                </button>)}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {Object.entries(module.metrics)
                .slice(0, expandedMetrics[module.id] ? undefined : 3)
                .map(([key, value]) => (<div key={key} className="border rounded-lg p-4 bg-muted/5 hover:bg-muted/10 transition-colors">
                                    <p className="text-sm text-muted-foreground font-medium capitalize">{key}</p>
                                    <p className="text-lg font-semibold mt-1">{value}</p>
                                  </div>))}
                            </div>
                          </div>
                        </card_1.CardContent>
                      </card_1.Card>
                    </framer_motion_1.motion.div>
                  </tabs_1.TabsContent>))}
              </framer_motion_1.AnimatePresence>
            </tabs_1.Tabs>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Object.entries(stats).map(([key, value]) => (<framer_motion_1.motion.div key={key} className="stats-card" whileHover={{ y: -4 }}>
                  <div className="text-3xl font-bold text-primary">{value}</div>
                  <div className="text-sm text-gray-500 mt-1">{key}</div>
                </framer_motion_1.motion.div>))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (<framer_motion_1.motion.div key={project.id} className="project-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{project.name}</h3>
                    <span className={`status-badge ${project.status}`}/>
                  </div>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                  <div className="mt-4 flex justify-between text-sm text-gray-500">
                    <span>v{project.version}</span>
                    <span>{project.lastUpdated}</span>
                  </div>
                </framer_motion_1.motion.div>))}
            </div>

            {/* Diagnostic Controls */}
            <div className="flex gap-3 mt-6 mb-4">
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

            {feedback && (<div className="mb-4 bg-info/10 text-info p-2 rounded">Feedback: {feedback}</div>)}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-4 shadow">
                <h4 className="font-bold mb-2">Diagnostics</h4>
                <pre>{JSON.stringify(diagnostics, null, 2)}</pre>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <h4 className="font-bold mb-2">Repair Status</h4>
                <pre>{JSON.stringify(repair, null, 2)}</pre>
              </div>
              <div className="bg-white rounded-lg p-4 shadow">
                <h4 className="font-bold mb-2">Improvement Status</h4>
                <pre>{JSON.stringify(improvement, null, 2)}</pre>
              </div>
            </div>

            {showModal && (<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
                  <h3 className="font-bold mb-4">Create New Project</h3>
                  {/* Add form fields here */}
                  <button className="btn btn-primary mt-4" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                </div>
              </div>)}
          </div>
        </main>
      </div>
    </div>);
}
