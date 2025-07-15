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
exports.default = NotificationDrawer;
const react_1 = __importStar(require("react"));
const lucide_react_1 = require("lucide-react");
const framer_motion_1 = require("framer-motion");
function NotificationDrawer({ open, onClose }) {
    const [logs, setLogs] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            const newLog = {
                id: Date.now(),
                message: `Alert: Metric threshold breached at ${new Date().toLocaleTimeString()}`,
                timestamp: new Date().toLocaleString(),
            };
            setLogs(prev => [newLog, ...prev.slice(0, 9)]);
        }, 10000);
        return () => clearInterval(interval);
    }, []);
    return (<framer_motion_1.AnimatePresence>
      {open && (<framer_motion_1.motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} transition={{ duration: 0.3 }} className="fixed top-4 right-4 z-50 mt-2 w-96 max-h-[80vh] overflow-y-auto bg-white dark:bg-zinc-900 border rounded-lg shadow-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-lg">System Alerts</h2>
            <button onClick={onClose}>
              <lucide_react_1.X className="w-4 h-4"/>
            </button>
          </div>
          {logs.length === 0 ? (<p className="text-muted-foreground">No recent alerts.</p>) : (logs.map(log => (<div key={log.id} className="mb-2 p-3 bg-muted rounded">
                <div className="text-sm font-medium">{log.message}</div>
                <div className="text-xs text-muted-foreground">{log.timestamp}</div>
              </div>)))}
        </framer_motion_1.motion.div>)}
    </framer_motion_1.AnimatePresence>);
}
