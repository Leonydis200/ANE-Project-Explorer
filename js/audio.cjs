class SoundFX {
    constructor() {
        this.sounds = {
            hover: document.getElementById('hover-sound'),
            click: document.getElementById('click-sound'),
            terminal: document.getElementById('terminal-sound')
        };
        this.setupAudio();
    }
    
    setupAudio() {
        // UI hover effects
        document.querySelectorAll('.cyber-panel, .hud-item, .alert').forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.sounds.hover.currentTime = 0;
                this.sounds.hover.volume = 0.3;
                this.sounds.hover.play();
            });
            
            el.addEventListener('click', () => {
                this.sounds.click.currentTime = 0;
                this.sounds.click.volume = 0.2;
                this.sounds.click.play();
            });
        });
        
        // Terminal interactions
        const terminalInput = document.querySelector('.command-line');
        if (terminalInput) {
            terminalInput.addEventListener('keydown', () => {
                this.sounds.terminal.currentTime = 0;
                this.sounds.terminal.volume = 0.1;
                this.sounds.terminal.play();
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => new SoundFX());
