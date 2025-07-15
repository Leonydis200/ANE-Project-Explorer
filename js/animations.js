class CyberGraph {
    constructor(elementId, values, color) {
        this.canvas = document.getElementById(elementId);
        this.ctx = this.canvas.getContext('2d');
        this.values = values;
        this.color = color;
        this.setupCanvas();
        this.animate();
    }
    
    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = 'rgba(0, 255, 100, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const y = (i / 4) * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
        
        // Draw graph
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        
        const step = this.canvas.width / (this.values.length - 1);
        this.values.forEach((value, index) => {
            const x = index * step;
            const y = this.canvas.height - (value / 100) * this.canvas.height;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Add glow effect
        this.ctx.shadowColor = this.color;
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
    // Generate some random data for the graph
    const uptimeData = Array.from({length: 50}, () => 95 + Math.random() * 5);
    new CyberGraph('uptime-graph', uptimeData, '#00f0ff');
});
