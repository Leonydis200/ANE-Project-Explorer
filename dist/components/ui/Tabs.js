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
exports.TabsContent = exports.Tabs = void 0;
const React = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const Tabs = ({ tabs, activeTab, onChange, children, divProps }) => {
    const tabRefs = React.useRef([]);
    // Keyboard navigation
    const handleKeyDown = (e, idx) => {
        var _a, _b;
        if (e.key === 'ArrowRight') {
            (_a = tabRefs.current[(idx + 1) % tabs.length]) === null || _a === void 0 ? void 0 : _a.focus();
        }
        else if (e.key === 'ArrowLeft') {
            (_b = tabRefs.current[(idx - 1 + tabs.length) % tabs.length]) === null || _b === void 0 ? void 0 : _b.focus();
        }
    };
    return (<div {...divProps}>
      <div className="flex space-x-4 border-b border-muted p-2" role="tablist">
        {tabs.map((tab, idx) => (<button key={tab.value} ref={el => tabRefs.current[idx] = el} onClick={() => onChange(tab.value)} onKeyDown={e => handleKeyDown(e, idx)} role="tab" aria-selected={activeTab === tab.value} tabIndex={activeTab === tab.value ? 0 : -1} className={`pb-2 px-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.value
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab.title}
          </button>))}
      </div>
      <div className="relative min-h-[100px] mt-4" role="tabpanel">
        {children}
      </div>
    </div>);
};
exports.Tabs = Tabs;
const TabsContent = ({ value, activeTab, children }) => {
    return (<framer_motion_1.AnimatePresence mode="wait">
      {activeTab === value && (<framer_motion_1.motion.div key={value} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          {children}
        </framer_motion_1.motion.div>)}
    </framer_motion_1.AnimatePresence>);
};
exports.TabsContent = TabsContent;
