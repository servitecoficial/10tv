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
        toastTimer: null,
        currentChannel: null,
        youtubeLoadToken: 0,
        youtubeRecoveryTimer: null,
        interactionOverlayVisible: false,
        userInteracted: false,
        storageMode: "localStorage",
        memoryFavorites: [],
        epgIndex: {},
        epgLoaded: false,
        epgTimer: null,
        startupPromptOpen: false,
        startupFocusIndex: 0,
        pendingStartupChannel: null,
        youtubeMuted: true
    };

    const els = {};

    const Favorites = {
        load() {
            try {
                if (state.storageMode === "memory") {
                    return state.memoryFavorites.slice();
                }
                const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY));
                const normalized = normalizeFavorites(parsed);
                state.memoryFavorites = normalized.slice();
                return normalized;
            } catch (_error) {
                state.storageMode = "memory";
                return state.memoryFavorites.slice();
            }
        },
        save(items) {
            const normalized = normalizeFavorites(items);
            state.memoryFavorites = normalized.slice();

            if (state.storageMode === "memory") {
                return;
            }

            try {
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(normalized));
            } catch (_error) {
                state.storageMode = "memory";
            }
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
                    description: channel.description || "",
                    epgId: channel.epgId || channel.tvgId || "",
                    epgName: channel.epgName || channel.tvgName || ""
                });
            }

            this.save(favorites);
            return index < 0;
        }
    };

    function init() {
        initFavoritesStorage();
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
        loadEpgData();

        window.addEventListener("load", () => {
            window.setTimeout(hideSplash, 1800);
            state.pendingStartupChannel = findFirstPlayable(APP_CATALOG);
            if (shouldShowStartupPrompt()) {
                window.setTimeout(() => {
                    openStartupPrompt();
                }, 350);
            } else if (state.pendingStartupChannel) {
                playChannel(state.pendingStartupChannel, { silentLoader: true });
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
        els.interactionOverlay = document.getElementById("interaction-overlay");
        els.interactionButton = document.getElementById("interaction-button");
        els.startupOverlay = document.getElementById("startup-overlay");
        els.startupTitle = document.getElementById("startup-title");
        els.startupMessage = document.getElementById("startup-message");
        els.startupUpdate = document.getElementById("startup-update");
        els.startupClose = document.getElementById("startup-close");
        els.startupQrImage = document.getElementById("startup-qr-image");
        els.startupQrFallback = document.getElementById("startup-qr-fallback");
        els.startupTelegramTitle = document.getElementById("startup-telegram-title");
        els.startupTelegramMessage = document.getElementById("startup-telegram-message");
        els.playerControls = document.getElementById("player-controls");
        els.youtubeAudioToggle = document.getElementById("youtube-audio-toggle");
        els.mobileMenuButton = document.getElementById("mobile-menu-button");
        els.mobileCloseGuide = document.getElementById("mobile-close-guide");
    }

    function bindEvents() {
        document.addEventListener("keydown", handleKeydown);
        document.addEventListener("click", unlockAudio, { once: true });
        document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
        els.adDismiss.addEventListener("click", closeAd);
        if (els.interactionButton) {
            els.interactionButton.addEventListener("click", handleInteractionOverlayConfirm);
        }
        if (els.startupUpdate) {
            els.startupUpdate.addEventListener("click", () => runStartupAction("update"));
        }
        if (els.startupClose) {
            els.startupClose.addEventListener("click", () => runStartupAction("close"));
        }
        if (els.youtubeAudioToggle) {
            els.youtubeAudioToggle.addEventListener("click", () => toggleYouTubeAudio());
        }
        if (els.mobileMenuButton) {
            els.mobileMenuButton.addEventListener("click", () => {
                if (state.menuOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });
        }
        if (els.mobileCloseGuide) {
            els.mobileCloseGuide.addEventListener("click", () => closeMenu());
        }
    }

    function handleKeydown(event) {
        const key = event.key;
        const allowed = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Backspace", "Escape"];

        if (!allowed.includes(key)) {
            return;
        }

        event.preventDefault();

        if (state.startupPromptOpen) {
            handleStartupPrompt(key);
            return;
        }

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
        if (state.currentChannel?.type === "yt" && (key === "Enter" || key === "ArrowLeft")) {
            toggleYouTubeAudio();
            return;
        }

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

    function handleStartupPrompt(key) {
        if (key === "ArrowLeft" || key === "ArrowUp") {
            state.startupFocusIndex = 0;
            renderStartupPromptFocus();
            return;
        }

        if (key === "ArrowRight" || key === "ArrowDown") {
            state.startupFocusIndex = 1;
            renderStartupPromptFocus();
            return;
        }

        if (key === "Enter") {
            runStartupAction(state.startupFocusIndex === 0 ? "update" : "close");
            return;
        }

        if (key === "Backspace" || key === "Escape") {
            runStartupAction("close");
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
        if (els.mobileMenuButton) {
            els.mobileMenuButton.blur();
        }
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
            const epg = getChannelEpg(item);
            const metaPrimary = epg?.current
                ? `${formatProgramTime(epg.current.startMs)} - ${formatProgramTime(epg.current.stopMs)} | ${epg.current.title}`
                : (item.description || descriptionByType(item.type));
            const metaSecondary = epg?.next
                ? `Sigue ${formatProgramTime(epg.next.startMs)} | ${epg.next.title}`
                : (epg?.current?.subtitle || "");
            const status = item.type === "playlist"
                ? "Abrir lista"
                : epg?.current
                    ? `En guia hasta ${formatProgramTime(epg.current.stopMs)}`
                    : isPlaying
                        ? "En reproduccion"
                        : "Listo para ver";

            card.innerHTML = `
                <img class="channel-card__logo" src="${escapeAttribute(item.logo || fallbackLogo(item.name))}" alt="${escapeAttribute(item.name)}" onerror="this.src='${escapeAttribute(fallbackLogo(item.name))}'">
                <div class="channel-card__main">
                    <div class="channel-card__title-row">
                        <h4 class="channel-card__title">${escapeHtml(item.name)}</h4>
                        ${badge ? `<span class="channel-card__badge">${escapeHtml(badge)}</span>` : ""}
                    </div>
                    <div class="channel-card__meta-wrap">
                        <p class="channel-card__meta channel-card__meta--primary">${escapeHtml(metaPrimary)}</p>
                        ${metaSecondary ? `<p class="channel-card__meta channel-card__meta--secondary">${escapeHtml(metaSecondary)}</p>` : ""}
                    </div>
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
        const epg = state.currentChannel ? getChannelEpg(state.currentChannel) : null;
        els.nowPlayingLogo.src = logo;
        els.nowPlayingTitle.textContent = title;
        els.nowPlayingSubtitle.textContent = state.playingChannelName
            ? (epg?.current
                ? `Ahora ${formatProgramTime(epg.current.startMs)} - ${formatProgramTime(epg.current.stopMs)}: ${epg.current.title}${epg.next ? ` | Sigue ${formatProgramTime(epg.next.startMs)}: ${epg.next.title}` : ""}`
                : "La imagen del canal sigue visible mientras navegas por las listas.")
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
        const seen = new Set();
        let currentGroup = "Lista";

        for (let index = 0; index < lines.length; index += 1) {
            const line = lines[index].trim();

            if (!line || line.startsWith("#EXTM3U")) {
                continue;
            }

            if (/^group,/i.test(line)) {
                currentGroup = line.split(",").slice(1).join(",").trim() || "Lista";
                continue;
            }

            if (line.startsWith("#EXTINF")) {
                const nextLine = (lines[index + 1] || "").trim();
                if (!/^https?:/i.test(nextLine)) {
                    continue;
                }

                const name = line.split(",").pop()?.trim() || `Canal ${channels.length + 1}`;
                const logoMatch = line.match(/tvg-logo="([^"]+)"/i);
                const tvgIdMatch = line.match(/tvg-id="([^"]+)"/i);
                const tvgNameMatch = line.match(/tvg-name="([^"]+)"/i);
                const groupMatch = line.match(/group-title="([^"]+)"/i);

                registerParsedChannel(channels, seen, {
                    id: `${sourceId}-${slugify(name)}-${channels.length}`,
                    name,
                    type: "hls",
                    url: nextLine,
                    logo: logoMatch ? logoMatch[1] : "",
                    description: buildExternalDescription(groupMatch ? groupMatch[1].trim() : currentGroup),
                    tvgId: tvgIdMatch ? tvgIdMatch[1].trim() : "",
                    tvgName: tvgNameMatch ? tvgNameMatch[1].trim() : ""
                }, sourceId);
                continue;
            }

            const parsedLoose = parseLooseChannelLine(line, currentGroup, sourceId, channels.length);
            if (parsedLoose) {
                registerParsedChannel(channels, seen, parsedLoose, sourceId);
            }
        }

        return channels;
    }

    function parseLooseChannelLine(line, currentGroup, sourceId, index) {
        const parts = line.split(",");
        if (parts.length < 3) {
            return null;
        }

        const sourceTag = (parts[0] || "").trim();
        const url = (parts[parts.length - 1] || "").trim();
        const name = parts.slice(1, -1).join(",").trim();

        if (!/^https?:/i.test(url) || !name) {
            return null;
        }

        if (/\.(png|jpg|jpeg|webp|gif)(["']?)$/i.test(url) || /^group-title=/i.test(name)) {
            return null;
        }

        const inferredGroup = inferGroupFromName(name, currentGroup);

        return {
            id: `${sourceId}-${slugify(name)}-${index}`,
            name: cleanChannelName(name),
            type: "hls",
            url,
            logo: "",
            description: buildExternalDescription(inferredGroup),
            tvgId: sourceTag !== "ext" ? sourceTag : "",
            tvgName: cleanChannelName(name)
        };
    }

    function registerParsedChannel(channels, seen, channel, sourceId) {
        const normalizedName = cleanChannelName(channel.name);
        const key = `${normalizedName.toLowerCase()}|${String(channel.url || "").toLowerCase()}`;

        if (!normalizedName || !channel.url || seen.has(key)) {
            return false;
        }

        seen.add(key);
        channels.push({
            id: channel.id || `${sourceId}-${slugify(normalizedName)}-${channels.length}`,
            name: normalizedName,
            type: "hls",
            url: channel.url,
            logo: channel.logo || "",
            description: channel.description || "Canal cargado desde lista externa",
            tvgId: channel.tvgId || "",
            tvgName: channel.tvgName || normalizedName
        });
        return true;
    }

    function cleanChannelName(name) {
        return String(name || "")
            .replace(/^[A-ZÁÉÍÓÚÑ0-9 /+-]+:\s*/i, "")
            .replace(/\|\s*(SD|HD|FHD)\s*$/i, "")
            .replace(/\s+/g, " ")
            .trim();
    }

    function inferGroupFromName(name, fallbackGroup) {
        const match = String(name || "").match(/^([A-ZÁÉÍÓÚÑ0-9 /+-]+):\s*/i);
        if (match && match[1]) {
            return match[1].trim();
        }
        return fallbackGroup || "Lista";
    }

    function buildExternalDescription(groupTitle) {
        const group = String(groupTitle || "Lista").trim();
        return `Canal cargado desde lista externa | ${group}`;
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
        state.currentChannel = channel;
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
        clearTimeout(state.youtubeRecoveryTimer);
        hideInteractionOverlay();
        state.youtubeMuted = true;
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
        updatePlayerControls();
    }

    function playYouTube(channel, silentLoader) {
        const loadToken = Date.now();
        state.youtubeLoadToken = loadToken;
        const origin = window.location.origin && window.location.origin !== "null"
            ? window.location.origin
            : "https://www.youtube.com";
        const autoplayMuted = shouldForceMutedAutoplay();
        state.youtubeMuted = autoplayMuted;
        const embedUrl = `https://www.youtube-nocookie.com/embed/${channel.ytId}?autoplay=1&mute=${autoplayMuted ? "1" : "0"}&controls=0&rel=0&playsinline=1&enablejsapi=1&modestbranding=1&loop=1&playlist=${channel.ytId}&fs=1&origin=${encodeURIComponent(origin)}&t=${Date.now()}`;

        els.ytPlayer.style.display = "block";
        els.ytPlayer.src = "about:blank";
        window.setTimeout(() => {
            els.ytPlayer.src = embedUrl;
        }, 40);
        scheduleYouTubeAutoplay(loadToken, autoplayMuted, silentLoader);
        updatePlayerControls();
        showHud(channel.description || "Canal en vivo");
    }

    function scheduleYouTubeAutoplay(loadToken, autoplayMuted, silentLoader) {
        const retryMs = [450, 1200, 2200, 3600];
        retryMs.forEach((delay, index) => {
            window.setTimeout(() => {
                if (state.youtubeLoadToken !== loadToken) {
                    return;
                }

                sendYouTubeCommand("playVideo");
                if (autoplayMuted) {
                    sendYouTubeCommand("mute");
                    state.youtubeMuted = true;
                } else if (state.userInteracted) {
                    sendYouTubeCommand("unMute");
                    state.youtubeMuted = false;
                }

                if (index >= 1) {
                    unlockAudio();
                }

                if (!silentLoader && index === 1) {
                    showLoader(false);
                }
            }, delay);
        });

        clearTimeout(state.youtubeRecoveryTimer);
        state.youtubeRecoveryTimer = window.setTimeout(() => {
            if (state.youtubeLoadToken !== loadToken) {
                return;
            }

            if (!silentLoader) {
                showLoader(false);
            }

            if (needsInteractionFallback()) {
                showInteractionOverlay();
                showToast("Si no arranca, toca la pantalla para iniciar YouTube");
            }
        }, 4600);
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
        const epg = getChannelEpg(channel);
        els.hudLogo.src = channel.logo || fallbackLogo(channel.name);
        els.hudTitle.textContent = channel.name;
        els.hudMeta.textContent = epg?.current
            ? `Ahora: ${epg.current.title}${epg.next ? ` | Sigue ${formatProgramTime(epg.next.startMs)}: ${epg.next.title}` : ""}`
            : (channel.description || "Canal en reproduccion");
        showHud(epg?.current
            ? `Ahora: ${epg.current.title}${epg.next ? ` | Sigue ${formatProgramTime(epg.next.startMs)}: ${epg.next.title}` : ""}`
            : (channel.description || "Canal en reproduccion"));
        updatePlayerControls();
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
            if (config && config.enabled) {
                state.adConfig = config;
                if (document.readyState === "complete") {
                    scheduleStartupAd();
                }
                schedulePushAds();
                startLivePushPolling();
                return;
            }
            state.adConfig = null;
        } catch (_error) {
            state.adConfig = null;
        }
    }

    function scheduleStartupAd() {
        if (state.startupAdScheduled) {
            return;
        }
        // El inicio queda reservado solo para la pantalla principal de bienvenida.
        state.startupAdScheduled = true;
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
        state.userInteracted = true;
        if (els.player) {
            els.player.muted = false;
            els.player.volume = 1;
        }
        sendYouTubeCommand("playVideo");
        if (state.currentChannel?.type === "yt" && !shouldForceMutedAutoplay()) {
            sendYouTubeCommand("unMute");
            state.youtubeMuted = false;
        }
        hideInteractionOverlay();
        updatePlayerControls();
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

    function handleInteractionOverlayConfirm() {
        state.userInteracted = true;
        hideInteractionOverlay();
        sendYouTubeCommand("playVideo");
        if (!shouldForceMutedAutoplay()) {
            sendYouTubeCommand("unMute");
            state.youtubeMuted = false;
        } else {
            sendYouTubeCommand("mute");
            state.youtubeMuted = true;
        }
        if (state.currentChannel?.type === "yt") {
            playYouTube(state.currentChannel, true);
        }
        updatePlayerControls();
    }

    function showInteractionOverlay() {
        if (!els.interactionOverlay) {
            return;
        }
        state.interactionOverlayVisible = true;
        els.interactionOverlay.classList.add("active");
        els.interactionOverlay.setAttribute("aria-hidden", "false");
    }

    function hideInteractionOverlay() {
        if (!els.interactionOverlay) {
            return;
        }
        state.interactionOverlayVisible = false;
        els.interactionOverlay.classList.remove("active");
        els.interactionOverlay.setAttribute("aria-hidden", "true");
    }

    function needsInteractionFallback() {
        if (!state.currentChannel || state.currentChannel.type !== "yt") {
            return false;
        }
        return isLikelyEmbeddedWebView() || /Android|Mobile|TV/i.test(navigator.userAgent || "");
    }

    function shouldForceMutedAutoplay() {
        return !state.userInteracted || isLikelyEmbeddedWebView();
    }

    function isLikelyEmbeddedWebView() {
        const ua = navigator.userAgent || "";
        const appVersion = navigator.appVersion || "";
        return /; wv\)|Version\/[\d.]+ Chrome\/[\d.]+ Mobile/i.test(ua)
            || /AppInventor|MIT App Inventor/i.test(ua)
            || /wv/i.test(appVersion);
    }

    function initFavoritesStorage() {
        try {
            const probeKey = `${FAVORITES_KEY}__probe`;
            localStorage.setItem(probeKey, "1");
            localStorage.removeItem(probeKey);
            state.storageMode = "localStorage";
            state.memoryFavorites = normalizeFavorites(JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"));
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(state.memoryFavorites));
        } catch (_error) {
            state.storageMode = "memory";
            state.memoryFavorites = [];
        }
    }

    function normalizeFavorites(items) {
        if (!Array.isArray(items)) {
            return [];
        }

        const seen = new Set();
        return items
            .map((item, index) => normalizeFavoriteItem(item, index))
            .filter((item) => {
                if (!item || seen.has(item.id)) {
                    return false;
                }
                seen.add(item.id);
                return true;
            });
    }

    function normalizeFavoriteItem(item, index) {
        if (!item || typeof item !== "object") {
            return null;
        }

        const type = item.type === "m3u8" ? "hls" : item.type;
        if (type !== "hls" && type !== "yt") {
            return null;
        }

        const name = String(item.name || `Favorito ${index + 1}`).trim();
        const safeId = String(item.id || slugify(name) || `favorito-${index + 1}`).trim();
        const normalized = {
            id: safeId,
            name,
            type,
            url: String(item.url || "").trim(),
            ytId: String(item.ytId || item.idYoutube || "").trim(),
            logo: String(item.logo || "").trim(),
            description: String(item.description || "").trim(),
            epgId: String(item.epgId || item.tvgId || "").trim(),
            epgName: String(item.epgName || item.tvgName || "").trim()
        };

        if (normalized.type === "yt" && !normalized.ytId) {
            return null;
        }

        if (normalized.type === "hls" && !normalized.url) {
            return null;
        }

        return normalized;
    }

    async function loadEpgData() {
        const config = window.EPG_CONFIG;
        if (!config?.sources?.length) {
            return;
        }

        const cached = loadEpgCache();
        if (cached) {
            state.epgIndex = cached;
            state.epgLoaded = true;
            refreshEpgUi();
        }

        try {
            const responses = await Promise.allSettled(
                config.sources.map((source) => fetch(`${source.url}?t=${Date.now()}`, { cache: "no-store" }))
            );

            const mergedIndex = {};

            for (const responseEntry of responses) {
                if (responseEntry.status !== "fulfilled" || !responseEntry.value?.ok) {
                    continue;
                }

                const text = await responseEntry.value.text();
                mergeEpgIndex(mergedIndex, parseXmltv(text));
            }

            if (Object.keys(mergedIndex).length) {
                state.epgIndex = mergedIndex;
                state.epgLoaded = true;
                saveEpgCache(mergedIndex);
                refreshEpgUi();
            }
        } catch (_error) {
            if (!state.epgLoaded) {
                showToast("La guia de programacion no se pudo actualizar");
            }
        }

        clearInterval(state.epgTimer);
        state.epgTimer = window.setInterval(() => {
            refreshEpgUi();
        }, Number(config.refreshUiMs || 60000));
    }

    function parseXmltv(text) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/xml");
        const parseError = doc.querySelector("parsererror");
        if (parseError) {
            return {};
        }

        const now = Date.now();
        const channelNamesById = new Map();
        const programByChannelId = new Map();

        doc.querySelectorAll("channel").forEach((channelNode) => {
            const channelId = channelNode.getAttribute("id") || "";
            const names = Array.from(channelNode.querySelectorAll("display-name"))
                .map((node) => node.textContent.trim())
                .filter(Boolean);
            if (channelId) {
                channelNamesById.set(channelId, names);
            }
        });

        doc.querySelectorAll("programme").forEach((programmeNode) => {
            const channelId = programmeNode.getAttribute("channel") || "";
            const startMs = parseXmltvDate(programmeNode.getAttribute("start"));
            const stopMs = parseXmltvDate(programmeNode.getAttribute("stop"));

            if (!channelId || !Number.isFinite(startMs) || !Number.isFinite(stopMs)) {
                return;
            }

            const program = {
                title: (programmeNode.querySelector("title")?.textContent || "").trim(),
                subtitle: (programmeNode.querySelector("sub-title")?.textContent || "").trim(),
                desc: (programmeNode.querySelector("desc")?.textContent || "").trim(),
                startMs,
                stopMs
            };

            const currentEntry = programByChannelId.get(channelId) || { current: null, next: null };

            if (startMs <= now && stopMs > now) {
                if (!currentEntry.current || startMs > currentEntry.current.startMs) {
                    currentEntry.current = program;
                }
            } else if (startMs > now) {
                if (!currentEntry.next || startMs < currentEntry.next.startMs) {
                    currentEntry.next = program;
                }
            }

            programByChannelId.set(channelId, currentEntry);
        });

        const index = {};

        programByChannelId.forEach((snapshot, channelId) => {
            const keys = [channelId].concat(channelNamesById.get(channelId) || []);
            keys.forEach((key) => {
                const normalizedKey = normalizeEpgKey(key);
                if (!normalizedKey) {
                    return;
                }
                assignEpgSnapshot(index, normalizedKey, snapshot);
            });
        });

        return index;
    }

    function parseXmltvDate(value) {
        const match = String(value || "").match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s*([+-]\d{4})?/);
        if (!match) {
            return NaN;
        }

        const [, year, month, day, hour, minute, second, offset] = match;
        const utcTime = Date.UTC(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second)
        );

        if (!offset) {
            return utcTime;
        }

        const sign = offset.startsWith("-") ? -1 : 1;
        const offsetHours = Number(offset.slice(1, 3));
        const offsetMinutes = Number(offset.slice(3, 5));
        const totalOffsetMs = sign * ((offsetHours * 60) + offsetMinutes) * 60 * 1000;
        return utcTime - totalOffsetMs;
    }

    function mergeEpgIndex(target, source) {
        Object.entries(source || {}).forEach(([key, snapshot]) => {
            assignEpgSnapshot(target, key, snapshot);
        });
    }

    function assignEpgSnapshot(target, key, snapshot) {
        if (!snapshot || !key) {
            return;
        }

        const existing = target[key];
        if (!existing || (!existing.current && snapshot.current) || (!existing.next && snapshot.next)) {
            target[key] = snapshot;
        }
    }

    function getChannelEpg(channel) {
        if (!channel || !state.epgIndex) {
            return null;
        }

        const keys = buildEpgKeysForChannel(channel);
        for (const key of keys) {
            if (state.epgIndex[key]) {
                return state.epgIndex[key];
            }
        }
        return null;
    }

    function buildEpgKeysForChannel(channel) {
        const keys = [];
        const aliases = window.EPG_CONFIG?.aliases || {};
        const normalizedName = normalizeEpgKey(channel.name);
        const configuredAliases = aliases[normalizedName] || [];

        [
            channel.epgId,
            channel.tvgId,
            channel.epgName,
            channel.tvgName,
            channel.name,
            ...configuredAliases
        ].forEach((value) => {
            const normalized = normalizeEpgKey(value);
            if (normalized && !keys.includes(normalized)) {
                keys.push(normalized);
            }
        });

        return keys;
    }

    function normalizeEpgKey(value) {
        return String(value || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/&/g, "and")
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\s+/g, " ");
    }

    function formatProgramTime(timeMs) {
        if (!Number.isFinite(timeMs)) {
            return "";
        }
        return new Intl.DateTimeFormat("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(new Date(timeMs));
    }

    function refreshEpgUi() {
        renderChannelList();
        updateNowPlayingCard();
        if (state.currentChannel) {
            updateHud(state.currentChannel);
        }
    }

    function shouldShowStartupPrompt() {
        return Boolean(window.APP_LAUNCH_CONFIG?.startupPromptEnabled);
    }

    function openStartupPrompt() {
        if (!els.startupOverlay) {
            if (state.pendingStartupChannel) {
                playChannel(state.pendingStartupChannel, { silentLoader: true });
            }
            return;
        }

        const config = window.APP_LAUNCH_CONFIG || {};
        state.startupPromptOpen = true;
        state.startupFocusIndex = 0;

        els.startupTitle.textContent = config.startupTitle || "Actualizacion disponible";
        els.startupMessage.textContent = config.startupMessage || "Revisa tu version antes de entrar.";
        els.startupUpdate.textContent = config.startupUpdateLabel || "Actualizar";
        els.startupClose.textContent = config.startupCloseLabel || "Cerrar";
        els.startupTelegramTitle.textContent = config.telegramTitle || "Canal de Telegram";
        els.startupTelegramMessage.textContent = config.telegramMessage || "Agrega tu QR cuando lo tengas.";

        const qrImage = String(config.telegramQrImage || "").trim();
        els.startupQrImage.classList.remove("is-ready");
        els.startupQrFallback.style.display = "flex";
        if (qrImage) {
            els.startupQrImage.onload = () => {
                els.startupQrImage.classList.add("is-ready");
                els.startupQrFallback.style.display = "none";
            };
            els.startupQrImage.onerror = () => {
                els.startupQrImage.classList.remove("is-ready");
                els.startupQrFallback.style.display = "flex";
            };
            els.startupQrImage.src = qrImage;
        } else {
            els.startupQrImage.removeAttribute("src");
        }

        els.startupOverlay.classList.add("active");
        els.startupOverlay.setAttribute("aria-hidden", "false");
        renderStartupPromptFocus();
        updatePlayerControls();
    }

    function closeStartupPrompt() {
        if (!state.startupPromptOpen) {
            return;
        }

        state.startupPromptOpen = false;
        els.startupOverlay.classList.remove("active");
        els.startupOverlay.setAttribute("aria-hidden", "true");

        if (state.pendingStartupChannel && !state.playingChannelId) {
            playChannel(state.pendingStartupChannel, { silentLoader: true });
        }
        updatePlayerControls();
    }

    function renderStartupPromptFocus() {
        if (!els.startupUpdate || !els.startupClose) {
            return;
        }

        els.startupUpdate.classList.toggle("is-focused", state.startupFocusIndex === 0);
        els.startupClose.classList.toggle("is-focused", state.startupFocusIndex === 1);
    }

    function runStartupAction(action) {
        const config = window.APP_LAUNCH_CONFIG || {};

        if (action === "update") {
            const updateUrl = String(config.updateUrl || config.telegramUrl || "").trim();
            if (!updateUrl) {
                showToast("Configura APP_LAUNCH_CONFIG.updateUrl o telegramUrl");
                return;
            }
            try {
                window.open(updateUrl, "_blank", "noopener");
            } catch (_error) {
                window.location.href = updateUrl;
            }
            return;
        }

        closeStartupPrompt();
    }

    function toggleYouTubeAudio() {
        if (state.currentChannel?.type !== "yt") {
            showToast("El control rapido de audio es solo para YouTube");
            return;
        }

        state.userInteracted = true;
        state.youtubeMuted = !state.youtubeMuted;
        if (state.youtubeMuted) {
            sendYouTubeCommand("mute");
            showToast("YouTube en silencio");
        } else {
            sendYouTubeCommand("unMute");
            sendYouTubeCommand("playVideo");
            showToast("YouTube con sonido");
        }
        updatePlayerControls();
    }

    function updatePlayerControls() {
        if (!els.playerControls || !els.youtubeAudioToggle) {
            return;
        }

        const visible = state.currentChannel?.type === "yt" && !state.startupPromptOpen;
        els.playerControls.classList.toggle("active", visible);
        els.playerControls.setAttribute("aria-hidden", visible ? "false" : "true");
        els.youtubeAudioToggle.textContent = state.youtubeMuted ? "Activar sonido" : "Silenciar YouTube";
        els.youtubeAudioToggle.classList.toggle("is-focused", visible);
    }

    function loadEpgCache() {
        try {
            const config = window.EPG_CONFIG;
            if (!config?.cacheKey || state.storageMode === "memory") {
                return null;
            }

            const raw = localStorage.getItem(config.cacheKey);
            if (!raw) {
                return null;
            }

            const parsed = JSON.parse(raw);
            if (!parsed?.savedAt || !parsed?.index) {
                return null;
            }

            if ((Date.now() - parsed.savedAt) > Number(config.cacheTtlMs || 0)) {
                return null;
            }

            return parsed.index;
        } catch (_error) {
            return null;
        }
    }

    function saveEpgCache(index) {
        try {
            const config = window.EPG_CONFIG;
            if (!config?.cacheKey || state.storageMode === "memory") {
                return;
            }

            localStorage.setItem(config.cacheKey, JSON.stringify({
                savedAt: Date.now(),
                index
            }));
        } catch (_error) {
            // ignore cache errors in restricted webviews
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
