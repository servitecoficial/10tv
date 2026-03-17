(function () {
    const FAVORITES_KEY = "mis_favoritos_index2";
    const ACTIONS = [
        { id: "play", label: "Ver ahora" },
        { id: "favorite", label: "Favorito" }
    ];

    const state = {
        hls: null,
        menuOpen: false,
        adOpen: false,
        adFocusIndex: 0,
        focusArea: "categories",
        selectedCategoryIndex: 0,
        selectedChannelIndex: 0,
        selectedActionIndex: 0,
        actionMenuOpen: false,
        currentCategoryItems: [],
        breadcrumb: [],
        playingChannelId: null,
        playingChannelName: "",
        playingChannelLogo: "",
        currentPlayableList: [],
        currentPlayableIndex: -1,
        adConfig: null,
        adIndex: 0,
        pushIndex: 0,
        livePushItems: [],
        startupAdScheduled: false,
        pushTimer: null,
        pushIntervalTimer: null,
        pushPollTimer: null,
        hudTimer: null,
        toastTimer: null
    };

    const els = {};

    const Favorites = {
        load() {
            try {
                const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY));
                return Array.isArray(parsed) ? parsed : [];
            } catch (_error) {
                return [];
            }
        },
        save(items) {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
        },
        isFavorite(channelId) {
            return this.load().some((item) => item.id === channelId);
        },
        toggle(channel) {
            const favorites = this.load();
            const index = favorites.findIndex((item) => item.id === channel.id);

            if (index >= 0) {
                favorites.splice(index, 1);
            } else {
                favorites.push({
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    url: channel.url || "",
                    ytId: channel.ytId || "",
                    logo: channel.logo || "",
                    description: channel.description || ""
                });
            }

            this.save(favorites);
            return index < 0;
        }
    };

    function init() {
        cacheElements();
        state.hls = window.Hls && Hls.isSupported() ? new Hls() : null;
        state.breadcrumb = [APP_CATALOG[0]?.title || "Inicio"];
        state.currentCategoryItems = getItemsForCategory(APP_CATALOG[0]);

        renderCategories();
        renderChannelList();
        updateBreadcrumb();
        updateNowPlayingCard();
        bindEvents();
        loadAdsConfig();

        window.addEventListener("load", () => {
            window.setTimeout(hideSplash, 1800);
            const firstPlayable = findFirstPlayable(APP_CATALOG);
            if (firstPlayable) {
                playChannel(firstPlayable, { silentLoader: true });
            }
            scheduleStartupAd();
        });
    }

    function cacheElements() {
        els.body = document.body;
        els.splash = document.getElementById("splash");
        els.player = document.getElementById("player");
        els.ytPlayer = document.getElementById("yt-player");
        els.loading = document.getElementById("loading-overlay");
        els.hud = document.getElementById("hud");
        els.hudLogo = document.getElementById("hud-logo");
        els.hudTitle = document.getElementById("hud-title");
        els.hudMeta = document.getElementById("hud-meta");
        els.guide = document.getElementById("guide");
        els.categoryList = document.getElementById("category-list");
        els.channelList = document.getElementById("channel-list");
        els.breadcrumb = document.getElementById("breadcrumb");
        els.nowPlayingCard = document.getElementById("now-playing-card");
        els.nowPlayingLogo = document.getElementById("now-playing-logo");
        els.nowPlayingTitle = document.getElementById("now-playing-title");
        els.nowPlayingSubtitle = document.getElementById("now-playing-subtitle");
        els.adOverlay = document.getElementById("ad-overlay");
        els.adMedia = document.getElementById("ad-media");
        els.adTitle = document.getElementById("ad-title");
        els.adDescription = document.getElementById("ad-description");
        els.adCta = document.getElementById("ad-cta");
        els.adDismiss = document.getElementById("ad-dismiss");
        els.pushAd = document.getElementById("push-ad");
        els.pushAdLogo = document.getElementById("push-ad-logo");
        els.pushAdTitle = document.getElementById("push-ad-title");
        els.pushAdDescription = document.getElementById("push-ad-description");
        els.toast = document.getElementById("toast");
    }

    function bindEvents() {
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("click", unlockAudio, { once: true });
        els.adDismiss.addEventListener("click", closeAd);
    }

    function handleKeydown(event) {
        const key = event.key;
        const allowed = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Backspace", "Escape"];

        if (!allowed.includes(key)) {
            return;
        }

        event.preventDefault();
        unlockAudio();

        if (state.adOpen) {
            handleAdMode(key);
            return;
        }

        if (!state.menuOpen) {
            handlePlayerMode(key);
            return;
        }

        handleGuideMode(key);
    }

    function handlePlayerMode(key) {
        if (key === "ArrowRight") {
            openMenu();
            return;
        }

        if (key === "ArrowUp") {
            zap(-1);
            return;
        }

        if (key === "ArrowDown") {
            zap(1);
            return;
        }

        if (key === "Enter") {
            showHud("Usa Derecha para abrir el menu.");
        }
    }

    function handleAdMode(key) {
        const actions = getAdActions();

        if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") {
            if (actions.length > 1) {
                const delta = (key === "ArrowRight" || key === "ArrowDown") ? 1 : -1;
                state.adFocusIndex = (state.adFocusIndex + delta + actions.length) % actions.length;
                renderAdFocus();
            }
            return;
        }

        if (key === "Enter") {
            runAdAction(actions[state.adFocusIndex]);
            return;
        }

        if (key === "Backspace" || key === "Escape") {
            closeAd();
        }
    }

    function handleGuideMode(key) {
        if (key === "Escape") {
            key = "Backspace";
        }

        if (key === "ArrowLeft") {
            handleLeftNavigation();
            return;
        }

        if (state.actionMenuOpen) {
            handleActionMode(key);
            return;
        }

        if (state.focusArea === "categories") {
            handleCategoriesMode(key);
            return;
        }

        handleChannelsMode(key);
    }

    function handleLeftNavigation() {
        if (state.actionMenuOpen) {
            state.actionMenuOpen = false;
            state.selectedActionIndex = 0;
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (state.focusArea === "channels") {
            state.focusArea = "categories";
            renderCategories();
            renderChannelList();
            return;
        }

        closeMenu();
    }

    function handleActionMode(key) {
        if (key === "ArrowRight") {
            state.selectedActionIndex = (state.selectedActionIndex + 1) % ACTIONS.length;
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (key === "ArrowUp" || key === "ArrowDown") {
            moveChannelSelection(key === "ArrowDown" ? 1 : -1);
            state.selectedActionIndex = 0;
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (key === "Enter") {
            runAction(ACTIONS[state.selectedActionIndex]?.id);
            return;
        }

        if (key === "Backspace") {
            state.actionMenuOpen = false;
            state.selectedActionIndex = 0;
            renderChannelList();
            ensureFocusedVisible();
        }
    }

    function handleCategoriesMode(key) {
        if (key === "ArrowDown") {
            state.selectedCategoryIndex = (state.selectedCategoryIndex + 1) % APP_CATALOG.length;
            syncCategorySelection();
            return;
        }

        if (key === "ArrowUp") {
            state.selectedCategoryIndex = (state.selectedCategoryIndex - 1 + APP_CATALOG.length) % APP_CATALOG.length;
            syncCategorySelection();
            return;
        }

        if (key === "ArrowRight" || key === "Enter") {
            state.focusArea = "channels";
            renderCategories();
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (key === "Backspace") {
            closeMenu();
        }
    }

    function handleChannelsMode(key) {
        if (key === "ArrowDown") {
            moveChannelSelection(1);
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (key === "ArrowUp") {
            moveChannelSelection(-1);
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (key === "ArrowRight" || key === "Enter") {
            const item = getFocusedChannel();
            if (!item) {
                return;
            }

            if (item.type === "playlist") {
                openPlaylist(item);
                return;
            }

            state.actionMenuOpen = true;
            state.selectedActionIndex = 0;
            renderChannelList();
            ensureFocusedVisible();
            return;
        }

        if (key === "Backspace") {
            if (state.breadcrumb.length > 1) {
                goBackBreadcrumb();
                return;
            }

            state.focusArea = "categories";
            renderCategories();
            renderChannelList();
        }
    }

    function runAction(actionId) {
        const channel = getFocusedChannel();
        if (!channel) {
            return;
        }

        if (actionId === "play") {
            playChannel(channel);
            closeMenu();
            return;
        }

        if (actionId === "favorite") {
            const added = Favorites.toggle(channel);
            showToast(added ? "Canal agregado a favoritos" : "Canal quitado de favoritos");
            if (APP_CATALOG[state.selectedCategoryIndex].dynamic === "favorites") {
                state.currentCategoryItems = getItemsForCategory(APP_CATALOG[state.selectedCategoryIndex]);
                clampChannelIndex();
            }
            renderCategories();
            renderChannelList();
            updateNowPlayingCard();
        }
    }

    function openMenu() {
        state.menuOpen = true;
        state.focusArea = "categories";
        state.actionMenuOpen = false;
        els.body.classList.add("menu-open");
        els.guide.classList.add("active");
        els.guide.setAttribute("aria-hidden", "false");
        syncCategorySelection();
    }

    function closeMenu() {
        state.menuOpen = false;
        state.focusArea = "categories";
        state.actionMenuOpen = false;
        els.body.classList.remove("menu-open");
        els.guide.classList.remove("active");
        els.guide.setAttribute("aria-hidden", "true");
        showHud("Menu cerrado. Sigues en reproduccion.");
    }

    function syncCategorySelection() {
        const category = APP_CATALOG[state.selectedCategoryIndex];
        state.breadcrumb = [category.title];
        state.currentCategoryItems = getItemsForCategory(category);
        state.selectedChannelIndex = 0;
        state.selectedActionIndex = 0;
        state.actionMenuOpen = false;
        renderCategories();
        renderChannelList();
        updateBreadcrumb();
    }

    function renderCategories() {
        els.categoryList.innerHTML = "";

        APP_CATALOG.forEach((category, index) => {
            const item = document.createElement("div");
            item.className = `category-item ${index === state.selectedCategoryIndex ? "focused" : ""}`;
            const count = getItemsForCategory(category).length;
            item.innerHTML = `
                <span class="category-item__title">${escapeHtml(category.title)}</span>
                <span class="category-item__meta">${count} opciones disponibles</span>
            `;
            els.categoryList.appendChild(item);
        });
    }

    function renderChannelList() {
        updateBreadcrumb();
        updateNowPlayingCard();
        els.channelList.innerHTML = "";

        if (!state.currentCategoryItems.length) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.textContent = "No hay elementos disponibles en esta lista todavia.";
            els.channelList.appendChild(empty);
            return;
        }

        state.currentCategoryItems.forEach((item, index) => {
            const card = document.createElement("article");
            const focused = state.focusArea === "channels" && index === state.selectedChannelIndex;
            const isPlaying = item.id === state.playingChannelId;
            card.className = `channel-card ${focused ? "focused" : ""} ${isPlaying ? "playing" : ""}`;

            const isFavorite = Favorites.isFavorite(item.id);
            const badge = item.type === "playlist" ? "Lista" : isFavorite ? "Favorito" : "";
            const status = item.type === "playlist" ? "Abrir lista" : isPlaying ? "En reproduccion" : "Listo para ver";

            card.innerHTML = `
                <img class="channel-card__logo" src="${escapeAttribute(item.logo || fallbackLogo(item.name))}" alt="${escapeAttribute(item.name)}" onerror="this.src='${escapeAttribute(fallbackLogo(item.name))}'">
                <div class="channel-card__main">
                    <div class="channel-card__title-row">
                        <h4 class="channel-card__title">${escapeHtml(item.name)}</h4>
                        ${badge ? `<span class="channel-card__badge">${escapeHtml(badge)}</span>` : ""}
                    </div>
                    <p class="channel-card__meta">${escapeHtml(item.description || descriptionByType(item.type))}</p>
                </div>
                <div class="channel-card__status">${escapeHtml(status)}</div>
            `;

            if (focused && state.actionMenuOpen && item.type !== "playlist") {
                const actions = document.createElement("div");
                actions.className = "channel-card__actions";
                ACTIONS.forEach((action, actionIndex) => {
                    const chip = document.createElement("div");
                    chip.className = `action-chip ${actionIndex === state.selectedActionIndex ? "focused" : ""}`;
                    const chipLabel = action.id === "favorite"
                        ? (isFavorite ? "Quitar favorito" : "Agregar favorito")
                        : action.label;
                    chip.innerHTML = `<span class="action-chip__label">${escapeHtml(chipLabel)}</span>`;
                    actions.appendChild(chip);
                });
                card.appendChild(actions);
            }

            els.channelList.appendChild(card);
        });
    }

    function updateBreadcrumb() {
        els.breadcrumb.textContent = state.breadcrumb.join(" / ");
    }

    function updateNowPlayingCard() {
        const title = state.playingChannelName || "Sin canal activo";
        const logo = state.playingChannelLogo || fallbackLogo(title);
        els.nowPlayingLogo.src = logo;
        els.nowPlayingTitle.textContent = title;
        els.nowPlayingSubtitle.textContent = state.playingChannelName
            ? "La imagen del canal sigue visible mientras navegas por las listas."
            : "Abre una categoria y selecciona Ver ahora.";
    }

    function moveChannelSelection(delta) {
        if (!state.currentCategoryItems.length) {
            return;
        }
        state.selectedChannelIndex = (state.selectedChannelIndex + delta + state.currentCategoryItems.length) % state.currentCategoryItems.length;
    }

    function clampChannelIndex() {
        if (!state.currentCategoryItems.length) {
            state.selectedChannelIndex = 0;
            state.actionMenuOpen = false;
            return;
        }
        if (state.selectedChannelIndex >= state.currentCategoryItems.length) {
            state.selectedChannelIndex = state.currentCategoryItems.length - 1;
        }
    }

    function getFocusedChannel() {
        return state.currentCategoryItems[state.selectedChannelIndex] || null;
    }

    async function openPlaylist(item) {
        showLoader(true);
        try {
            const response = await fetch(item.url);
            if (!response.ok) {
                throw new Error("No se pudo abrir la lista");
            }

            const text = await response.text();
            const parsed = parseM3U(text, item.id);
            state.currentCategoryItems = parsed;
            state.selectedChannelIndex = 0;
            state.actionMenuOpen = false;
            state.focusArea = "channels";
            state.breadcrumb = [APP_CATALOG[state.selectedCategoryIndex].title, item.name];
            renderChannelList();
            ensureFocusedVisible();
            showToast(parsed.length ? `Lista cargada: ${item.name}` : `La lista ${item.name} no tiene canales validos`);
        } catch (_error) {
            showToast("No se pudo cargar la lista");
        } finally {
            showLoader(false);
        }
    }

    function goBackBreadcrumb() {
        const category = APP_CATALOG[state.selectedCategoryIndex];
        state.currentCategoryItems = getItemsForCategory(category);
        state.selectedChannelIndex = 0;
        state.selectedActionIndex = 0;
        state.actionMenuOpen = false;
        state.breadcrumb = [category.title];
        renderChannelList();
        updateBreadcrumb();
    }

    function parseM3U(text, sourceId) {
        const channels = [];
        const lines = text.split(/\r?\n/);

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index].trim();
            if (!line.startsWith("#EXTINF")) {
                continue;
            }

            const nextLine = (lines[index + 1] || "").trim();
            if (!/^https?:/i.test(nextLine)) {
                continue;
            }

            const name = line.split(",").pop()?.trim() || `Canal ${channels.length + 1}`;
            const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
            const id = `${sourceId}-${slugify(name)}-${channels.length}`;

            channels.push({
                id,
                name,
                type: "hls",
                url: nextLine,
                logo: logoMatch ? logoMatch[1] : "",
                description: "Canal cargado desde lista externa"
            });
        }

        return channels;
    }

    function playChannel(channel, options = {}) {
        if (!channel || (channel.type !== "hls" && channel.type !== "yt")) {
            return;
        }

        const silentLoader = Boolean(options.silentLoader);
        if (!silentLoader) {
            showLoader(true);
        }

        destroyPlayerSource();

        state.playingChannelId = channel.id;
        state.playingChannelName = channel.name;
        state.playingChannelLogo = channel.logo || fallbackLogo(channel.name);
        updateHud(channel);
        updateNowPlayingCard();
        updatePlayableQueue();
        renderChannelList();

        if (channel.type === "yt") {
            playYouTube(channel, silentLoader);
            return;
        }

        playHls(channel, silentLoader);
    }

    function destroyPlayerSource() {
        try {
            if (state.hls) {
                state.hls.destroy();
                state.hls = new Hls();
            }
        } catch (_error) {
            state.hls = window.Hls && Hls.isSupported() ? new Hls() : null;
        }

        els.player.pause();
        els.player.removeAttribute("src");
        els.player.load();
        els.player.style.display = "none";
        els.ytPlayer.src = "";
        els.ytPlayer.style.display = "none";
    }

    function playYouTube(channel, silentLoader) {
        const origin = window.location.origin && window.location.origin !== "null"
            ? window.location.origin
            : "https://www.youtube.com";
        const embedUrl = `https://www.youtube-nocookie.com/embed/${channel.ytId}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&enablejsapi=1&modestbranding=1&loop=1&playlist=${channel.ytId}&origin=${encodeURIComponent(origin)}&t=${Date.now()}`;

        els.ytPlayer.style.display = "block";
        els.ytPlayer.src = "about:blank";
        window.setTimeout(() => {
            els.ytPlayer.src = embedUrl;
        }, 40);
        window.setTimeout(() => {
            sendYouTubeCommand("playVideo");
            sendYouTubeCommand("unMute");
            unlockAudio();
            if (!silentLoader) {
                showLoader(false);
            }
        }, 1400);
        window.setTimeout(() => {
            sendYouTubeCommand("playVideo");
        }, 2400);
        showHud(channel.description || "Canal en vivo");
    }

    function playHls(channel, silentLoader) {
        els.player.style.display = "block";
        els.player.muted = true;
        els.player.autoplay = true;

        if (state.hls) {
            state.hls.loadSource(channel.url);
            state.hls.attachMedia(els.player);
            state.hls.once(Hls.Events.MANIFEST_PARSED, () => {
                const playPromise = els.player.play();
                if (playPromise && typeof playPromise.then === "function") {
                    playPromise
                        .then(() => {
                            unlockAudio();
                            if (!silentLoader) {
                                showLoader(false);
                            }
                        })
                        .catch(() => {
                            if (!silentLoader) {
                                showLoader(false);
                            }
                            showToast("La reproduccion requiere interaccion");
                        });
                }
            });
            state.hls.on(Hls.Events.ERROR, (_event, data) => {
                if (!silentLoader) {
                    showLoader(false);
                }
                if (data?.fatal) {
                    showToast("No se pudo abrir esta senal");
                }
            });
            showHud(channel.description || "Canal en vivo");
            return;
        }

        if (els.player.canPlayType("application/vnd.apple.mpegurl")) {
            els.player.src = channel.url;
            els.player.addEventListener("loadedmetadata", onNativeLoaded, { once: true });
            return;
        }

        showLoader(false);
        showToast("Este dispositivo no soporta HLS");

        function onNativeLoaded() {
            const playPromise = els.player.play();
            if (playPromise && typeof playPromise.then === "function") {
                playPromise.finally(() => {
                    unlockAudio();
                    if (!silentLoader) {
                        showLoader(false);
                    }
                });
            }
        }
    }

    function updateHud(channel) {
        els.hudLogo.src = channel.logo || fallbackLogo(channel.name);
        els.hudTitle.textContent = channel.name;
        els.hudMeta.textContent = channel.description || "Canal en reproduccion";
        showHud(channel.description || "Canal en reproduccion");
    }

    function showHud(message) {
        if (message) {
            els.hudMeta.textContent = message;
        }
        clearTimeout(state.hudTimer);
        els.body.classList.add("show-hud");
        state.hudTimer = window.setTimeout(() => {
            if (!state.menuOpen) {
                els.body.classList.remove("show-hud");
            }
        }, 3200);
    }

    function updatePlayableQueue() {
        const playables = [];
        APP_CATALOG.forEach((category) => {
            getItemsForCategory(category).forEach((item) => {
                if (item.type === "hls" || item.type === "yt") {
                    playables.push(item);
                }
            });
        });

        state.currentPlayableList = playables;
        state.currentPlayableIndex = playables.findIndex((item) => item.id === state.playingChannelId);
    }

    function zap(direction) {
        if (!state.currentPlayableList.length) {
            updatePlayableQueue();
        }
        if (!state.currentPlayableList.length) {
            return;
        }
        const total = state.currentPlayableList.length;
        const currentIndex = state.currentPlayableIndex >= 0 ? state.currentPlayableIndex : 0;
        const nextIndex = (currentIndex + direction + total) % total;
        state.currentPlayableIndex = nextIndex;
        playChannel(state.currentPlayableList[nextIndex], { silentLoader: true });
    }

    async function loadAdsConfig() {
        try {
            const response = await fetch("index2.ads.json", { cache: "no-store" });
            if (!response.ok) {
                return;
            }
            const config = await response.json();
            if (config && config.enabled && Array.isArray(config.items) && config.items.length) {
                state.adConfig = config;
                if (document.readyState === "complete") {
                    scheduleStartupAd();
                }
                schedulePushAds();
                startLivePushPolling();
            }
        } catch (_error) {
            state.adConfig = null;
        }
    }

    function scheduleStartupAd() {
        if (!state.adConfig?.showOnStart || state.startupAdScheduled) {
            return;
        }
        state.startupAdScheduled = true;
        const delay = Number(state.adConfig.startDelayMs || 3500);
        window.setTimeout(() => {
            if (!state.adOpen) {
                openAd();
            }
        }, delay);
    }

    function openAd() {
        if (!state.adConfig?.items?.length) {
            return;
        }

        const ad = state.adConfig.items[state.adIndex % state.adConfig.items.length];
        state.adIndex += 1;
        state.adOpen = true;
        state.adFocusIndex = 0;

        els.adMedia.innerHTML = "";
        els.adTitle.textContent = ad.title || "Publicidad";
        els.adDescription.textContent = ad.description || "";

        if (ad.type === "iframe" && ad.src) {
            const iframe = document.createElement("iframe");
            iframe.src = ad.src;
            iframe.allow = "autoplay; encrypted-media";
            iframe.loading = "lazy";
            els.adMedia.appendChild(iframe);
        } else if (ad.image) {
            const image = document.createElement("img");
            image.src = ad.image;
            image.alt = ad.title || "Publicidad";
            image.onerror = () => {
                image.src = fallbackLogo(ad.title || "AD");
            };
            els.adMedia.appendChild(image);
        }

        if (ad.ctaUrl) {
            els.adCta.hidden = false;
            els.adCta.href = ad.ctaUrl;
            els.adCta.textContent = ad.ctaText || "Abrir enlace";
        } else {
            els.adCta.hidden = true;
            els.adCta.removeAttribute("href");
        }

        els.adDismiss.textContent = Number(state.adConfig.skipAfterSeconds || 0) > 0
            ? `Cerrar en ${state.adConfig.skipAfterSeconds}s`
            : "Cerrar";

        els.adOverlay.classList.add("active");
        els.adOverlay.setAttribute("aria-hidden", "false");

        const skipDelay = Number(state.adConfig.skipAfterSeconds || 0);
        if (skipDelay > 0) {
            els.adDismiss.disabled = true;
            window.setTimeout(() => {
                els.adDismiss.disabled = false;
                els.adDismiss.textContent = "Cerrar";
                renderAdFocus();
            }, skipDelay * 1000);
        } else {
            els.adDismiss.disabled = false;
        }

        renderAdFocus();
    }

    function closeAd() {
        if (!state.adOpen) {
            return;
        }
        if (els.adDismiss.disabled) {
            return;
        }
        state.adOpen = false;
        els.adOverlay.classList.remove("active");
        els.adOverlay.setAttribute("aria-hidden", "true");
        els.adMedia.innerHTML = "";
        els.adCta.classList.remove("is-focused");
        els.adDismiss.classList.remove("is-focused");
    }

    function getAdActions() {
        const actions = [];
        if (!els.adCta.hidden && els.adCta.href) {
            actions.push("cta");
        }
        actions.push("dismiss");
        if (state.adFocusIndex >= actions.length) {
            state.adFocusIndex = actions.length - 1;
        }
        return actions;
    }

    function renderAdFocus() {
        const actions = getAdActions();
        els.adCta.classList.toggle("is-focused", actions[state.adFocusIndex] === "cta");
        els.adDismiss.classList.toggle("is-focused", actions[state.adFocusIndex] === "dismiss");
    }

    function runAdAction(action) {
        if (action === "cta" && !els.adCta.hidden && els.adCta.href) {
            window.open(els.adCta.href, "_blank", "noopener");
            return;
        }
        closeAd();
    }

    function schedulePushAds() {
        if (!state.adConfig?.push?.enabled || !Array.isArray(state.adConfig.push.items) || !state.adConfig.push.items.length) {
            return;
        }
        clearInterval(state.pushIntervalTimer);
        const intervalMs = Number(state.adConfig.push.intervalMs || 45000);
        state.pushIntervalTimer = window.setInterval(() => {
            showPushAd();
        }, intervalMs);
    }

    function startLivePushPolling() {
        if (!state.adConfig?.push?.enabled || !state.adConfig.push.liveFile) {
            return;
        }
        clearInterval(state.pushPollTimer);
        fetchLivePushItems();
        const pollMs = Number(state.adConfig.push.pollLiveMs || 5000);
        state.pushPollTimer = window.setInterval(() => {
            fetchLivePushItems();
        }, pollMs);
    }

    async function fetchLivePushItems() {
        const liveFile = state.adConfig?.push?.liveFile;
        if (!liveFile) {
            state.livePushItems = [];
            return;
        }

        try {
            const response = await fetch(`${liveFile}?t=${Date.now()}`, { cache: "no-store" });
            if (!response.ok) {
                return;
            }
            const payload = await response.json();
            const items = Array.isArray(payload?.items) ? payload.items : [];
            state.livePushItems = items.filter((item) => item && item.active !== false);
        } catch (_error) {
            state.livePushItems = [];
        }
    }

    function showPushAd() {
        if (!state.adConfig?.push?.enabled) {
            return;
        }

        const availableItems = getAvailablePushItems();
        if (!availableItems.length) {
            return;
        }

        const item = availableItems[state.pushIndex % availableItems.length];
        state.pushIndex += 1;

        els.pushAdLogo.src = item.logo || fallbackLogo(item.title || "AD");
        els.pushAdTitle.textContent = item.title || "Publicidad";
        els.pushAdDescription.textContent = item.description || "";
        els.pushAd.classList.add("active");
        els.pushAd.setAttribute("aria-hidden", "false");

        clearTimeout(state.pushTimer);
        state.pushTimer = window.setTimeout(() => {
            hidePushAd();
        }, Number(state.adConfig.push.durationMs || 7000));
    }

    function hidePushAd() {
        els.pushAd.classList.remove("active");
        els.pushAd.setAttribute("aria-hidden", "true");
    }

    function getAvailablePushItems() {
        const scheduledItems = Array.isArray(state.adConfig?.push?.items)
            ? state.adConfig.push.items.filter(isPushItemActiveNow)
            : [];

        if (state.livePushItems.length) {
            return state.livePushItems.concat(scheduledItems);
        }

        return scheduledItems;
    }

    function isPushItemActiveNow(item) {
        if (!item) {
            return false;
        }

        const now = Date.now();
        const start = item.startAt ? Date.parse(item.startAt) : null;
        const end = item.endAt ? Date.parse(item.endAt) : null;

        if (start && Number.isFinite(start) && now < start) {
            return false;
        }

        if (end && Number.isFinite(end) && now > end) {
            return false;
        }

        return item.active !== false;
    }

    function getItemsForCategory(category) {
        if (!category) {
            return [];
        }
        if (category.dynamic === "favorites") {
            return Favorites.load();
        }
        return Array.isArray(category.items) ? category.items.slice() : [];
    }

    function findFirstPlayable(categories) {
        for (const category of categories) {
            for (const item of getItemsForCategory(category)) {
                if (item.type === "hls" || item.type === "yt") {
                    return item;
                }
            }
        }
        return null;
    }

    function descriptionByType(type) {
        if (type === "playlist") {
            return "Abrir sublista";
        }
        if (type === "yt") {
            return "Directo por YouTube";
        }
        return "Streaming HLS";
    }

    function unlockAudio() {
        if (els.player) {
            els.player.muted = false;
            els.player.volume = 1;
        }
        sendYouTubeCommand("unMute");
        sendYouTubeCommand("playVideo");
    }

    function sendYouTubeCommand(commandName, args = []) {
        if (els.ytPlayer?.contentWindow) {
            els.ytPlayer.contentWindow.postMessage(JSON.stringify({
                event: "command",
                func: commandName,
                args
            }), "*");
        }
    }

    function showLoader(active) {
        els.loading.classList.toggle("active", active);
        els.loading.setAttribute("aria-hidden", active ? "false" : "true");
    }

    function showToast(message) {
        clearTimeout(state.toastTimer);
        els.toast.textContent = message;
        els.toast.classList.add("active");
        state.toastTimer = window.setTimeout(() => {
            els.toast.classList.remove("active");
        }, 2200);
    }

    function ensureFocusedVisible() {
        const focused = els.channelList.querySelector(".channel-card.focused");
        if (focused) {
            focused.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
    }

    function hideSplash() {
        els.splash.classList.add("splash--hidden");
        window.setTimeout(() => {
            els.splash.style.display = "none";
        }, 500);
    }

    function fallbackLogo(name) {
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "TV")}&background=101927&color=ffffff&bold=true`;
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    init();
})();
