(() => {
    // --- Constants ---
    const CSS_CLASSES = {
        MACOS_CONTROLS: 'macos-window-controls',
        CONTROL_BUTTON: 'control-button',
        URL_INPUT_MODE: 'url-input-mode',
        ACTIVE_TAB: 'active-tab',
        ACTIVE_WEBVIEW: 'active-webview',
        TAB_ITEM: 'tab-item',
        TAB_FAVICON: 'tab-favicon',
        TAB_TITLE: 'tab-title',
        CLOSE_TAB_BTN: 'close-tab-button',
        TAB_URL_INPUT: 'tab-url-input',
        LOADING_ICON: 'fa-times', // Font Awesome class for stop icon
        RELOAD_ICON: 'fa-redo',   // Font Awesome class for reload icon
        DRAG_OVER: 'tab-drag-over', // Nová třída pro vizuální feedback při přetahování
        IMMERSIVE_MODE: 'immersive-mode', // Třída pro imerzivní režim
    };

    const ELEMENT_IDS = {
        TITLE_BAR: 'title-bar',
        WINDOW_CONTROLS: 'window-controls',
        CLOSE_BTN: 'close-button',
        MINIMIZE_BTN: 'minimize-button',
        MAXIMIZE_BTN: 'maximize-button',
        FOURTH_BUTTON: 'fourth-button',
        TABS_CONTAINER: 'tabs-container',
        NEW_TAB_BTN: 'new-tab-button',
        WEBVIEW_CONTAINER: 'webview-container',
        URL_INPUT: 'url-input',
        ADDRESS_BAR_CONTAINER: 'address-bar-container',
        BACK_BTN: 'back-button',
        FORWARD_BTN: 'forward-button',
        RELOAD_BTN: 'reload-button',
        HOME_BTN: 'home-button',
        BOOKMARK_BTN: 'bookmark-button',
        SEARCH_BTN: 'search-button',
        SETTINGS_BTN: 'settings-button',
    };

    const INTERNAL_PAGES = {
        SETTINGS: 'about:settings',
        SETTINGS_FILE: 'views/settings/settings.html',
        SETTINGS_ID: 'settings-tab'
    };

    let DEFAULT_URL;// Výchozí hodnota, přepíše se načtenou
    const GOOGLE_FAVICON_SERVICE = 'https://www.google.com/s2/favicons?domain=';
    const FAVICON_SIZE = '&sz=64';
    const DEFAULT_FAVICON_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="%23555" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
    const SETTINGS_ICON_CODE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>';

    // --- Application State ---
    let tabs = []; // Array to store tab data objects
    let activeTabId = null; // ID of the currently active tab
    let isUrlInputMode = false; // Flag for address bar visibility

    // --- DOM Element References ---
    let titleBar, tabsContainer, newTabButton, webviewContainer, urlInput;
    let addressBarContainer, backButton, forwardButton, reloadButton;
    let homeButton, bookmarkButton, searchButton, settingsButton;

    /**
     * Načte výchozí URL z nastavení.
     */
    async function loadDefaultUrl() {
        try {
            if (window.electronAPI && window.electronAPI.getSettings) {
                const settings = await window.electronAPI.getSettings();
                if (settings && settings.homepage) {
                    DEFAULT_URL = settings.homepage;
                    console.log('Default URL set to:', DEFAULT_URL);
                } else {
                    console.warn('Homepage setting not found, using default.');
                }
            } else {
                console.warn('Cannot load settings, getSettings API not available.');
            }
        } catch (error) {
            console.error('Error loading default URL from settings:', error);
        }
    }

    /**
     * Initializes DOM element references and performs initial checks.
     * @returns {boolean} True if initialization is successful, false otherwise.
     */
    function initializeDOMElements() {
        titleBar = document.getElementById(ELEMENT_IDS.TITLE_BAR);
        tabsContainer = document.getElementById(ELEMENT_IDS.TABS_CONTAINER);
        newTabButton = document.getElementById(ELEMENT_IDS.NEW_TAB_BTN);
        webviewContainer = document.getElementById(ELEMENT_IDS.WEBVIEW_CONTAINER);
        urlInput = document.getElementById(ELEMENT_IDS.URL_INPUT);
        addressBarContainer = document.getElementById(ELEMENT_IDS.ADDRESS_BAR_CONTAINER);
        backButton = document.getElementById(ELEMENT_IDS.BACK_BTN);
        forwardButton = document.getElementById(ELEMENT_IDS.FORWARD_BTN);
        reloadButton = document.getElementById(ELEMENT_IDS.RELOAD_BTN);
        homeButton = document.getElementById(ELEMENT_IDS.HOME_BTN);
        bookmarkButton = document.getElementById(ELEMENT_IDS.BOOKMARK_BTN);
        searchButton = document.getElementById(ELEMENT_IDS.SEARCH_BTN);
        settingsButton = document.getElementById(ELEMENT_IDS.SETTINGS_BTN);

        if (!titleBar) {
            console.error(`Element #${ELEMENT_IDS.TITLE_BAR} not found!`);
            return false;
        }
        if (!tabsContainer || !newTabButton || !webviewContainer || !urlInput || !addressBarContainer || !backButton || !forwardButton || !reloadButton || !homeButton || !bookmarkButton || !searchButton || !settingsButton) {
            console.error("One or more essential UI elements are missing!");
            return false;
        }
        return true;
    }

    // --- Helper Functions ---

    /**
     * Gets the tab data object for the currently active tab.
     * @returns {object | null} The active tab data object or null if not found.
     */
    const getActiveTab = () => tabs.find(tab => tab.id === activeTabId) || null;

    /**
     * Formats a user-entered string into a valid URL or a search query URL.
     * @param {string} input - The raw input string.
     * @returns {string} A formatted URL.
     */
    const formatURL = (input) => {
        let url = input.trim();
        // Basic check if it looks like a URL vs. a search term
        const looksLikeUrl = url.includes('.') && !url.includes(' ');
        const hasProtocol = url.startsWith('http://') || url.startsWith('https://');

        if (!hasProtocol) {
            if (looksLikeUrl) {
                url = `https://${url}`;
            } else {
                // Assume it's a search term
                url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            }
        }
        return url;
    };

    /**
     * Generates a URL to fetch a favicon using Google's service.
     * @param {string} pageUrl - The URL of the page.
     * @returns {string} The URL for the favicon service.
     */
    const getFaviconUrl = (pageUrl) => {
        try {
            const url = new URL(pageUrl);
            return `${GOOGLE_FAVICON_SERVICE}${url.hostname}${FAVICON_SIZE}`;
        } catch (e) {
            console.warn("Could not parse URL for favicon:", pageUrl);
            return DEFAULT_FAVICON_SVG; // Fallback to default
        }
    };

    const setFavicon = (tabId, faviconUrl) => {
        const tab = tabs.find(t => t.id === tabId);
        if (tab) {
            tab.favicon.src = faviconUrl;
        }

    };

    // --- macOS Window Controls Setup ---
    /**
     * Creates and adds macOS-style window control buttons.
     */
    function setupWindowControls() {
        console.log("Setting up macOS style title bar controls...");

        const createButton = (id, title) => {
            const button = document.createElement('div');
            button.id = id;
            button.classList.add(CSS_CLASSES.CONTROL_BUTTON);
            button.title = title;
            return button;
        };

        const windowControls = document.createElement('div');
        windowControls.id = ELEMENT_IDS.WINDOW_CONTROLS;
        windowControls.classList.add(CSS_CLASSES.MACOS_CONTROLS);

        const closeButton = createButton(ELEMENT_IDS.CLOSE_BTN, 'Close');
        const minimizeButton = createButton(ELEMENT_IDS.MINIMIZE_BTN, 'Minimize');
        const maximizeButton = createButton(ELEMENT_IDS.MAXIMIZE_BTN, 'Maximize/Restore');
        
        // Přidání čtvrtého tlačítka
        const fourthButton = createButton(ELEMENT_IDS.FOURTH_BUTTON, 'Přepnout imerzivní režim');
        // Nastavení barvy jako fialová pro imerzivní režim
        /* fourthButton.style.backgroundColor = '#673ab7'; */

        windowControls.appendChild(closeButton);
        windowControls.appendChild(minimizeButton);
        windowControls.appendChild(maximizeButton);
        windowControls.appendChild(fourthButton); // Přidání do DOM

        titleBar.prepend(windowControls); // Add controls to the beginning of the title bar

        // Add Electron API listeners if available
        if (window.electronAPI) {
            closeButton.addEventListener('click', () => {
                console.log('Close button clicked');
                window.electronAPI.closeWindow();
            });

            minimizeButton.addEventListener('click', () => {
                console.log('Minimize button clicked');
                window.electronAPI.minimizeWindow();
            });

            maximizeButton.addEventListener('click', () => {
                console.log('Maximize button clicked');
                window.electronAPI.maximizeWindow();
            });
            
            // Event listener pro čtvrté tlačítko
            fourthButton.addEventListener('click', () => {
                console.log('Immersive mode button clicked');
                toggleImmersiveMode();
            });
        } else {
            console.error('window.electronAPI is not available! Check preload script and contextIsolation.');
            // Visually disable buttons if API is not present
            [closeButton, minimizeButton, maximizeButton, fourthButton].forEach(btn => {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.title = "Error: Window control unavailable";
            });
        }
    }

    /**
     * Přepíná mezi normálním a imerzivním režimem.
     * V imerzivním režimu je skrytý titlebar a aktivní webview zabírá celou plochu okna.
     */
    function toggleImmersiveMode() {
        const body = document.body;
        const isImmersive = body.classList.toggle(CSS_CLASSES.IMMERSIVE_MODE);
        
        console.log(`Toggling immersive mode: ${isImmersive ? 'ON' : 'OFF'}`);
        
        // Pokud jsme v imerzivním režimu, nastavíme ESC pro návrat
        if (isImmersive) {
            // Kontrola, jestli máme aktivní webview
            const activeTab = getActiveTab();
            if (activeTab?.webview) {
                // Zaměřit webview
                activeTab.webview.focus();
            }
            
            // Přidáme globální listener pro klávesy (ESC pro ukončení imerzivního režimu)
            document.addEventListener('keydown', exitImmersiveModeOnEscape);
        } else {
            // Odebereme listener při opuštění imerzivního režimu
            document.removeEventListener('keydown', exitImmersiveModeOnEscape);
        }
    }
    
    /**
     * Event handler pro ukončení imerzivního režimu pomocí klávesy ESC
     */
    function exitImmersiveModeOnEscape(event) {
        if (event.key === 'Escape') {
            const body = document.body;
            if (body.classList.contains(CSS_CLASSES.IMMERSIVE_MODE)) {
                console.log('Exiting immersive mode via Escape key');
                body.classList.remove(CSS_CLASSES.IMMERSIVE_MODE);
                document.removeEventListener('keydown', exitImmersiveModeOnEscape);
            }
        }
    }

    // --- Tab and Address Bar Mode Management ---

    /**
     * Toggles the UI between showing tabs and showing the URL input bar.
     * @param {boolean} showInput - True to show URL input, false to show tabs.
     */
    const toggleUrlInputMode = (showInput) => {
        if (showInput) {
            titleBar.classList.add(CSS_CLASSES.URL_INPUT_MODE);
            isUrlInputMode = true;
            // Delay focus slightly to ensure element is visible/ready
            setTimeout(() => {
                urlInput.focus();
                urlInput.select();
            }, 50); // 50ms delay might need adjustment
        } else {
            titleBar.classList.remove(CSS_CLASSES.URL_INPUT_MODE);
            isUrlInputMode = false;
            // Focus back on the active webview
            const activeTab = getActiveTab();
            if (activeTab?.webview) {
                activeTab.webview.focus();
            }
        }
    };

    /**
     * Updates the state of the navigation buttons (back, forward, reload).
     */
    const updateNavigationButtons = () => {
        const activeTab = getActiveTab();
        
        // --- Úprava zde: Speciální logika pro Nastavení --- 
        if (activeTab?.id === INTERNAL_PAGES.SETTINGS_ID) {
            backButton.disabled = true;
            forwardButton.disabled = true;
            // Nastavíme ikonu reload staticky a deaktivujeme tlačítko
            reloadButton.innerHTML = `<i class="fas ${CSS_CLASSES.RELOAD_ICON}"></i>`;
            reloadButton.disabled = true; 
            reloadButton.title = 'Refresh (disabled for settings)';
            return; // Ukončíme funkci zde pro stránku nastavení
        }
        // --- Konec úpravy pro Nastavení ---
        
        if (!activeTab?.webview) {
            backButton.disabled = true;
            forwardButton.disabled = true;
            reloadButton.innerHTML = `<i class="fas ${CSS_CLASSES.RELOAD_ICON}"></i>`;
            reloadButton.disabled = true; // Deaktivujeme i zde
            reloadButton.title = 'Reload';
            return;
        }

        const webview = activeTab.webview;
        backButton.disabled = !webview.canGoBack();
        forwardButton.disabled = !webview.canGoForward();
        reloadButton.disabled = false; // Povolíme pro běžné stránky

        // Update reload/stop button based on loading state
        if (activeTab.isLoading) {
            reloadButton.innerHTML = `<i class="fas ${CSS_CLASSES.LOADING_ICON}"></i>`;
            reloadButton.title = 'Stop';
        } else {
            reloadButton.innerHTML = `<i class="fas ${CSS_CLASSES.RELOAD_ICON}"></i>`;
            reloadButton.title = 'Reload';
        }
    };

    // --- Tab Management Functions ---

    /**
     * Creates a new tab element (the clickable item in the tab bar).
     * @param {string} tabId - The unique ID for the tab.
     * @param {boolean} isActive - Whether this tab should be initially active.
     * @returns {{tabElement: HTMLElement, favicon: HTMLImageElement, titleSpan: HTMLSpanElement}}
     */
    function createTabElement(tabId, isActive) {
        const tabElement = document.createElement('div');
        tabElement.id = tabId;
        tabElement.classList.add(CSS_CLASSES.TAB_ITEM);
        if (isActive) {
            tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
        }
        tabElement.dataset.tabId = tabId; // Store ID for easy access
        
        // Přidání draggable atributu
        tabElement.draggable = true;

        const favicon = document.createElement('img');
        favicon.classList.add(CSS_CLASSES.TAB_FAVICON);
        favicon.src = DEFAULT_FAVICON_SVG;
        favicon.style.width = '16px';
        favicon.style.height = '16px';
        favicon.style.flexShrink = '0'; // Prevent icon squishing
        favicon.onerror = () => { favicon.src = DEFAULT_FAVICON_SVG; }; // Fallback on error

        const titleSpan = document.createElement('span');
        titleSpan.classList.add(CSS_CLASSES.TAB_TITLE);
        titleSpan.textContent = 'New Tab';
        titleSpan.title = 'New Tab'; // Tooltip

        const closeButton = document.createElement('button');
        closeButton.classList.add(CSS_CLASSES.CLOSE_TAB_BTN);
        closeButton.innerHTML = '&times;'; // Simple 'x'
        closeButton.title = 'Close Tab';
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent tab switch click
            closeTab(tabId);
        });

        tabElement.appendChild(favicon);
        tabElement.appendChild(titleSpan);
        tabElement.appendChild(closeButton);

        // Click listener for switching/editing tab
        tabElement.addEventListener('click', () => handleTabClick(tabId));
        
        // Přidání drag and drop event listenerů
        // dragstart - když uživatel začne přetahovat záložku
        tabElement.addEventListener('dragstart', (event) => {
            // Odstraněna kontrola pro nastavení - umožňujeme přetahování
            console.log(`Starting to drag tab: ${tabId}`);
            event.dataTransfer.setData('text/plain', tabId);
            event.dataTransfer.effectAllowed = 'move';
            // Přidání průhlednosti během přetahování
            setTimeout(() => {
                tabElement.style.opacity = '0.6';
            }, 0);
        });
        
        // dragend - když uživatel uvolní záložku nebo přeruší přetahování
        tabElement.addEventListener('dragend', () => {
            tabElement.style.opacity = '1';
            // Odstranit všechny indikátory přetahování
            document.querySelectorAll(`.${CSS_CLASSES.DRAG_OVER}`).forEach(el => {
                el.classList.remove(CSS_CLASSES.DRAG_OVER);
            });
        });
        
        // dragover - když se přetahovaná záložka pohybuje nad jinou záložkou
        tabElement.addEventListener('dragover', (event) => {
            // Prevence výchozího chování, které by zakazovalo drop
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
        });
        
        // dragenter - když přetahovaná záložka vstoupí nad jinou záložku
        tabElement.addEventListener('dragenter', (event) => {
            // Odstraněna kontrola pro nastavení - umožňujeme přetahování na záložku nastavení
            event.preventDefault();
            tabElement.classList.add(CSS_CLASSES.DRAG_OVER);
        });
        
        // dragleave - když přetahovaná záložka opustí jinou záložku
        tabElement.addEventListener('dragleave', () => {
            tabElement.classList.remove(CSS_CLASSES.DRAG_OVER);
        });
        
        // drop - když uživatel upustí přetahovanou záložku na jinou záložku
        tabElement.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedTabId = event.dataTransfer.getData('text/plain');
            console.log(`Dropping tab ${draggedTabId} onto tab ${tabId}`);
            
            // Odstranit třídu pro zvýraznění
            tabElement.classList.remove(CSS_CLASSES.DRAG_OVER);
            
            // Odstraněna kontrola pro nastavení - umožňujeme přetahování na/z záložky nastavení
            
            // Zpracujeme přetažení, pouze pokud jde o dva různé taby
            if (draggedTabId !== tabId) {
                handleTabDragDrop(draggedTabId, tabId);
            }
        });

        tabsContainer.appendChild(tabElement);

        return { tabElement, favicon, titleSpan };
    }

     /**
     * Creates a new webview element for a tab.
     * @param {string} tabId - The unique ID for the tab.
     * @param {string} url - The initial URL to load.
     * @param {boolean} isActive - Whether this webview should be initially visible.
     * @returns {HTMLElement} The created webview element.
     */
     function createWebviewElement(tabId, url, isActive) {
        const webview = document.createElement('webview');
        webview.id = `webview-${tabId}`;
        webview.className = isActive ? CSS_CLASSES.ACTIVE_WEBVIEW : '';
        webview.src = url;

        // --- Přidáno: Připojení specifického preload skriptu pro stránku nastavení --- 
        if (tabId === INTERNAL_PAGES.SETTINGS_ID) {
            // Cesta musí být absolutní nebo relativní k HTML souboru (index.html)
            // __dirname zde nefunguje, protože jsme v renderer procesu
            // Předpokládáme, že preload-settings.js je v src/
            const preloadPathRelative = '../src/preload.js';
            webview.setAttribute('preload', preloadPathRelative);
            console.log(`Attaching preload script for settings: ${preloadPathRelative}`);
        } else {
             // Pro ostatní stránky se možná bude hodit jiný preload nebo žádný,
             // záleží na bezpečnostních požadavcích.
             // webview.setAttribute('preload', '../src/preload.js'); // NEBO
             // webview.removeAttribute('preload');
        }
        // --- Konec přidané části ---

        // Enable node integration if needed for preload scripts, adjust security settings as required
        // webview.setAttribute('nodeintegration', 'true'); // Obecně nedoporučováno
        // webview.setAttribute('contextisolation', 'false'); // Or true if using contextBridge
        webviewContainer.appendChild(webview);
        return webview;
    }

    /**
     * Converts a potential internal page URL to its file path, or formats other inputs.
     * @param {string} input - The raw input string (URL or internal page).
     * @returns {string} A formatted URL or file path.
     */
    const resolveURL = (input) => {
        const trimmedInput = input.trim();
        if (trimmedInput === INTERNAL_PAGES.SETTINGS) {
            // Potřebujeme cestu relativní k rootu aplikace, ne k __dirname
            // Předpokládáme, že main.js je v rootu projektu
            // V renderer procesu je lepší použít relativní cestu nebo absolute path
            // Pro jednoduchost použijeme relativní cestu k index.html
            return `../public/${INTERNAL_PAGES.SETTINGS_FILE}`; 
        }
        return formatURL(trimmedInput); // Použijeme původní funkci pro normální URL
    };

    /**
     * Creates a new tab, including its UI element and webview.
     * @param {string} [url=DEFAULT_URL] - The URL for the new tab.
     * @param {boolean} [activate=true] - Whether to make the new tab active immediately.
     * @returns {string} The ID of the newly created tab.
     */
    const createTab = (url = DEFAULT_URL, activate = true) => {
        const resolvedUrl = resolveURL(url);
        // Použijeme pevné ID pro záložku nastavení
        const tabId = url === INTERNAL_PAGES.SETTINGS ? 
                      INTERNAL_PAGES.SETTINGS_ID : 
                      `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
        console.log(`Creating tab: ${tabId} with URL: ${resolvedUrl} (original: ${url})`);

        // Deactivate current tab if creating a new active one
        if (activate && activeTabId) {
            const currentActive = getActiveTab();
            if (currentActive) {
                currentActive.tabElement.classList.remove(CSS_CLASSES.ACTIVE_TAB);
                currentActive.webview.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
            }
        }

        // 1. Create Webview
        const webview = createWebviewElement(tabId, resolvedUrl, activate);

        // 2. Create Tab Element
        const { tabElement, favicon, titleSpan } = createTabElement(tabId, activate);
        // Nastavení titulku pro interní stránky
        if (url === INTERNAL_PAGES.SETTINGS) {
             titleSpan.textContent = 'Nastavení';
             const encodedSvg = btoa(SETTINGS_ICON_CODE);
             favicon.src = `data:image/svg+xml;base64,${encodedSvg}`; // TODO: Přidat ikonu pro nastavení
             webview.setAttribute('preload', '../src/preload.js');
             // Můžeme skrýt zavírací tlačítko pro stránku nastavení
             // const closeBtn = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);
             // if (closeBtn) closeBtn.style.display = 'none';
        }

        // 3. Store Tab Data
        const newTabData = {
            id: tabId,
            title: url === INTERNAL_PAGES.SETTINGS ? 'Nastavení' : 'New Tab',
            url: url, // Ukládáme původní URL (např. about:settings)
            isLoading: url === INTERNAL_PAGES.SETTINGS ? false : true,
            webview: webview,
            tabElement: tabElement,
            favicon: favicon,
            titleSpan: titleSpan,
        };
        tabs.push(newTabData);

        // 4. Add Webview Event Listeners
        addWebviewListeners(newTabData);

        // 5. Activate if needed
        if (activate) {
            switchToTab(tabId);
        }

        // Scroll the new tab into view
        tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

        return tabId;
    };

    /**
     * Switches the active view to the tab with the given ID.
     * @param {string} tabId - The ID of the tab to switch to.
     */
    const switchToTab = (tabId) => {
        if (!tabId || activeTabId === tabId) {
            return; // No change needed
        }

        const targetTab = tabs.find(t => t.id === tabId);
        if (!targetTab) {
            console.error(`Tab with id ${tabId} not found! Attempting to recover.`);
            // Attempt to switch to the first tab if available
            if (tabs.length > 0) {
                switchToTab(tabs[0].id);
            } else {
                // If no tabs left, reset state (should ideally create a new one)
                activeTabId = null;
                urlInput.value = '';
                updateNavigationButtons();
                console.warn("No tabs left to switch to.");
                 // Optionally, create a new tab here if none exist
                 // createTab(DEFAULT_URL, true);
            }
            return;
        }

        // Deactivate all others
        tabs.forEach(tab => {
            if (tab.id !== tabId) {
                tab.tabElement.classList.remove(CSS_CLASSES.ACTIVE_TAB);
                tab.webview.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
            }
        });

        // Activate the target tab
        targetTab.tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
        targetTab.webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
        activeTabId = tabId;

        // Update UI elements
        urlInput.value = targetTab.webview.getURL() || targetTab.url; // Show current URL or intended URL
        updateNavigationButtons();

        // If mode was URL input, switch back to tabs unless the switch was *triggered* by the tab click itself
         if (isUrlInputMode) {
            // Let handleTabClick manage the mode if it's active
         } else {
             toggleUrlInputMode(false);
         }


        // Focus the webview (with a slight delay)
        setTimeout(() => {
            targetTab.webview.focus();
        }, 100);

        // Ensure the active tab is visible in the tab bar
        targetTab.tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    };

    /**
     * Closes the tab with the given ID.
     * @param {string} tabId - The ID of the tab to close.
     */
    const closeTab = (tabId) => {
        console.log(`Closing tab: ${tabId}`);
        const tabIndex = tabs.findIndex(t => t.id === tabId);
        if (tabIndex === -1) {
            console.warn(`Attempted to close non-existent tab: ${tabId}`);
            return;
        }

        const tabToRemove = tabs[tabIndex];

        // Remove elements from DOM
        tabToRemove.tabElement.remove();
        tabToRemove.webview.remove(); // Important to remove the webview

        // Remove tab data from state
        tabs.splice(tabIndex, 1);

        // If the closed tab was the active one, switch to another tab
        if (activeTabId === tabId) {
            activeTabId = null; // Reset active ID first
            if (tabs.length > 0) {
                // Try to activate the previous tab, or the first tab if it was the first
                const newActiveIndex = Math.max(0, tabIndex - 1);
                switchToTab(tabs[newActiveIndex].id);
            } else {
                // If no tabs are left, create a new default tab
                console.log("Last tab closed, creating a new default tab.");
                createTab(DEFAULT_URL, true);
            }
        }
        // If a non-active tab was closed, no need to switch, just update potentially?
        // (e.g., if state depended on tab count)
    };


    /**
     * Handles clicks on a tab element. Switches to the tab or shows the inline URL input.
     * @param {string} tabId - The ID of the clicked tab.
     */
    function handleTabClick(tabId) {
        const clickedTab = tabs.find(tab => tab.id === tabId);
        if (!clickedTab) return;

        if (tabId === activeTabId) {
            // Kliknuto na již aktivní záložku
            
            // --- Úprava zde: Zabránit editaci URL pro stránku Nastavení ---
            if (tabId === INTERNAL_PAGES.SETTINGS_ID) {
                console.log('Kliknuto na záložku Nastavení - URL nelze editovat');
                // Pro Nastavení nepovolíme editaci URL - pouze zajistíme, že je záložka aktivní
                return;
            }
            
            // Pro ostatní záložky zobrazíme inline editor URL jako dříve
            console.log(`Editing URL for active tab: ${tabId}`);
            showInlineUrlEditor(clickedTab);
        } else {
            // Kliknuto na jinou záložku: přepneme na ni
            switchToTab(tabId);
        }
    }

    /**
     * Creates and manages the inline URL input field within a tab element.
     * @param {object} tabData - The data object for the tab being edited.
     */
    function showInlineUrlEditor(tabData) {
        const { tabElement, webview, url, id } = tabData; // Přidáno id do destructuring

        // If already editing, don't do anything
        if (tabElement.classList.contains('editing-url')) return;

        // Hide existing content (favicon, title, close button)
        const favicon = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);
        const titleSpan = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
        const closeButton = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);

        if (favicon) favicon.style.display = 'none';
        if (titleSpan) titleSpan.style.display = 'none';
        if (closeButton) closeButton.style.display = 'none';

        // Create input field if it doesn't exist
        let tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
        if (!tabInput) {
            tabInput = document.createElement('input');
            tabInput.type = 'text';
            tabInput.className = CSS_CLASSES.TAB_URL_INPUT;
            // Add search icon (optional, similar to image)
            const searchIcon = document.createElement('i');
            searchIcon.className = 'fas fa-search input-search-icon';
            tabElement.prepend(searchIcon);
            tabElement.prepend(tabInput);
        }

        // Kontrola ID místo URL
        if (id === INTERNAL_PAGES.SETTINGS_ID) {
            tabInput.value = INTERNAL_PAGES.SETTINGS; 
        } else {
            // Pro ostatní záložky použijeme aktuální URL z webview, nebo uložené URL jako zálohu
            tabInput.value = webview.getURL() || url; 
        }
        tabInput.style.display = 'block'; // Show input
        tabElement.classList.add('editing-url'); // Mark tab as editing

        // Give it a moment for display change, then focus and select
        setTimeout(() => {
            tabInput.focus();
            tabInput.select();
        }, 10);

        // --- Event listeners for the input field ---
        const handleInput = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const newUrlInput = tabInput.value;
                const resolvedUrl = resolveURL(newUrlInput);
                restoreTabAppearance(tabData);
                // Aktualizovat data tabu s novou *původní* URL, pokud se změnila
                if (newUrlInput !== url) {
                    tabData.url = newUrlInput;
                    // Pokud se změnila z about:settings, aktualizovat i titulek?
                    if (url === INTERNAL_PAGES.SETTINGS && newUrlInput !== url) {
                         // Zde by se měl titulek aktualizovat přes webview listener
                    }
                }
                webview?.loadURL(resolvedUrl);
                webview?.focus();
            } else if (event.key === 'Escape') {
                restoreTabAppearance(tabData);
                webview?.focus();
            }
        };

        const handleBlur = () => {
            // Use a small timeout to allow Enter/Escape keydown to process first
            // and prevent blur hiding the input if clicking inside the input again
            setTimeout(() => {
                // Check if the input still exists and if the document still has focus on it
                if (tabElement.contains(tabInput) && document.activeElement !== tabInput) {
                    restoreTabAppearance(tabData);
                }
            }, 150);
        };

        // Remove previous listeners if any to prevent duplicates
        tabInput.removeEventListener('keydown', handleInput);
        tabInput.removeEventListener('blur', handleBlur);

        // Add new listeners
        tabInput.addEventListener('keydown', handleInput);
        tabInput.addEventListener('blur', handleBlur);
    }

    /**
     * Restores the normal appearance of a tab after editing the URL.
     * @param {object} tabData - The data object for the tab.
     */
    function restoreTabAppearance(tabData) {
        const { tabElement } = tabData;
        const tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
        const searchIcon = tabElement.querySelector('.input-search-icon');
        const favicon = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);
        const titleSpan = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
        const closeButton = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);

        if (tabInput) tabInput.style.display = 'none';
        if (searchIcon) searchIcon.remove(); // Remove search icon
        if (favicon) favicon.style.display = ''; // Use default display
        if (titleSpan) titleSpan.style.display = '';
        if (closeButton) closeButton.style.display = '';

        tabElement.classList.remove('editing-url');
    }

    /**
     * Adds necessary event listeners to a webview element.
     * @param {object} tabData - The data object for the tab whose webview needs listeners.
     */
    const addWebviewListeners = (tabData) => {
        const { webview, titleSpan, favicon, id } = tabData;

        // Helper to update the main URL bar only if this tab is active
        const updateUrlBarIfActive = (url) => {
            if (activeTabId === id && !isUrlInputMode) { // Only update if not in input mode
                urlInput.value = url;
            }
        };

        // --- Webview Event Handlers ---

        webview.addEventListener('page-title-updated', (e) => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) return;
           
            const newTitle = e.title || 'Untitled';
            tabData.title = newTitle;
            titleSpan.textContent = newTitle;
            titleSpan.title = newTitle; // Update tooltip
            console.log(`Tab ${id} title updated: ${newTitle}`);
        });

        webview.addEventListener('page-favicon-updated', (e) => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) {
                console.log(`Tab ${id} is settings page, skipping favicon update`);
                return;
            }
            if (e.favicons && e.favicons.length > 0) {
                setFavicon(id, e.favicons[0]); // Use the first favicon provided
            } else {
                // If no favicon from page, try Google service based on current URL
                setFavicon(id, getFaviconUrl(webview.getURL() || tabData.url));
            }
            // Ensure onerror fallback is still present
            tabData.favicon.onerror = () => { tabData.favicon.src = DEFAULT_FAVICON_SVG; };
        });

        webview.addEventListener('did-start-loading', () => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) return;

          /*   if (!tabData.isLoading) { // Check if not already loading
                console.log(`Tab ${id} started loading`);
                tabData.isLoading = true;
                favicon.src = DEFAULT_FAVICON_SVG; // Show loading indicator/default icon
                titleSpan.textContent = 'Loading...';
                console.log(tabData.isLoading);
                if (activeTabId === id) {
                    updateNavigationButtons(); // Update reload/stop button
                }
            } */
        });

        webview.addEventListener('did-stop-loading', () => {
            if (tabData.isLoading) {
                tabData.isLoading = false; // Vždy nastavit isLoading na false
                if (id === INTERNAL_PAGES.SETTINGS_ID) return; // Ukončit pro settings
                
                // Zbytek logiky pouze pro běžné stránky
                console.log(`Tab ${id} stopped loading`);
                const currentURL = webview.getURL();
                tabData.url = currentURL; // Update stored URL
                if (activeTabId === id) {
                    updateNavigationButtons(); // Update reload/stop button and back/forward
                    updateUrlBarIfActive(currentURL);
                }
            }
        });

        webview.addEventListener('did-fail-load', (e) => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) {
                return;
            }
            console.error(`Tab ${id} failed to load: ${e.errorCode}, ${e.errorDescription}`);
            tabData.isLoading = false;
            // Optionally show an error message in the tab/webview
            titleSpan.textContent = 'Load Failed';
            tabData.title = 'Load Failed';
            if (activeTabId === id) {
                updateNavigationButtons();
            }
            // You could load an internal error page:
            // webview.loadURL(`data:text/html,<h1>Error loading page</h1><p>${e.errorDescription}</p>`);
        });


        webview.addEventListener('did-navigate', (e) => {
            console.log(`Tab ${id} navigated to: ${e.url}`);
            tabData.url = e.url; // Update stored URL
            updateUrlBarIfActive(e.url);
            if (activeTabId === id) {
                updateNavigationButtons();
            }
            if (id === INTERNAL_PAGES.SETTINGS_ID) return;
            // Update favicon based on new URL
            setFavicon(id, getFaviconUrl(e.url));
        });

        // Handles navigation within the same page (e.g., hash changes)
        webview.addEventListener('did-navigate-in-page', (e) => {
            console.log(`Tab ${id} navigated in-page to: ${e.url}`);
            tabData.url = e.url; // Update stored URL
            updateUrlBarIfActive(e.url);
            if (activeTabId === id) {
                updateNavigationButtons(); // History state might change
            }
        });

        // Hide global URL input when webview gains focus
        webview.addEventListener('focus', () => {
            if (isUrlInputMode) {
                toggleUrlInputMode(false);
            }
        });
    };

    /**
     * Zpracovává přetažení záložky a změnu pořadí v poli tabs.
     * @param {string} draggedTabId - ID přetahované záložky
     * @param {string} targetTabId - ID záložky, na kterou bylo přetažení provedeno
     */
    function handleTabDragDrop(draggedTabId, targetTabId) {
        const draggedTabIndex = tabs.findIndex(tab => tab.id === draggedTabId);
        const targetTabIndex = tabs.findIndex(tab => tab.id === targetTabId);
        
        if (draggedTabIndex === -1 || targetTabIndex === -1) {
            console.warn('Neplatné ID záložky při přetahování');
            return;
        }
        
        console.log(`Přesun záložky z indexu ${draggedTabIndex} na index ${targetTabIndex}`);
        
        // Získání přetahované záložky
        const draggedTab = tabs[draggedTabIndex];
        
        // Odstranění přetahované záložky ze současné pozice
        tabs.splice(draggedTabIndex, 1);
        
        // Vložení záložky na novou pozici
        tabs.splice(targetTabIndex, 0, draggedTab);
        
        // Aktualizace pořadí v DOM
        updateTabsOrder();
    }
    
    /**
     * Aktualizuje pořadí záložek v DOM podle pole tabs.
     */
    function updateTabsOrder() {
        // Dočasně odpojíme tabsContainer z DOM pro lepší výkon
        const parent = tabsContainer.parentNode;
        const tempContainer = document.createDocumentFragment();
        
        // Projdeme pole tabs a přesuneme každý tabElement do správného pořadí
        tabs.forEach(tab => {
            // Přesunout tabElement do dočasného kontejneru
            tempContainer.appendChild(tab.tabElement);
        });
        
        // Vyčistíme tabsContainer a vložíme zpět všechny záložky ve správném pořadí
        while (tabsContainer.firstChild) {
            tabsContainer.removeChild(tabsContainer.firstChild);
        }
        
        tabsContainer.appendChild(tempContainer);
        
        // Ujistíme se, že tlačítko pro novou záložku je vždy poslední
        const newTabButton = document.getElementById(ELEMENT_IDS.NEW_TAB_BTN);
        if (newTabButton && newTabButton.parentNode === tabsContainer) {
            tabsContainer.appendChild(newTabButton);
        }
    }

    // --- Global Event Listeners ---

    /**
     * Sets up global event listeners for navigation, URL input, etc.
     */
    function setupGlobalEventListeners() {
        // Navigation Button Listeners
        backButton.addEventListener('click', () => {
            const activeTab = getActiveTab();
            if (activeTab?.webview) {
                activeTab.webview.goBack();
            }
        });

        forwardButton.addEventListener('click', () => {
            const activeTab = getActiveTab();
            if (activeTab?.webview) {
                activeTab.webview.goForward();
            }
        });

        reloadButton.addEventListener('click', () => {
            const activeTab = getActiveTab();
            if (!activeTab?.webview) return;
            
            if (activeTab.url.startsWith('about:')) {
                console.log('Reloading internal page - no action taken.');
                return;
            }
            if (activeTab.isLoading) {
                activeTab.webview.stop();
            } else {
                activeTab.webview.reload();
            }
        });

        homeButton.addEventListener('click', () => {
            const activeTab = getActiveTab();
           
            
            if (activeTab?.webview) {
                // if default url not contains http or https, add it
                if (!DEFAULT_URL.includes('http')) {    
                    
                    DEFAULT_URL = `http://${DEFAULT_URL}`;
                }
                activeTab.webview.loadURL(DEFAULT_URL);
            }
        });

        bookmarkButton.addEventListener('click', () => {
            console.log('Bookmark button clicked');
        });

        searchButton.addEventListener('click', () => {
            console.log('Search button clicked');
        });

        settingsButton.addEventListener('click', () => {
            const existingSettingsTab = getActiveTab()?.id === INTERNAL_PAGES.SETTINGS_ID;
            if (existingSettingsTab) {
                switchToTab(INTERNAL_PAGES.SETTINGS_ID);
            } else {
                createTab(INTERNAL_PAGES.SETTINGS, true);
            }
        });

        // New Tab Button Listener
        newTabButton.addEventListener('click', () => {
            createTab(DEFAULT_URL, true);
        });

        // Listener to hide global URL input when clicking outside
        // Tento listener už asi není relevantní, protože nemáme globální URL input
        /* document.addEventListener('click', (event) => { ... }); */

         // Listener for keyboard shortcuts (e.g., Escape to hide URL input)
         // Tento listener už asi není relevantní
        /* document.addEventListener('keydown', (event) => { ... }); */
    }

    // Add a focus event listener to the window to manage focus state
    window.addEventListener('focus', () => {
        const activeTab = getActiveTab();
        if (activeTab && !activeTab.isLoading) {
            console.log(`Window gained focus, checking active tab: ${activeTab.id}`);
            // Optionally, you can refresh or update the tab here if needed
            // activeTab.webview.reload();
        }
    });

    // --- Hot Reload Handler ---
    if (window.electronAPI) {
        // Dávame do window scope, abychom mohli aktualizovat stylesheets
        window.reloadCSS = () => {
            console.log('Reloading CSS...');
            
            // Aktualizace CSS souborů
            const links = document.querySelectorAll('link[rel="stylesheet"]');
            links.forEach(link => {
                // Přidáme timestamp pro zamezení cachování
                const url = new URL(link.href);
                const originalHref = link.getAttribute('href');
                
                if (originalHref.includes('.css')) {
                    const timestamp = Date.now();
                    const newHref = originalHref.includes('?') 
                        ? `${originalHref}&t=${timestamp}` 
                        : `${originalHref}?t=${timestamp}`;
                    
                    // Vytvořit a nahradit nový link element
                    const newLink = document.createElement('link');
                    newLink.rel = 'stylesheet';
                    newLink.href = newHref;
                    
                    newLink.onload = () => {
                        // Odstranit starý link element až po načtení nového
                        if (link.parentNode) {
                            link.parentNode.removeChild(link);
                        }
                        console.log(`Reloaded CSS: ${originalHref}`);
                    };
                    
                    if (link.parentNode) {
                        link.parentNode.insertBefore(newLink, link.nextSibling);
                    }
                }
            });
        };
        
        // Připojit posluchače událostí z preload skriptu
        document.addEventListener('app-reload', () => {
            window.reloadCSS();
        });
        
        // Když přijde zpráva o hot reloadu z main procesu
        window.electronAPI.onCssReload = (callback) => {
            // Tato funkce by byla propojena z preload.js
            callback();
        };

        // --- Event Listeners pro nastavení ---
        window.electronAPI.onSettingsSaved(async () => {
            console.log('Settings saved, reloading settings in titlebar...');
            await loadDefaultUrl();
        });
    }

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', async () => {
        console.log("DOM fully loaded and parsed.");

        await loadDefaultUrl();

        if (!initializeDOMElements()) {
            console.error("Failed to initialize essential DOM elements. Aborting script.");
            return;
        }

        setupWindowControls();
        setupGlobalEventListeners();

        // Create the initial tab if none exist (e.g., on first load)
        if (tabs.length === 0) {
            // Použijeme aktuálně načtenou hodnotu DEFAULT_URL
            createTab(DEFAULT_URL, true);
        } else {
            // If tabs were somehow restored (e.g., session restore), ensure one is active
            if (!activeTabId && tabs.length > 0) {
                switchToTab(tabs[0].id);
            }
        }
    });

})(); // End of IIFE