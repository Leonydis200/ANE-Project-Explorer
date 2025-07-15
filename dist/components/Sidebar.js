"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Sidebar;
const react_1 = __importDefault(require("react"));
const lucide_react_1 = require("lucide-react");
const sidebarItems = [
    { id: 'dashboard', icon: lucide_react_1.Home, label: 'Dashboard' },
    { id: 'notifications', icon: lucide_react_1.Bell, label: 'Alerts' },
    { id: 'info', icon: lucide_react_1.Info, label: 'Info' },
    { id: 'settings', icon: lucide_react_1.Settings2, label: 'Settings' },
];
function Sidebar({ active, onSelect }) {
    return (<aside className="flex flex-col items-center py-6 px-2 space-y-6 bg-muted w-16 shadow-md">
      {sidebarItems.map(({ id, icon: Icon, label }) => (<button key={id} onClick={() => onSelect(id)} className={`p-2 rounded-md transition-colors hover:bg-primary/20 ${active === id ? 'bg-primary text-white' : 'text-muted-foreground'}`} title={label}>
          <Icon className="w-5 h-5"/>
        </button>))}
    </aside>);
}
