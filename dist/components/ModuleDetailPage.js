"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModuleDetailPage;
const react_router_dom_1 = require("react-router-dom");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const iconMap = {
    Brain: <lucide_react_1.Brain className="w-8 h-8"/>,
    ActivitySquare: <lucide_react_1.ActivitySquare className="w-8 h-8"/>,
    Bot: <lucide_react_1.Bot className="w-8 h-8"/>,
    Radar: <lucide_react_1.Radar className="w-8 h-8"/>,
    Settings2: <lucide_react_1.Settings2 className="w-8 h-8"/>,
};
function ModuleDetailPage() {
    const { moduleId } = (0, react_router_dom_1.useParams)();
    const [module, setModule] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        fetch('/api/modules.json')
            .then((res) => res.json())
            .then((data) => {
            const found = data.find((m) => m.id === moduleId);
            setModule(found || null);
            setLoading(false);
        })
            .catch(() => {
            setError('Failed to load module.');
            setLoading(false);
        });
    }, [moduleId]);
    if (loading)
        return (<div className="p-6 flex items-center justify-center">
      <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary inline-block mr-2"></span>
      <span>Loading...</span>
    </div>);
    if (error)
        return <div className="p-6 text-red-500">{error}</div>;
    if (!module)
        return <div className="p-6 text-muted-foreground">Module not found.</div>;
    return (<div className="p-4 max-w-2xl mx-auto">
      <react_router_dom_1.Link to="/" className="text-primary underline mb-4 block">&larr; Back to Dashboard</react_router_dom_1.Link>
      <div className={`rounded-xl shadow-lg p-6 ${module.color} text-white`}>
        <div className="flex items-center gap-4 mb-4">
          {iconMap[module.icon] || <lucide_react_1.Brain className="w-8 h-8"/>}
          <h1 className="text-2xl font-bold">{module.title}</h1>
        </div>
        <p className="mb-4">{module.description}</p>
        <div className="mb-6 flex gap-4">
          {Object.entries(module.metrics).map(([key, value]) => (<div key={key} className="bg-white/10 p-4 rounded shadow text-center flex-1">
              <div className="text-xs uppercase text-white/80">{key}</div>
              <div className="text-lg font-semibold">{value}</div>
            </div>))}
        </div>
        <hr className="border-white/30 my-6"/>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Add more details or charts here if needed */}
        </div>
      </div>
    </div>);
}
