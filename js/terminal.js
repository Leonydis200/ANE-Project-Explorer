const terminal = {
    init() {
        this.output = document.querySelector('.terminal-output');
        this.input = document.querySelector('.command-line');
        this.setupEvents();
        this.printWelcome();
    },
    
    setupEvents() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.processCommand(this.input.value);
                this.input.value = '';
            }
        });
    },
    
    printWelcome() {
        this.printLine('Autonomous Nexus Entity Terminal v3.1.4');
        this.printLine('Type "help" for available commands');
        this.printLine('');
    },
    
    printLine(text) {
        const line = document.createElement('div');
        line.textContent = text;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    },
    
    processCommand(cmd) {
        this.printLine(`ANE:~$ ${cmd}`);
        
        switch(cmd.toLowerCase()) {
            case 'help':
                this.printLine('Available commands:');
                this.printLine('  status - Show system status');
                this.printLine('  nodes - List active nodes');
                this.printLine('  clear - Clear terminal');
                this.printLine('  scan - Run diagnostic scan');
                break;
                
            case 'status':
                this.printLine('System Status: ONLINE');
                this.printLine('Uptime: 99.97%');
                this.printLine('Threat Level: NOMINAL');
                break;
                
            case 'nodes':
                this.printLine('Active Nodes (42):');
                this.printLine('  Core-01 to Core-42: Operational');
                break;
                
            case 'scan':
                this.printLine('Initiating diagnostic scan...');
                setTimeout(() => {
                    this.printLine('Scan complete: No critical issues detected');
                }, 1500);
                break;
                
            case 'clear':
                this.output.innerHTML = '';
                break;
                
            default:
                this.printLine(`Command not found: ${cmd}`);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => terminal.init());
