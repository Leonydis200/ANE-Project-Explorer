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
exports.default = ModuleTabs;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const iconMap = {
    Brain: lucide_react_1.Brain,
    ActivitySquare: lucide_react_1.ActivitySquare,
    Bot: lucide_react_1.Bot,
    Radar: lucide_react_1.Radar,
    Settings2: lucide_react_1.Settings2,
};
function ModuleTabs() {
    const [modules, setModules] = (0, react_1.useState)([]);
    const [active, setActive] = (0, react_1.useState)('overview');
    (0, react_1.useEffect)(() => {
        fetch('/api/modules.json')
            .then((res) => res.json())
            .then(setModules)
            .catch(console.error);
    }, []);
    return (<div className="w-full max-w-5xl mx-auto">
      <div className="flex space-x-2 border-b border-muted pb-2">
        {modules.map(({ id, icon, title }) => {
            const Icon = iconMap[icon] || lucide_react_1.Brain;
            return (<button key={id} onClick={() => setActive(id)} className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors whitespace-nowrap
                ${active === id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              <Icon className="w-4 h-4"/>
              {title}
            </button>);
        })}
      </div>
      <div className="mt-4">
        {modules.map(({ id, title, description, color }) => active === id ? (<div key={id} className={`rounded-xl p-6 mt-4 shadow-md ${color} text-white animate-fadeIn`}>
              <h2 className="text-xl font-semibold mb-2">{title}</h2>
              <p className="text-sm opacity-90">{description}</p>
            </div>) : null)}
      </div>
    </div>);
}
