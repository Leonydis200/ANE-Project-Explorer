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
exports.default = UserPreferences;
const react_1 = __importStar(require("react"));
const ThemeProvider_1 = require("./ThemeProvider");
const lucide_react_1 = require("lucide-react");
function UserPreferences() {
    const { theme, setTheme } = (0, ThemeProvider_1.useTheme)();
    const [preferences, setPreferences] = (0, react_1.useState)(() => {
        const saved = localStorage.getItem('userPreferences');
        return saved ? JSON.parse(saved) : { name: '', notifications: true };
    });
    const updatePreferences = (updates) => {
        const newPrefs = Object.assign(Object.assign({}, preferences), updates);
        setPreferences(newPrefs);
        localStorage.setItem('userPreferences', JSON.stringify(newPrefs));
    };
    return (<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Theme Preference</h3>
        <div className="flex gap-4">
          {[
            { value: 'light', icon: lucide_react_1.Sun, label: 'Light' },
            { value: 'dark', icon: lucide_react_1.Moon, label: 'Dark' },
            { value: 'system', icon: lucide_react_1.Monitor, label: 'System' },
        ].map(({ value, icon: Icon, label }) => (<button key={value} onClick={() => setTheme(value)} className={`flex items-center gap-2 px-4 py-2 rounded-md ${theme === value ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
              <Icon className="w-4 h-4"/>
              {label}
            </button>))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={preferences.notifications} onChange={e => updatePreferences({ notifications: e.target.checked })} className="rounded border-gray-300"/>
          Enable notifications
        </label>
      </div>
    </div>);
}
