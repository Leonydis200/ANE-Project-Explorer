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
exports.default = UserPanel;
const react_1 = __importStar(require("react"));
function UserPanel() {
    const [name, setName] = (0, react_1.useState)('');
    const [submitted, setSubmitted] = (0, react_1.useState)(false);
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };
    return (<div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4 text-primary">👋 Welcome to ANE Project Explorer</h2>
      {!submitted ? (<form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Enter your name:
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-2 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-primary" placeholder="Your name" required/>
          </label>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80 transition">
            Start Exploring
          </button>
        </form>) : (<div className="text-lg text-gray-800">
          Hello, <span className="font-semibold text-primary">{name}</span>! 🎉
        </div>)}
    </div>);
}
