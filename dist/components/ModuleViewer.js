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
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
const iconMap = {
    Brain: <lucide_react_1.Brain className="w-8 h-8"/>,
    ActivitySquare: <lucide_react_1.ActivitySquare className="w-8 h-8"/>,
    Bot: <lucide_react_1.Bot className="w-8 h-8"/>,
    Radar: <lucide_react_1.Radar className="w-8 h-8"/>,
    Settings2: <lucide_react_1.Settings2 className="w-8 h-8"/>,
};
const ModuleViewer = ({ activeModule, isDarkMode }) => {
    const [modules, setModules] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        fetch('/api/modules.json')
            .then((res) => res.json())
            .then(setModules)
            .catch(console.error);
    }, []);
    const module = modules.find((m) => m.id === activeModule);
    const borderClass = isDarkMode ? 'border-gray-700' : 'border-gray-200';
    if (!module)
        return <div>Module not found</div>;
    return (<div className={`rounded-2xl shadow-xl p-6 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border ${borderClass}`}>
      <framer_motion_1.motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="flex items-center mb-6">
        <div className={`p-3 rounded-lg ${module.color} text-white mr-4`}>
          {iconMap[module.icon] || <lucide_react_1.Brain className="w-8 h-8"/>}
        </div>
        <div>
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {module.title}
          </h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            {module.description}
          </p>
        </div>
      </framer_motion_1.motion.div>
      <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
        {module.metrics && (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(module.metrics).map(([key, value]) => (<div key={key} className={`p-4 rounded-lg border ${borderClass} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="text-xs uppercase text-muted-foreground">{key}</div>
                <div className="text-lg font-semibold">{value}</div>
              </div>))}
          </div>)}
      </div>
    </div>);
};
exports.default = ModuleViewer;
