"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ModernHeader;
const lucide_react_1 = require("lucide-react");
function ModernHeader() {
    return (<header className="dashboard-header">
      <div className="logo-section">
        <div className="logo-icon">
          <lucide_react_1.Brain />
        </div>
        <div>
          <h1 className="text-2xl font-bold">ANE Explorer</h1>
          <p className="text-sm opacity-80">Advanced AI System Monitoring</p>
        </div>
      </div>
      <div className="status-badge">
        <span className="status-indicator"/>
        System Status: Online
      </div>
    </header>);
}
