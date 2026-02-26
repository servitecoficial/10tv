/**
 * 10TV SOCIAL MOD - Versión Final Independiente
 * Lógica de Panel Derecho (Chat) y Efectos Visuales
 */

const SocialMod = {
    isChatOpen: false,
    userName: "Premium_" + Math.floor(Math.random() * 999),
    
    init() {
        console.log("💬 Social Mod: Iniciado en el lado derecho");
        this.renderChatStructure();
        this.setupSocialListeners();
    },

    // 1. CONSTRUIR LA INTERFAZ DEL CHAT
    renderChatStructure() {
        const container = document.getElementById('chat-container');
        if (!container) return;

        container.innerHTML = `
            <div id="chat-messages" style="flex:1; overflow-y:auto; padding:20px; font-family: 'Inter', sans-serif; display:flex; flex-direction:column; gap:10px;">
                <div style="color:var(--accent); font-size:12px; text-align:center; opacity:0.7;">— BIENVENIDO AL CHAT PREMIUM —</div>
            </div>
            <div id="chat-input-area" style="padding:20px; background:rgba(0,0,0,0.3); border-top:1px solid rgba(255,255,255,0.1);">
                <input type="text" id="chat-input" placeholder="Presiona ENTER para hablar..." 
                    style="width: 100%; background: #111; border: 1px solid var(--accent); color: white; padding: 12px; outline:none; border-radius:5px;">
            </div>
        `;
    },

    // 2. LOGICA DE MENSAJERÍA (SIN RECARGA DE PÁGINA)
    sendMessage() {
        const input = document.getElementById('chat-input');
        const text = input.value.trim();
        
        if (text !== "") {
            const msgContainer = document.getElementById('chat-messages');
            const div = document.createElement('div');
            
            // Estilo del mensaje
            div.innerHTML = `<strong style="color:var(--accent)">${this.userName}:</strong> <span style="color:#fff">${text}</span>`;
            div.style.background = "rgba(255,255,255,0.05)";
            div.style.padding = "8px 12px";
            div.style.borderRadius = "5px";
            div.style.animation = "fadeIn 0.3s ease";

            msgContainer.appendChild(div);
            msgContainer.scrollTop = msgContainer.scrollHeight;
            
            input.value = ""; // Limpiar input
            
            // Simular una reacción pequeña al enviar
            this.launchReaction("💬");
        }
    },

    // 3. CONTROL DE PANELES
    toggleChat(show) {
        this.isChatOpen = show;
        const panel = document.getElementById('side-panel');
        if (!panel) return;

        if (show) {
            panel.classList.add('active');
            // Dar foco al input para poder escribir directo
            setTimeout(() => document.getElementById('chat-input').focus(), 400);
        } else {
            panel.classList.remove('active');
            document.getElementById('chat-input').blur();
        }
    },

    // 4. REACCIONES VISUALES
    launchReaction(emoji) {
        const container = document.getElementById('reactions-container');
        if (!container) return;
        
        const el = document.createElement('div');
        el.className = 'reaction-emoji';
        el.innerText = emoji;
        el.style.left = (Math.random() * 70 + 15) + "%"; // Evitar que salgan muy pegados a los bordes
        
        container.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    },

    // 5. MODOS DE CLÍMAX
    setClimax(mode) {
        document.body.className = ''; // Limpia clases previas
        if (mode !== 'default') {
            document.body.classList.add(`climax-${mode}`);
        }
        if (window.showToast) showToast("MODO " + mode.toUpperCase() + " ACTIVADO");
    },

    // 6. ESCUCHA DE TECLAS SMART TV
    setupSocialListeners() {
        document.addEventListener('keydown', (e) => {
            
            // A. SI EL CHAT ESTÁ EN FOCO (ESCRIBIENDO)
            if (document.activeElement.id === 'chat-input') {
                if (e.key === "Enter") {
                    e.preventDefault(); // <--- CRÍTICO: Evita que la web se actualice
                    this.sendMessage();
                }
                if (e.key === "ArrowLeft" || e.key === "Escape") {
                    this.toggleChat(false); // Cerrar al ir a la izquierda
                }
                return; // Bloquea que las teclas afecten a los canales mientras escribes
            }

            // B. SI EL CHAT ESTÁ CERRADO (NAVEGANDO TV)
            if (!this.isChatOpen) {
                // Si NO hay menú de canales abierto, activamos el social
                if (typeof isMenuOpen !== 'undefined' && !isMenuOpen) {
                    switch(e.key) {
                        case "ArrowRight": 
                            this.toggleChat(true); 
                            break;
                        case "l": case "L": 
                            this.launchReaction("❤️"); 
                            break;
                        case "k": case "K": 
                            this.launchReaction("🔥"); 
                            break;
                        case "1": this.setClimax('pareja'); break;
                        case "2": this.setClimax('amigos'); break;
                        case "3": this.setClimax('cine'); break;
                        case "0": this.setClimax('default'); break;
                    }
                }
            } else {
                // Si el chat está abierto pero el input no tiene foco
                if (e.key === "ArrowLeft") this.toggleChat(false);
            }
        });
    }
};

// Iniciar Mod Social
document.addEventListener('DOMContentLoaded', () => SocialMod.init());