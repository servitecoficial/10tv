/**
 * ARCHIVO: js/keyboard.js
 * FUNCIÓN: Teclado virtual premium con navegación inteligente
 * QA STATUS: Verificado - Corrección de salto de filas (Jump-fix)
 */

const Keyboard = {
    element: document.getElementById('custom-keyboard'),
    keys: [
        ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
        ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', 'DEL'],
        ['ESPACIO', 'ENVIAR']
    ],
    currentRow: 0,
    currentCol: 0,

    init() {
        if (!this.element) {
            console.error("❌ [QA] Keyboard: No se encontró el contenedor #custom-keyboard");
            return;
        }
        this.render();
        console.log("⌨️ [QA] Keyboard: Sistema de entrada listo.");
    },

    render() {
        this.element.innerHTML = ''; 
        this.keys.forEach((row, rowIndex) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'keyboard-row';
            
            row.forEach((key, colIndex) => {
                const keyDiv = document.createElement('div');
                keyDiv.className = 'key';
                keyDiv.innerText = key;
                
                // Clases especiales
                if (key === 'ESPACIO') keyDiv.classList.add('space');
                if (key === 'DEL' || key === 'ENVIAR') keyDiv.classList.add('wide');
                
                // Aplicar foco visual
                if (rowIndex === this.currentRow && colIndex === this.currentCol) {
                    keyDiv.classList.add('focused');
                }
                
                rowDiv.appendChild(keyDiv);
            });
            this.element.appendChild(rowDiv);
        });
    },

    move(direction) {
        switch(direction) {
            case 'UP': 
                if (this.currentRow > 0) this.currentRow--; 
                break;
            case 'DOWN': 
                if (this.currentRow < this.keys.length - 1) this.currentRow++; 
                break;
            case 'LEFT': 
                if (this.currentCol > 0) this.currentCol--; 
                break;
            case 'RIGHT': 
                if (this.currentCol < this.keys[this.currentRow].length - 1) this.currentCol++; 
                break;
        }

        // --- QA FIX: Ajuste de columna ---
        // Si al bajar a la última fila la columna actual no existe (ej: col 5 en fila de 2)
        // reubicamos el foco en la última tecla disponible de esa fila.
        if (this.currentCol >= this.keys[this.currentRow].length) {
            this.currentCol = this.keys[this.currentRow].length - 1;
        }

        this.render();
    },

    getKeyValue() {
        const value = this.keys[this.currentRow][this.currentCol];
        
        // Lógica de traducción de teclas especiales
        if (value === 'ESPACIO') return ' ';
        if (value === 'DEL') return 'BACKSPACE';
        if (value === 'ENVIAR') return 'ENTER';
        
        return value;
    }
};

// Inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    Keyboard.init();
});