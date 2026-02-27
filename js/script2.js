let hls = new Hls();
let currentSection = "categories";
let selectedCatIndex = 0;
let selectedChIndex = 0;
let isMenuOpen = false;
let currentList = [];
let isInsideCountry = false;
let timer;
const LONG_PRESS_MS = 800;

// --- GESTIÓN DE FAVORITOS ---
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
        if (index > -1) favs.splice(index, 1);
        else favs.push({ name: channel.name, url: channel.url, id: channel.id, type: channel.type, logo: channel.logo });
        this.save(favs);
        return favs;
    },
    isFavorite(name) { return this.load().some(f => f.name === name); }
};

// --- INICIALIZACIÓN ---
function init() {
    renderCategories();
    updateChannelList();
    
    // Quitar Splash automáticamente
    setTimeout(() => {
        const sp = document.getElementById('splash');
        if(sp) {
            sp.style.opacity = '0';
            setTimeout(() => { 
                sp.style.display = 'none'; 
                // Arrancar el primer canal al inicio
                if(currentList.length > 0) playChannel(currentList[0]);
            }, 800);
        }
    }, 3000);

    setupControls();
}

// --- REPRODUCTOR (FIX LOGO PLAY TRABADO) ---
function playChannel(ch) {
    if(!ch || ch.isCountry) return;
    
    const pN = document.getElementById('player');
    const pY = document.getElementById('yt-player');
    const loader = document.getElementById('loading-overlay');
    const hudLogo = document.getElementById('hud-logo');
    const chTitle = document.getElementById('ch-title');

    if(loader) loader.style.display = 'flex';
    if(chTitle) chTitle.innerText = ch.name;
    
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=8B0000&color=fff&bold=true`;
    if(hudLogo) hudLogo.src = ch.logo || fallback;

    hls.destroy();
    hls = new Hls();
    pN.pause(); pN.src = ""; pY.src = "";
    pN.style.display = 'none'; pY.style.display = 'none';

    // CONFIGURACIÓN CRÍTICA PARA ANDROID
    pN.muted = true;      // Mute inicial para saltar bloqueo de Android
    pN.autoplay = true;   // Forzar auto-arranque
    pN.setAttribute('playsinline', 'true');

    if (ch.type === "yt") {
        pY.style.display = 'block';
        pY.src = `https://www.youtube.com/embed/${ch.id}?autoplay=1&mute=1&controls=0&rel=0`;
        setTimeout(() => { if(loader) loader.style.display = 'none'; }, 3000);
    } else {
        pN.style.display = 'block';
        if (Hls.isSupported()) {
            hls.loadSource(ch.url);
            hls.attachMedia(pN);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                // INTENTO DE PLAY CON PROMESA
                let playPromise = pN.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        if(loader) loader.style.display = 'none';
                    }).catch(() => {
                        console.log("Esperando interacción para sonar...");
                        if(loader) loader.style.display = 'none';
                    });
                }
            });
        } else {
            pN.src = ch.url;
            pN.play();
            if(loader) loader.style.display = 'none';
        }
    }

    document.body.classList.add('ui-show');
    clearTimeout(window._hudTimer);
    window._hudTimer = setTimeout(() => { document.body.classList.remove('ui-show'); }, 4000);
}

// --- CONTROLES (DESBLOQUEO DE AUDIO Y NAVEGACIÓN) ---
function setupControls() {
    document.addEventListener('keydown', (e) => {
        // CUALQUIER TECLA ACTIVA EL VIDEO Y EL SONIDO
        const pN = document.getElementById('player');
        if(pN) {
            if (pN.paused) pN.play(); // Fuerza play si estaba en el logo de pausa
            pN.muted = false;         // Activa el audio
            pN.volume = 1.0;
        }

        const menuItems = ["FAVORITOS", ...Object.keys(categorias)];

        // Long Press para Favoritos
        if (e.key === "Enter" && currentSection === "channels") {
            if (!timer) {
                timer = setTimeout(() => {
                    const ch = currentList[selectedChIndex];
                    if (ch && !ch.isCountry) {
                        FavoritesManager.toggle(ch);
                        showToast(FavoritesManager.isFavorite(ch.name) ? "⭐ GUARDADO" : "🗑️ ELIMINADO");
                        renderCards();
                    }
                    timer = "fired";
                }, LONG_PRESS_MS);
            }
        }

        if (!isMenuOpen) {
            if (e.key === "ArrowDown") zapping(1);
            if (e.key === "ArrowUp") zapping(-1);
            if (e.key === "Enter" || e.key === "ArrowLeft") toggleMenu(true);
            return;
        }

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
                if (timer !== "fired") {
                    if (currentSection === "channels") {
                        const item = currentList[selectedChIndex];
                        if (item.isCountry) enterCountry(item);
                        else { playChannel(item); toggleMenu(false); }
                    } else {
                        currentSection = "channels"; renderCards();
                    }
                }
                break;
            case "Backspace":
                if (isInsideCountry) { isInsideCountry = false; updateChannelList(); }
                else { toggleMenu(false); }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === "Enter") { clearTimeout(timer); timer = null; }
    });
}

// --- RENDERIZADO ---
function renderCategories() {
    const container = document.getElementById('category-list');
    const menuItems = ["FAVORITOS", ...Object.keys(categorias)];
    container.innerHTML = '';
    menuItems.forEach((cat, i) => {
        const div = document.createElement('div');
        div.className = `cat-item ${i === selectedCatIndex ? 'focused' : ''}`;
        div.innerText = cat;
        container.appendChild(div);
    });
}

function updateChannelList() {
    const menuItems = ["FAVORITOS", ...Object.keys(categorias)];
    const catName = menuItems[selectedCatIndex];
    currentList = (catName === "FAVORITOS") ? FavoritesManager.load() : (categorias[catName] || []);
    selectedChIndex = 0;
    renderCards();
}

function renderCards() {
    const container = document.getElementById('channel-list');
    container.innerHTML = '';
    currentList.forEach((item, i) => {
        const div = document.createElement('div');
        const isFocused = i === selectedChIndex && currentSection === "channels";
        div.className = `card ${isFocused ? 'focused' : ''}`;
        
        let logo = item.logo;
        if (item.isCountry) logo = `https://flagcdn.com/w160/${item.code.toLowerCase()}.png`;
        const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=8B0000&color=fff&bold=true`;

        div.innerHTML = `
            <img src="${logo || fallback}" class="ch-logo" onerror="this.src='${fallback}'">
            <div class="title">${item.name}</div>
        `;
        container.appendChild(div);
    });
}

// --- M3U Y NAVEGACIÓN ---
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
    } catch (e) { container.innerHTML = '<p>Error de lista</p>'; }
}

function parseM3U(data) {
    const channels = [];
    const lines = data.split('\n');
    lines.forEach((line, i) => {
        if (line.startsWith('#EXTINF')) {
            const name = line.split(',')[1]?.trim() || "Canal";
            const url = lines[i + 1]?.trim();
            const logoMatch = line.match(/tvg-logo="([^"]+)"/);
            if (url && url.startsWith('http')) {
                channels.push({ name, url, type: 'm3u8', logo: logoMatch ? logoMatch[1] : null });
            }
        }
    });
    return channels;
}

function zapping(dir) {
    if (currentList.length === 0) return;
    selectedChIndex = (selectedChIndex + dir + currentList.length) % currentList.length;
    if(!currentList[selectedChIndex].isCountry) playChannel(currentList[selectedChIndex]);
}

function toggleMenu(show) {
    isMenuOpen = show;
    document.getElementById('guide').classList.toggle('active', show);
    if(show) { renderCategories(); setTimeout(scroll, 100); }
}

function scroll() {
    const el = document.querySelector('.card.focused');
    if(el) el.scrollIntoView({ block: "center", behavior: "smooth" });
}

function showToast(text) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        document.body.appendChild(t);
    }
    t.innerText = text; t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 2000);
}

window.onload = init;
