/**
 * CONTROL REMOTO - NAVEGACIÓN TV
 * Maneja los estados: PLAYER -> GUIDE -> KEYBOARD
 */
const Remote = {
    mode: 'PLAYER',

    init() {
        document.addEventListener('keydown', (e) => {
            const keys = {
                'ArrowUp': 'UP', 'ArrowDown': 'DOWN', 
                'ArrowLeft': 'LEFT', 'ArrowRight': 'RIGHT', 
                'Enter': 'OK', 'Backspace': 'BACK', 'Escape': 'BACK'
            };
            const action = keys[e.key];
            if (action) {
                e.preventDefault();
                this.handle(action);
            }
        });
        console.log("🎮 Remote Listo");
    },

    handle(action) {
        // --- ESTADO: VIENDO TELEVISIÓN ---
        if (this.mode === 'PLAYER') {
            if (action === 'OK' || action === 'UP' || action === 'DOWN') {
                this.openGuide();
            } else if (action === 'RIGHT') {
                this.openSocial();
            }
            return;
        }

        // --- ESTADO: NAVEGANDO CANALES (GUÍA IZQUIERDA) ---
        if (this.mode === 'GUIDE') {
            switch(action) {
                case 'UP':
                case 'DOWN':
                    window.moveChannel(action);
                    break;
                case 'OK':
                    window.selectChannel();
                    this.closeAll();
                    break;
                case 'RIGHT':
                    this.openSocial();
                    break;
                case 'BACK':
                case 'LEFT':
                    this.closeAll();
                    break;
            }
            return;
        }

        // --- ESTADO: CHAT / TECLADO (DERECHA) ---
        if (this.mode === 'KEYBOARD') {
            switch(action) {
                case 'LEFT':
                case 'BACK':
                    this.openGuide(); // Volver a los canales
                    break;
                case 'UP':
                case 'DOWN':
                case 'RIGHT':
                    if (typeof Keyboard !== 'undefined') Keyboard.move(action);
                    break;
                case 'OK':
                    // Aquí el teclado procesa la tecla pulsada
                    if (typeof Keyboard !== 'undefined') console.log("Tecla:", Keyboard.getKeyValue());
                    break;
            }
            return;
        }
    },

    openGuide() {
        this.closeAll();
        const guide = document.getElementById('guide');
        if (guide) {
            guide.classList.add('active');
            this.mode = 'GUIDE';
            App.updateFocus();
        }
    },

    openSocial() {
        this.closeAll();
        const panel = document.getElementById('side-panel');
        if (panel) {
            panel.classList.add('active');
            panel.classList.remove('hidden');
            this.mode = 'KEYBOARD';
        }
    },

    closeAll() {
        document.getElementById('guide').classList.remove('active');
        document.getElementById('side-panel').classList.remove('active');
        this.mode = 'PLAYER';
    }
};

// Iniciar
Remote.init();