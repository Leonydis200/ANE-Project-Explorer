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
exports.default = WelcomeWizard;
const react_1 = __importStar(require("react"));
const framer_motion_1 = require("framer-motion");
const lucide_react_1 = require("lucide-react");
const steps = [
    {
        title: 'Welcome to ANE Project Explorer',
        content: "Let's get you set up with your personalized experience.",
    },
    {
        title: 'Choose Your Theme',
        content: 'Select your preferred visual theme for the best experience.',
    },
    {
        title: 'Module Navigation',
        content: 'Explore different modules using the sidebar navigation.',
    },
];
function WelcomeWizard({ onComplete }) {
    const [step, setStep] = (0, react_1.useState)(0);
    const [preferences, setPreferences] = (0, react_1.useState)({
        name: '',
        theme: 'system',
        notifications: true,
    });
    const handleComplete = () => {
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        localStorage.setItem('wizardComplete', 'true');
        onComplete();
    };
    return (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
        <framer_motion_1.AnimatePresence mode="wait">
          <framer_motion_1.motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">{steps[step].title}</h2>
            <p className="text-gray-600 dark:text-gray-300">{steps[step].content}</p>
            
            {/* Step-specific content */}
            {step === 0 && (<input type="text" placeholder="Enter your name" className="w-full p-2 border rounded" value={preferences.name} onChange={e => setPreferences(p => (Object.assign(Object.assign({}, p), { name: e.target.value })))}/>)}
            
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(s => s - 1)} className={`flex items-center ${step === 0 ? 'invisible' : ''}`}>
                <lucide_react_1.ChevronLeft className="w-4 h-4 mr-1"/> Back
              </button>
              
              <button onClick={() => {
            if (step === steps.length - 1)
                handleComplete();
            else
                setStep(s => s + 1);
        }} className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80">
                {step === steps.length - 1 ? 'Get Started' : 'Next'}
                {step !== steps.length - 1 && <lucide_react_1.ChevronRight className="w-4 h-4 ml-1"/>}
              </button>
            </div>
          </framer_motion_1.motion.div>
        </framer_motion_1.AnimatePresence>
      </div>
    </framer_motion_1.motion.div>);
}
