/**
 * 10TV - VERSIÓN RESTAURADA Y AMPLIADA
 * YouTube + VIP + Global + Nueva Lista Mundo/Deportes
 */

const categorias = {
    "CANALES EN STREAMING": [
        { name: "TN", id: "cb12KmMMDJA", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Todo_Noticias_2016.png" },
        { name: "C5N", id: "SF06Qy1Ct6Y", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/C5N_Logo_2017.svg/1200px-C5N_Logo_2017.svg.png" },
        { name: "A24", id: "ArKbAx1K-2U", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/A24_logo_2021.svg/1200px-A24_logo_2021.svg.png" },
        { name: "LN+", id: "M_gUd2Bp9g0", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/La_Naci%C3%B3n_%2B_logo.svg/1200px-La_Naci%C3%B3n_%2B_logo.svg.png" },
        { name: "TELEFE NOTICIAS", id: "XhAYcYpPzTc", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Telefe_Noticias_logo_2018.svg/1024px-Telefe_Noticias_logo_2018.svg.png" },
        { name: "CRÓNICA TV", id: "sGnaFL_Syl0", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cr%C3%B3nica_TV_logo_2017.svg/1200px-Cr%C3%B3nica_TV_logo_2017.svg.png" },
        { name: "A12 (LUZU)", id: "JrmCaXL5GZs", type: "yt", logo: "https://via.placeholder.com/50?text=LUZU" },
        { name: "OLGA", id: "oITT9sjzUG4", type: "yt", logo: "https://via.placeholder.com/50?text=OLGA" },
        { name: "CANAL 26", id: "c8Uxc6pwDNA", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Canal_26_logo.png" },
        { name: "QUIERO MUSICA", id: "vGNglKWqwcQ", type: "yt", logo: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Quiero_m%C3%BAsica_en_mi_idioma.png" },
        // --- AGREGADOS STREAMING ---
        // Para YouTube: tomamos el código después de 'v=' o el final de la URL corta.
        { name: "RADIO RIVADAVIA", id: "r0Zla29fWNg", type: "yt", logo: "https://via.placeholder.com/50?text=RIVADAVIA" },
        { name: "LA POP", id: "7IGgrPGetoI", type: "yt", logo: "https://via.placeholder.com/50?text=LA+POP" }
    ],
    "24/7": [
        // --- NUEVA CATEGORÍA 24/7 ---
        { name: "EL CHAVO", id: "fy_fYd3ZwPE", type: "yt", logo: "https://via.placeholder.com/50?text=CHAVO" },
        { name: "MASHA Y EL OSO", id: "8ZTe5n_SFfg", type: "yt", logo: "https://via.placeholder.com/50?text=MASHA" },
        { name: "CASO CERRADO", id: "CG7UYN5OrQA", type: "yt", logo: "https://via.placeholder.com/50?text=CASO+C" }
    ],
    "MUNDO Y DEPORTES": [
        { name: "TYC SPORTS PLAY", url: "https://d320m3arb2wo8b.cloudfront.net/out/v1/34e0da501a8c4489b713809eb08a9bf3/index.m3u8", type: "m3u8" },
        // --- AGREGADO DEPORTES YT ---
        { name: "DEPORTES 24/7", id: "2emmODLYuic", type: "yt", logo: "https://via.placeholder.com/50?text=DEPOR" },
        { name: "IMAGEN TV", url: "http://181.78.105.146:2000/play/a00h/index.m3u8", type: "m3u8" },
        { name: "MVS MÉXICO", url: "https://dish.akamaized.net/Content/HLS_HLS_CLR/Live/channel(mvs)/variant.m3u8", type: "m3u8" },
        { name: "SKY SPORTS", url: "https://sdmx.vip:443/belpley/sYqKZQrTZa/2092605", type: "m3u8" },
        { name: "NBA TV", url: "http://offshore.lat:8080/play/xknfF6QKbQnlCvS51ULeiko8hkRCt0L8Rp3JgOdWbEXn4MLNstO02YGaIQk7Vj7_", type: "m3u8" },
        { name: "NFL NETWORK", url: "http://offshore.lat:8080/play/xknfF6QKbQnlCvS51ULeiko8hkRCt0L8Rp3JgOdWbEVYJW-Q5gl89q2J5sBjKlEZ", type: "m3u8" },
        { name: "PANAMERICANA", url: "https://cdnhd.iblups.com/hls/ptv5.m3u8", type: "m3u8" },
        { name: "TELEMUNDO PR", url: "https://nbculocallive.akamaized.net/hls/live/2037499/puertorico/stream1/master.m3u8", type: "m3u8" },
        { name: "SV - CANAL 21", url: "https://mgv-channel21.akamaized.net/hls/live/2093191/MGV_CHANNEL21/0/streamPlaylist.m3u8", type: "m3u8" },
        { name: "NASA TV", url: "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master_2000.m3u8", type: "m3u8" },
        { name: "VENEVISION INT", url: "https://vod2live.univtec.com/manifest/4c41c0d8-e2e4-43cc-bd43-79afe715e1b3/1660000.m3u8", type: "m3u8" },
        { name: "WIN SPORT+ COL", url: "http://tvlatino.live:8080/Martv1971/G5cSzPMeRUuH/76703.m3u8", type: "m3u8" },
        { name: "WWE NETWORK", url: "http://tvlatino.club:2082/devil40/VkCBMYP78uZn/243910", type: "m3u8" },
        { name: "CARACOL TV", url: "https://mdstrm.com/live-stream-playlist/574463697b9817cf0886fc17.m3u8", type: "m3u8" }
    ],
    "MAS (IPTV VIP)": [
        { name: "TELEFE HD", url: "http://ar.watcha.live/ch6/hi.m3u8", type: "m3u8" },
        { name: "AMERICA TV", url: "http://ar.watcha.live/ch3/hi.m3u8", type: "m3u8" },
        { name: "EL TRECE", url: "http://ar.watcha.live/ch7/hi.m3u8", type: "m3u8" }
    ],
    "GLOBAL TV": [
        { name: "Argentina", code: "ar" }, 
        { name: "España", code: "es" }, 
        { name: "México", code: "mx" }, 
        { name: "Chile", code: "cl" },
        { name: "Paraguay", code: "py" } // <-- AGREGADO PARAGUAY
    ]
};

// ... Resto del código (init, loadChannels, playChannel, etc.) se mantiene igual ...

let currentSection = "categories"; 
let selectedCatIndex = 0;
let selectedChIndex = 0;
let isMenuOpen = false;
let hls = new Hls();

function init() {
    const catContainer = document.getElementById('category-list');
    Object.keys(categorias).forEach((cat, index) => {
        const div = document.createElement('div');
        div.className = `cat-item ${index === 0 ? 'focused' : ''}`;
        div.innerText = cat;
        div.onclick = () => {
            selectedCatIndex = index;
            currentSection = "channels";
            loadChannels(cat);
            updateFocus();
        };
        catContainer.appendChild(div);
    });

    loadChannels(Object.keys(categorias)[0]);

    setTimeout(() => {
        const splash = document.getElementById('splash');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 1000);
        }
        playChannel(categorias["CANALES EN STREAMING"][0]);
    }, 3000);

    setupSmartControls();
}

async function loadChannels(catName) {
    const container = document.getElementById('channel-list');
    container.innerHTML = '';
    const items = categorias[catName];

    items.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'card';
        
        if (catName === "GLOBAL TV") {
            div.innerHTML = `
                <img src="https://flagcdn.com/w80/${item.code}.png" class="flag-icon">
                <div class="card-content"><div class="title">${item.name}</div></div>
            `;
            div.onclick = () => fetchGlobalM3U(item.code);
        } else {
            const logo = item.logo || 'https://via.placeholder.com/50?text=TV';
            div.innerHTML = `
                <img src="${logo}" class="ch-logo" onerror="this.src='https://via.placeholder.com/50?text=TV'">
                <div class="card-content"><div class="title">${item.name}</div></div>
            `;
            div.onclick = () => playChannel(item);
        }
        container.appendChild(div);
    });

    document.querySelectorAll('.cat-item').forEach(el => {
        el.classList.toggle('selected', el.innerText === catName);
    });
}

async function fetchGlobalM3U(code) {
    const container = document.getElementById('channel-list');
    container.innerHTML = '<div style="padding:20px; color:cyan;">Sincronizando...</div>';
    try {
        const res = await fetch(`https://iptv-org.github.io/iptv/countries/${code}.m3u`);
        const data = await res.text();
        container.innerHTML = '<div class="card" onclick="loadChannels(\'GLOBAL TV\')"><div class="title">⬅ VOLVER</div></div>';
        const lines = data.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('#EXTINF')) {
                const name = line.split(',')[1].trim();
                const url = lines[i+1]?.trim();
                if (url && url.startsWith('http')) {
                    const div = document.createElement('div');
                    div.className = 'card';
                    div.innerHTML = `<img src="https://flagcdn.com/w80/${code}.png" class="ch-logo"><div class="title">${name}</div>`;
                    div.onclick = () => playChannel({name, url, type: 'm3u8'});
                    container.appendChild(div);
                }
            }
        });
        selectedChIndex = 0; updateFocus();
    } catch (e) { container.innerHTML = 'Error de conexión'; }
}

function playChannel(ch) {
    const pN = document.getElementById('player');
    const pY = document.getElementById('yt-player');
    const title = document.getElementById('ch-title');
    if(title) title.innerText = ch.name;

    pN.style.display = 'none'; pY.style.display = 'none';
    pN.pause(); pY.src = "";

    if (ch.type === "yt") {
        pY.style.display = 'block';
        pY.src = `https://www.youtube.com/embed/${ch.id}?autoplay=1&controls=0&modestbranding=1`;
    } else {
        pN.style.display = 'block';
        if (Hls.isSupported()) {
            hls.destroy(); hls = new Hls();
            hls.loadSource(ch.url); hls.attachMedia(pN);
            hls.on(Hls.Events.MANIFEST_PARSED, () => pN.play().catch(()=>{}));
        } else {
            pN.src = ch.url; pN.play().catch(()=>{});
        }
    }
    
    if(!isMenuOpen) {
        document.body.classList.add('ui-show');
        clearTimeout(window.hTimer);
        window.hTimer = setTimeout(() => document.body.classList.remove('ui-show'), 4000);
    }
}

function setupSmartControls() {
    document.addEventListener('keydown', (e) => {
        const cats = document.querySelectorAll('.cat-item');
        const cards = document.querySelectorAll('.card');

        switch(e.key) {
            case "ArrowRight":
                if (!isMenuOpen) toggleMenu(true);
                else if (currentSection === "categories") { currentSection = "channels"; updateFocus(); }
                break;
            case "ArrowLeft":
                if (currentSection === "channels") { currentSection = "categories"; updateFocus(); }
                else toggleMenu(false);
                break;
            case "ArrowDown":
                if (!isMenuOpen) zapping(1);
                else if (currentSection === "categories") {
                    selectedCatIndex = (selectedCatIndex + 1) % cats.length;
                    loadChannels(Object.keys(categorias)[selectedCatIndex]);
                } else {
                    selectedChIndex = (selectedChIndex + 1) % cards.length;
                }
                updateFocus();
                break;
            case "ArrowUp":
                if (!isMenuOpen) zapping(-1);
                else if (currentSection === "categories") {
                    selectedCatIndex = (selectedCatIndex - 1 + cats.length) % cats.length;
                    loadChannels(Object.keys(categorias)[selectedCatIndex]);
                } else {
                    selectedChIndex = (selectedChIndex - 1 + cards.length) % cards.length;
                }
                updateFocus();
                break;
            case "Enter":
                if (isMenuOpen && cards[selectedChIndex]) cards[selectedChIndex].click();
                break;
            case "Backspace":
                if (isMenuOpen) toggleMenu(false);
                break;
        }
    });
}

function toggleMenu(show) {
    isMenuOpen = show;
    document.getElementById('guide').classList.toggle('active', show);
    document.body.classList.toggle('ui-show', show);
}

function updateFocus() {
    document.querySelectorAll('.cat-item, .card').forEach(el => el.classList.remove('focused'));
    if (currentSection === "categories") {
        const cats = document.querySelectorAll('.cat-item');
        if(cats[selectedCatIndex]) cats[selectedCatIndex].classList.add('focused');
    } else {
        const cards = document.querySelectorAll('.card');
        if (cards[selectedChIndex]) {
            cards[selectedChIndex].classList.add('focused');
            cards[selectedChIndex].scrollIntoView({ block: "center", behavior: "smooth" });
        }
    }
}

function zapping(dir) {
    const cards = document.querySelectorAll('.card');
    const currentName = document.getElementById('ch-title').innerText;
    let idx = -1;
    cards.forEach((c, i) => { if(c.innerText.includes(currentName)) idx = i; });
    let next = (idx + dir + cards.length) % cards.length;
    if(cards[next]) cards[next].click();
}

init();