let hls = new Hls();
let currentSection = "categories";
let selectedCatIndex = 0;
let selectedChIndex = 0;
let savedCountryIndex = 0; 
let isMenuOpen = false;
let currentList = [];
let isInsideCountry = false;
let abortController = null;

// Variables para el manejo de pulsación larga (TV UX)
let timer;
const LONG_PRESS_MS = 800; 

// --- GESTIÓN DE FAVORITOS (LOCAL STORAGE) ---
const FavoritesManager = {
    load() {
        return JSON.parse(localStorage.getItem('mis_favoritos')) || [];
    },
    save(lista) {
        localStorage.setItem('mis_favoritos', JSON.stringify(lista));
    },
    toggle(channel) {
        let favs = this.load();
        const index = favs.findIndex(f => f.name === channel.name);
        if (index > -1) {
            favs.splice(index, 1);
        } else {
            favs.push({
                name: channel.name,
                url: channel.url || null,
                id: channel.id || null,
                type: channel.type,
                logo: channel.logo
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
        if(sp) {
            sp.style.opacity = '0';
            setTimeout(() => { 
                sp.style.display = 'none'; 
                const firstCat = "CANALES EN STREAMING"; // Priorizamos streaming al inicio
                if(categorias[firstCat] && categorias[firstCat][0]) playChannel(categorias[firstCat][0]); 
            }, 500);
        }
    }, 2000);
    setupControls();
}

function renderCategories() {
    const container = document.getElementById('category-list');
    if(!container) return;
    container.innerHTML = '';
    const menuItems = ["FAVORITOS", ...Object.keys(categorias)];
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
    if (catName === "FAVORITOS") {
        currentList = FavoritesManager.load();
    } else {
        currentList = categorias[catName] || [];
    }
    isInsideCountry = false;
    selectedChIndex = 0;
    renderCards();
}

async function enterCountry(countryObj) {
    if (abortController) abortController.abort();
    abortController = new AbortController();
    savedCountryIndex = selectedChIndex; 
    const container = document.getElementById('channel-list');
    container.innerHTML = '<div class="loader-vip"></div><p style="text-align:center; color:white; padding:20px;">CARGANDO...</p>';
    try {
        const res = await fetch(countryObj.url, { signal: abortController.signal });
        const text = await res.text();
        currentList = parseM3U(text);
        isInsideCountry = true;
        selectedChIndex = 0;
        renderCards();
        scroll();
    } catch (e) { 
        if (e.name !== 'AbortError') {
            container.innerHTML = '<p style="color:white; padding:20px;">Error de conexión.</p>';
        }
    }
}

function getFallbackLogo(name) {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return `https://ui-avatars.com/api/?name=${initial}&background=330000&color=fff&size=128&bold=true`;
}

function renderCards() {
    const container = document.getElementById('channel-list');
    if(!container) return;
    container.innerHTML = '';
    if (currentList.length === 0) {
        container.innerHTML = '<p style="color:gray; padding:20px; text-align:center;">No hay canales guardados</p>';
        return;
    }
    currentList.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = `card ${i === selectedChIndex && currentSection === "channels" ? 'focused' : ''}`;
        let logo = item.logo;
        if (item.isCountry) logo = `https://flagcdn.com/w160/${item.code}.png`;
        const fallback = getFallbackLogo(item.name);
        div.innerHTML = `<img src="${logo || fallback}" class="ch-logo" onerror="this.src='${fallback}'"> <div class="title">${item.name}</div>`;
        container.appendChild(div);
    });
}

function parseM3U(data) {
    const channels = [];
    const lines = data.split('\n');
    lines.forEach((line, i) => {
        if (line.startsWith('#EXTINF')) {
            const name = line.split(',')[1]?.trim() || "Canal";
            const url = lines[i+1]?.trim();
            const logoMatch = line.match(/tvg-logo="(.+?)"/);
            if (url && url.startsWith('http')) {
                channels.push({ name, url, type: 'm3u8', logo: logoMatch ? logoMatch[1] : null });
            }
        }
    });
    return channels;
}

function setupControls() {
    document.addEventListener('keydown', (e) => {
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
        }

        if (!isMenuOpen) {
            if (e.key === "ArrowDown") zapping(1);
            if (e.key === "ArrowUp") zapping(-1);
            if (e.key === "ArrowRight" || e.key === "Enter") toggleMenu(true);
            return;
        }

        switch(e.key) {
            case "ArrowDown":
                if (currentSection === "categories") {
                    selectedCatIndex = (selectedCatIndex + 1) % menuItems.length;
                    updateChannelList(); renderCategories();
                } else if (currentList.length > 0) {
                    selectedChIndex = (selectedChIndex + 1) % currentList.length;
                    renderCards(); scroll();
                }
                break;
            case "ArrowUp":
                if (currentSection === "categories") {
                    selectedCatIndex = (selectedCatIndex - 1 + menuItems.length) % menuItems.length;
                    updateChannelList(); renderCategories();
                } else if (currentList.length > 0) {
                    selectedChIndex = (selectedChIndex - 1 + currentList.length) % currentList.length;
                    renderCards(); scroll();
                }
                break;
            case "ArrowRight":
                if (currentSection === "categories") {
                    currentSection = "channels"; renderCards(); scroll();
                } else if (currentSection === "channels" && !isInsideCountry) {
                    const item = currentList[selectedChIndex];
                    if (item && item.isCountry) enterCountry(item);
                }
                break;
            case "ArrowLeft":
                if (currentSection === "channels") {
                    if (isInsideCountry) {
                        updateChannelList(); selectedChIndex = savedCountryIndex; renderCards(); scroll();
                    } else { currentSection = "categories"; renderCards(); }
                } else { toggleMenu(false); }
                break;
            case "Backspace":
                if (isInsideCountry) { updateChannelList(); selectedChIndex = savedCountryIndex; renderCards(); scroll(); }
                else { toggleMenu(false); }
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.key === "Enter") {
            if (timer && timer !== "fired") {
                clearTimeout(timer);
                // Click normal
                if (currentSection === "channels" && currentList[selectedChIndex]) {
                    const item = currentList[selectedChIndex];
                    if (item.isCountry && !isInsideCountry) { enterCountry(item); }
                    else { playChannel(item); toggleMenu(false); }
                } else if (currentSection === "categories") {
                    currentSection = "channels"; renderCards();
                }
            }
            timer = null;
        }
    });
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

    if (ch.type === "yt") {
        pY.style.display = 'block';
        pY.src = `https://www.youtube.com/embed/${ch.id}?autoplay=1&controls=0&rel=0`;
        setTimeout(() => { if(loader) loader.style.display = 'none'; }, 2000);
    } else if (ch.url) {
        pN.style.display = 'block';
        if (Hls.isSupported()) {
            hls.loadSource(ch.url); hls.attachMedia(pN);
            hls.on(Hls.Events.MANIFEST_PARSED, () => { pN.play().catch(()=>{}); if(loader) loader.style.display = 'none'; });
            hls.on(Hls.Events.ERROR, () => { if(loader) loader.style.display = 'none'; });
        } else if (pN.canPlayType('application/vnd.apple.mpegurl')) {
            pN.src = ch.url;
            pN.addEventListener('loadedmetadata', () => { pN.play(); if(loader) loader.style.display = 'none'; });
        }
    }
}

function zapping(dir) {
    if (!currentList || currentList.length === 0) return;
    selectedChIndex = (selectedChIndex + dir + currentList.length) % currentList.length;
    playChannel(currentList[selectedChIndex]);
}

function scroll() {
    const el = document.querySelector('.card.focused');
    if(el) el.scrollIntoView({ block: "center", behavior: "smooth" });
}

function toggleMenu(show) {
    isMenuOpen = show;
    const guide = document.getElementById('guide');
    if(guide) guide.classList.toggle('active', show);
    if(show) { renderCategories(); setTimeout(scroll, 100); }
}

function showToast(text) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.style = "position:fixed; bottom:30px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.9); color:gold; padding:12px 25px; border-radius:10px; z-index:99999; font-weight:bold; border:1px solid gold; font-family:sans-serif; pointer-events:none;";
        document.body.appendChild(t);
    }
    t.innerText = text; t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 2500);
}

window.onload = init;