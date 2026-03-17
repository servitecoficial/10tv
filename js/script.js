let hls = new Hls();
let currentSection = "categories"; 
let selectedCatIndex = 0;
let selectedChIndex = 0;
let savedCountryIndex = 0;
let isMenuOpen = false;
let currentList = [];
let isInsideCountry = false;
let abortController = null;

const FavoritesManager = {
    load() {
        try { return JSON.parse(localStorage.getItem('mis_favoritos')) || []; }
        catch(e) { return []; }
    },
    save(lista) {
        localStorage.setItem('mis_favoritos', JSON.stringify(lista));
    },
    toggle(channel) {
        let favs = this.load();
        const index = favs.findIndex(f => f.name === channel.name);
        if (index > -1) { favs.splice(index, 1); } 
        else {
            favs.push({
                name: channel.name,
                url: channel.url || null,
                id: channel.id || null,
                type: channel.type,
                logo: channel.logo || null
            });
        }
        this.save(favs);
        return favs;
    },
    isFavorite(name) {
        return this.load().some(f => f.name === name);
    }
};

function init() {
    renderCategories();
    updateChannelList();
    setTimeout(() => {
        const sp = document.getElementById('splash');
        if (sp) {
            sp.style.opacity = '0';
            setTimeout(() => {
                sp.style.display = 'none';
                const firstCat = Object.keys(categorias)[0];
                if (categorias[firstCat] && categorias[firstCat][0]) {
                    playChannel(categorias[firstCat][0]);
                }
            }, 1000);
        }
    }, 2500);
    setupControls();
}

// ─── RENDER CARDS: BANDERAS + LOGOS INTELIGENTES ──────────────────────────
function renderCards() {
    const container = document.getElementById('channel-list');
    if (!container) return;
    container.innerHTML = '';

    currentList.forEach((item, i) => {
        const div = document.createElement('div');
        const isFocused = i === selectedChIndex && currentSection === "channels";
        div.className = `card ${isFocused ? 'focused' : ''}`;

        let logoFinal = "";

        // 1. SI ES PAÍS: Usar bandera
        if (item.isCountry && item.code) {
            logoFinal = `https://flagcdn.com/w160/${item.code.toLowerCase()}.png`;
        } 
        // 2. SI ES CANAL Y TIENE LOGO: Usar su logo
        else if (item.logo && item.logo.trim() !== "") {
            logoFinal = item.logo;
        } 
        // 3. SI NO TIENE NADA: Generar Avatar con iniciales (Elegante)
        else {
            // Genera un logo con fondo rojo oscuro y letras blancas
            logoFinal = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=8B0000&color=fff&font-size=0.4&bold=true&rounded=true`;
        }

        div.innerHTML = `
            <img src="${logoFinal}" class="ch-logo" onerror="this.src='https://ui-avatars.com/api/?name=TV&background=333&color=fff'">
            <div class="card-info">
                <div class="title">
                    ${item.name} 
                    ${(!item.isCountry && FavoritesManager.isFavorite(item.name)) ? '<span class="fav-star">⭐</span>' : ''}
                </div>
                ${item.isCountry ? '<div class="subtitle">LISTA M3U PREMIUM</div>' : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

// ─── REPRODUCTOR CON AUDIO DESBLOQUEADO ───────────────────────────────────
function playChannel(ch) {
    if (!ch || ch.isCountry) return;
    
    const pN = document.getElementById('player');
    const pY = document.getElementById('yt-player');
    const loader = document.getElementById('loading-overlay');
    const chTitle = document.getElementById('ch-title');
    const hudLogo = document.getElementById('hud-logo');

    if (loader) loader.style.display = 'flex';
    if (chTitle) chTitle.innerText = ch.name;
    
    // Logo del HUD también con respaldo por si falla
    const hudLogoUrl = ch.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=8B0000&color=fff&bold=true`;
    if (hudLogo) hudLogo.src = hudLogoUrl;

    const safetyTimer = setTimeout(() => { if (loader) loader.style.display = 'none'; }, 6000);

    hls.destroy();
    hls = new Hls();
    pN.pause(); pN.src = ""; pY.src = "";
    pN.style.display = 'none'; pY.style.display = 'none';

    // Muted inicial para evitar bloqueos en la APK
    pN.muted = true;

    if (ch.type === "yt") {
        pY.style.display = 'block';
        pY.src = `https://www.youtube.com/embed/${ch.id}?autoplay=1&controls=0&mute=0&rel=0`;
        setTimeout(() => { if (loader) loader.style.display = 'none'; clearTimeout(safetyTimer); }, 3000);
    } else {
        pN.style.display = 'block';
        if (Hls.isSupported()) {
            hls.loadSource(ch.url);
            hls.attachMedia(pN);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                pN.play().then(() => {
                    clearTimeout(safetyTimer);
                    if (loader) loader.style.display = 'none';
                }).catch(() => { if (loader) loader.style.display = 'none'; });
            });
        }
    }

    document.body.classList.add('ui-show');
    clearTimeout(window._hudTimer);
    window._hudTimer = setTimeout(() => { document.body.classList.remove('ui-show'); }, 4000);
}

// ─── TECLAS Y ACTIVACIÓN DE SONIDO ───────────────────────────────────────
function setupControls() {
    // cualquier interacción del usuario sirve para activar audio automáticamente
    function unmuteAll() {
        const pN = document.getElementById('player');
        const pY = document.getElementById('yt-player');
        if(pN) {
            if(pN.paused) pN.play().catch(()=>{});
            pN.muted = false;
            pN.volume = 1.0;
        }
        if(pY && pY.contentWindow) {
            pY.contentWindow.postMessage(JSON.stringify({ event:'command', func:'unMute', args:[] }), '*');
        }
    }
    document.addEventListener('keydown', (e) => {
<<<<<<< Updated upstream
        unmuteAll();
        const menuItems = ["FAVORITOS", ...Object.keys(categorias)];

        // Long Press Logic para TV
        if (e.key === "Enter" && currentSection === "channels") {
            if (!timer) {
                timer = setTimeout(() => {
                    const ch = currentList[selectedChIndex];
                    if (ch && !ch.isCountry) {
                        FavoritesManager.toggle(ch);
                        showToast(FavoritesManager.isFavorite(ch.name) ? "⭐ AGREGADO A FAVORITOS" : "🗑️ QUITADO DE FAVORITOS");
                        if (menuItems[selectedCatIndex] === "FAVORITOS") updateChannelList();
                        else renderCards();
                    }
                    timer = "fired"; // Marcamos que ya se ejecutó el long press
                }, LONG_PRESS_MS);
            }
=======
        // Al tocar CUALQUIER tecla, el audio se libera
        const pN = document.getElementById('player');
        if (pN && pN.muted) { 
            pN.muted = false; 
            pN.volume = 1.0; 
>>>>>>> Stashed changes
        }

        if (!isMenuOpen) {
            if (e.key === "ArrowDown") zapping(1);
            if (e.key === "ArrowUp") zapping(-1);
            if (e.key === "Enter" || e.key === "ArrowLeft") toggleMenu(true);
            return;
        }

        const menuItems = getMenuItems();
        switch(e.key) {
            case "ArrowDown":
                if (currentSection === "categories") {
                    selectedCatIndex = (selectedCatIndex + 1) % menuItems.length;
                    updateChannelList(); renderCategories();
                } else {
                    selectedChIndex = (selectedChIndex + 1) % currentList.length;
                    renderCards(); scroll();
                }
                break;
            case "ArrowUp":
                if (currentSection === "categories") {
                    selectedCatIndex = (selectedCatIndex - 1 + menuItems.length) % menuItems.length;
                    updateChannelList(); renderCategories();
                } else {
                    selectedChIndex = (selectedChIndex - 1 + currentList.length) % currentList.length;
                    renderCards(); scroll();
                }
                break;
            case "ArrowRight":
                if (currentSection === "categories") { currentSection = "channels"; renderCards(); }
                break;
            case "ArrowLeft":
                if (currentSection === "channels") { currentSection = "categories"; renderCards(); }
                else { toggleMenu(false); }
                break;
            case "Enter":
                if (currentSection === "channels") {
                    const item = currentList[selectedChIndex];
                    if (item.isCountry) enterCountry(item);
                    else { playChannel(item); toggleMenu(false); }
                } else {
                    currentSection = "channels"; renderCards();
                }
                break;
            case "Backspace":
                if (isInsideCountry) { isInsideCountry = false; updateChannelList(); }
                else { toggleMenu(false); }
                break;
        }
    });
}

// ─── FUNCIONES DE LISTA M3U ───────────────────────────────────────────────
async function enterCountry(countryObj) {
    const container = document.getElementById('channel-list');
    container.innerHTML = '<div class="loader-vip"></div>';
    try {
        const res = await fetch(countryObj.url);
        const text = await res.text();
        currentList = parseM3U(text);
        isInsideCountry = true;
        selectedChIndex = 0;
        renderCards();
    } catch (e) { container.innerHTML = '<p>Error al conectar con la lista</p>'; }
}

function parseM3U(data) {
    const channels = [];
    const lines = data.split('\n');
    lines.forEach((line, i) => {
        if (line.startsWith('#EXTINF')) {
            const name = line.split(',')[1]?.trim() || "Canal";
            const url = lines[i + 1]?.trim();
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            const logo = logoMatch ? logoMatch[1] : "";
            if (url && url.startsWith('http')) {
                channels.push({ name, url, type: 'm3u8', logo });
            }
        }
    });
<<<<<<< Updated upstream
    // también desbloquear audio con click/touch por si no hay teclado
    document.addEventListener('click', () => {
        unmuteAll();
    }, { once: true });
}

function playChannel(ch) {
    if(!ch) return;
    const pN = document.getElementById('player');
    const pY = document.getElementById('yt-player');
    const loader = document.getElementById('loading-overlay');
    if(loader) loader.style.display = 'flex';
    document.getElementById('ch-title').innerText = ch.name;
    hls.destroy(); hls = new Hls();
    pN.pause(); pN.src = ""; pY.src = "";
    pN.style.display = 'none'; pY.style.display = 'none';
    // comenzar en silencio para que el video pueda arrancar automáticamente;
    // desactivaremos el mute una vez que haya comenzado la reproducción
    pN.muted = true;
    pN.volume = 1.0;

    if (ch.type === "yt") {
        pY.style.display = 'block';
        pY.src = `https://www.youtube.com/embed/${ch.id}?autoplay=1&controls=0&rel=0&enablejsapi=1`;
        setTimeout(unmuteAll, 1500);
        setTimeout(() => { if(loader) loader.style.display = 'none'; }, 2000);
    } else if (ch.url) {
        pN.style.display = 'block';
        if (Hls.isSupported()) {
            hls.loadSource(ch.url); hls.attachMedia(pN);
            hls.on(Hls.Events.MANIFEST_PARSED, () => { 
                // reproducir en silencio primero para asegurar el autoplay
                let playPromise = pN.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        pN.muted = false; pN.volume = 1.0;
                        if(loader) loader.style.display = 'none';
                    }).catch(()=>{
                        if(loader) loader.style.display = 'none';
                    });
                }
            });
            hls.on(Hls.Events.ERROR, () => { if(loader) loader.style.display = 'none'; });
        } else if (pN.canPlayType('application/vnd.apple.mpegurl')) {
            pN.src = ch.url;
            pN.addEventListener('loadedmetadata', () => { 
                pN.muted = true;
                const fb = pN.play();
                if (fb !== undefined) {
                    fb.then(() => { pN.muted=false; pN.volume=1.0; }).catch(()=>{});
                }
                if(loader) loader.style.display = 'none';
            });
        }
    }
=======
    return channels;
}

// Auxiliares
function getMenuItems() { return ["FAVORITOS", ...Object.keys(categorias)]; }
function renderCategories() {
    const container = document.getElementById('category-list');
    if (!container) return;
    container.innerHTML = '';
    getMenuItems().forEach((cat, i) => {
        const div = document.createElement('div');
        div.className = `cat-item ${i === selectedCatIndex ? 'focused' : ''}`;
        div.innerText = cat;
        container.appendChild(div);
    });
}
function updateChannelList() {
    const menuItems = getMenuItems();
    const catName = menuItems[selectedCatIndex];
    currentList = catName === "FAVORITOS" ? FavoritesManager.load() : (categorias[catName] || []);
    selectedChIndex = 0;
    renderCards();
>>>>>>> Stashed changes
}
function zapping(dir) {
    if (currentList.length === 0) return;
    selectedChIndex = (selectedChIndex + dir + currentList.length) % currentList.length;
    if(!currentList[selectedChIndex].isCountry) playChannel(currentList[selectedChIndex]);
}
function toggleMenu(show) {
    isMenuOpen = show;
    document.getElementById('guide').classList.toggle('active', show);
}
function scroll() {
    const el = document.querySelector('#channel-list .card.focused');
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

window.onload = init;