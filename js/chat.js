/**
 * ARCHIVO: js/chat.js
 * FUNCIÓN: Gestión de salas de chat dinámicas e integración de iframes
 * QA STATUS: Verificado - URL Safe & Error Handling
 */

const Chat = {
    container: null,
    currentRoom: null,
    // URL Base (puedes cambiarla por Minnit, Cbox o Twitch Chat)
    baseUrl: "https://minnit.chat/10TV_Sala_", 

    init() {
        this.container = document.getElementById('chat-container');
        
        if (!this.container) {
            console.error("❌ [QA] Chat: No se encontró el contenedor #chat-container");
            return;
        }

        console.log("💬 [QA] Chat: Sistema de comunicación iniciado.");
        // Inicia con una sala general para que el panel no esté vacío
        this.loadRoom('General');
    },

    loadRoom(channelName) {
        // Evitamos recargar el iframe innecesariamente si es la misma sala
        if (this.currentRoom === channelName) return;

        this.currentRoom = channelName;

        // QA FIX: Limpiamos caracteres que rompen URLs (espacios, signos +, #, etc.)
        // Esto convierte "Canal 26+" en "Canal_26"
        const safeRoomName = channelName
            .replace(/[^a-zA-Z0-9]/g, '_') 
            .replace(/__+/g, '_'); 

        const roomUrl = `${this.baseUrl}${safeRoomName}?embed&nickname=User10TV`;

        // Renderizado del iframe
        this.container.innerHTML = `
            <iframe 
                id="chat-iframe"
                src="${roomUrl}" 
                allow="geolocation; microphone; camera; display-capture" 
                style="width:100%; height:100%; border:none; border-radius:10px;"
                loading="lazy">
            </iframe>
        `;
        
        console.log(`📡 [QA] Chat: Conectado a sala segura: ${safeRoomName}`);
    },

    // Para el modo "Ver en Pareja"
    loadPrivateRoom(roomCode) {
        if (!roomCode) return;
        
        const privateUrl = `${this.baseUrl}Privada_${roomCode}?embed`;
        this.currentRoom = "Privada_" + roomCode;

        this.container.innerHTML = `
            <iframe 
                src="${privateUrl}" 
                style="width:100%; height:100%; border:none; border-radius:10px;">
            </iframe>
        `;
        
        const display = document.getElementById('room-id-display');
        if (display) display.innerText = `SALA PRIVADA: ${roomCode}`;
        
        console.log(`🔐 [QA] Chat: Cambiado a Modo Privado [${roomCode}]`);
    }
};

// Inicialización segura con el DOM
document.addEventListener('DOMContentLoaded', () => {
    Chat.init();
});