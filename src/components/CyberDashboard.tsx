import React, { useEffect } from 'react'
import Chart from 'chart.js/auto'
import './CyberDashboard.css' // Move the CSS to a separate file

export default function CyberDashboard() {
  useEffect(() => {
    const ctx = document.getElementById('uptime-graph') as HTMLCanvasElement
    if (!ctx) return

    const labels: string[] = []
    const data: number[] = []
    const now = new Date()

    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now)
      hour.setHours(now.getHours() - i)
      labels.push(hour.getHours().toString().padStart(2, '0') + ':00')
      data.push(95 + Math.random() * 5)
    }

    new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Uptime %',
          data,
          borderColor: '#0ff',
          backgroundColor: 'rgba(0, 255, 255, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#f0f',
          pointRadius: 4,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            min: 90,
            max: 100
          }
        }
      }
    })
  }, [])

  return (
    <div className="terminal-grid">
      <header className="header">
        <h1 className="glitch-text" data-text="CYBERNETIC DASHBOARD">CYBERNETIC DASHBOARD</h1>
        <div className="subtitle">SYSTEM MONITORING & ALERT CONSOLE</div>
      </header>

      <section className="cyber-panel">
        <h2 className="panel-title">SYSTEM METRICS</h2>
        <div className="metrics-grid">
          <div className="metric-card"><div className="metric-title">CPU Utilization</div><div className="metric-value">78%</div></div>
          <div className="metric-card"><div className="metric-title">Memory Usage</div><div className="metric-value">64%</div></div>
          <div className="metric-card"><div className="metric-title">Network Throughput</div><div className="metric-value">3.2Gbps</div></div>
          <div className="metric-card"><div className="metric-title">Storage Capacity</div><div className="metric-value">87%</div></div>
        </div>
      </section>

      <section className="cyber-panel">
        <h2 className="panel-title">SYSTEM ALERTS</h2>
        <ul className="cyber-alerts">
          <li className="alert-item">⚠️ Alert: Metric threshold breached at 06:58:42</li>
          <li className="alert-item">🔒 Security: Unauthorized access attempt detected</li>
          <li className="alert-item">🚨 Critical: Cooling system failure in Sector 7</li>
        </ul>
      </section>

      <section className="cyber-panel cyber-graph">
        <h2 className="panel-title">UPTIME MONITORING</h2>
        <div className="chart-container">
          <canvas id="uptime-graph"></canvas>
        </div>
      </section>

      <footer className="status-bar">
        <div className="system-time">00:00</div>
        <div className="system-status">STATUS: OPERATIONAL</div>
        <div>NETWORK: SECURE</div>
      </footer>
    </div>
  )
}
