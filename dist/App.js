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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const React = __importStar(require("react"));
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const SidebarLayout_1 = __importDefault(require("@/components/SidebarLayout"));
const ThemeProvider_1 = require("./components/ThemeProvider");
const WelcomeWizard_1 = __importDefault(require("./components/WelcomeWizard"));
const UserPreferences_1 = __importDefault(require("./components/UserPreferences"));
const ModuleDetailPage = (0, react_1.lazy)(() => Promise.resolve().then(() => __importStar(require('@/components/ModuleDetailPage'))));
const iconMap = {
    Brain: <lucide_react_1.Brain className="w-5 h-5"/>,
    ActivitySquare: <lucide_react_1.ActivitySquare className="w-5 h-5"/>,
    Bot: <lucide_react_1.Bot className="w-5 h-5"/>,
    Radar: <lucide_react_1.Radar className="w-5 h-5"/>,
    Settings2: <lucide_react_1.Settings2 className="w-5 h-5"/>,
};
function ModuleDashboard() {
    const [modules, setModules] = (0, react_1.useState)([]);
    const [error, setError] = (0, react_1.useState)(null);
    const location = (0, react_router_dom_1.useLocation)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { moduleId } = (0, react_router_dom_1.useParams)();
    const activeTab = moduleId || 'overview';
    (0, react_1.useEffect)(() => {
        fetch('/api/modules.json')
            .then((res) => res.json())
            .then((data) => setModules(data))
            .catch(() => setError('Failed to load modules.'));
    }, []);
    const current = modules.find((m) => m.id === activeTab);
    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }
    if (!modules.length) {
        return <div className="p-6 text-muted-foreground">Loading modules...</div>;
    }
    if (!current) {
        return <div className="p-6 text-red-500">Module not found.</div>;
    }
    return (<framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="p-6 space-y-6">
      <div className="flex space-x-2 overflow-x-auto border-b border-muted pb-2">
        {modules.map((mod) => (<react_router_dom_1.Link key={mod.id} to={mod.id === 'overview' ? '/' : `/${mod.id}`} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap
              ${activeTab === mod.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`} aria-pressed={activeTab === mod.id} tabIndex={0}>
            {iconMap[mod.icon] || <span className="w-5 h-5"/>}
            {mod.title}
          </react_router_dom_1.Link>))}
      </div>

      <framer_motion_1.motion.div key={current.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-4">
        <div className={`p-4 rounded-lg text-white ${current.color} shadow-lg flex flex-col md:flex-row md:items-center gap-4`}>
          <div className="flex items-center gap-3">
            {iconMap[current.icon] || <span className="w-5 h-5"/>}
            <h2 className="text-xl font-bold">{current.title}</h2>
          </div>
          <div className="flex-1">
            <p className="text-sm opacity-80">{current.description}</p>
          </div>
          <react_router_dom_1.Link to={`/detail/${current.id}`} className="ml-auto mt-2 md:mt-0 px-4 py-2 bg-white text-primary rounded shadow hover:bg-primary hover:text-white transition">
            View Details
          </react_router_dom_1.Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(current.metrics).map(([key, value]) => (<div key={key} className="bg-muted p-4 rounded-lg shadow border border-gray-200">
              <div className="text-xs uppercase text-muted-foreground">{key}</div>
              <div className="text-lg font-semibold text-foreground">{value}</div>
            </div>))}
        </div>
      </framer_motion_1.motion.div>
    </framer_motion_1.motion.div>);
}
// Simple error boundary for the app
function ErrorBoundary({ children }) {
    const [error, setError] = (0, react_1.useState)(null);
    if (error)
        return <div className="p-6 text-red-500">Unexpected error: {error.message}</div>;
    return (<React.Suspense fallback={<div className="p-6">Loading...</div>}>
      {children}
    </React.Suspense>);
}
function App() {
    const [showWizard, setShowWizard] = (0, react_1.useState)(() => !localStorage.getItem('wizardComplete'));
    return (<ThemeProvider_1.ThemeProvider>
      <react_router_dom_1.BrowserRouter>
        <SidebarLayout_1.default>
          {showWizard && <WelcomeWizard_1.default onComplete={() => setShowWizard(false)}/>}
          <ErrorBoundary>
            <react_router_dom_1.Routes>
              <react_router_dom_1.Route path="/" element={<ModuleDashboard />}/>
              <react_router_dom_1.Route path="/:moduleId" element={<ModuleDashboard />}/>
              <react_router_dom_1.Route path="/detail/:moduleId" element={<ModuleDetailPage />}/>
              <react_router_dom_1.Route path="/preferences" element={<UserPreferences_1.default />}/>
            </react_router_dom_1.Routes>
          </ErrorBoundary>
        </SidebarLayout_1.default>
      </react_router_dom_1.BrowserRouter>
    </ThemeProvider_1.ThemeProvider>);
}
