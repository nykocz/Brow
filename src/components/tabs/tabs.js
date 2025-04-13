/**
 * tabs.js - Manages browser tabs, webviews, and related data logic.
 * Refactored into a TabManager module.
 */
const TabManager = (() => { // Wrap in IIFE to create a module scope

// --- Constants ---
const CSS_CLASSES = {
        // Only keep classes relevant to webview state if any, or internal logic
    ACTIVE_WEBVIEW: 'active-webview',
        // Maybe add classes used internally if needed
};

const INTERNAL_PAGES = {
    SETTINGS: 'about:settings',
        SETTINGS_FILE: 'public/views/settings/settings.html', // Path relative to root HTML
        SETTINGS_ID: 'settings-tab' // Unique ID for the settings tab
    };

    // Default icons and services
    const DEFAULT_FAVICON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16\"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.188 3.067a6.7 6.7 0 0 1-.597-.933A9.266 9.266 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 3.067zM1.674 8.5H4.167c-.174.782-.282 1.623-.312 2.5a6.958 6.958 0 0 0 .656 2.5H1.674zm10.826-6.933A6.7 6.7 0 0 1 11.36 2.461a9.266 9.266 0 0 1 .64 1.539H13.746a7.024 7.024 0 0 0-3.072-3.067zM8.5 1.077V4h2.855c.138-.386.295-.744.468-1.068.552-1.035 1.218 1.65 1.887-1.855H8.5zm3.655 2.923c.174.782.282 1.623.312 2.5h2.49a6.959 6.959 0 0 0-.656-2.5H12.155zm-.013 3.5c.03.877.138 1.718.312 2.5h2.49a6.959 6.959 0 0 0-.656-2.5H12.142zm.013 3.5c-.03.877-.138 1.718-.312 2.5h2.49a6.958 6.958 0 0 0 .656-2.5H12.155zm3.19 4.933a6.7 6.7 0 0 1-.597.933 9.267 9.267 0 0 1-.64 1.539h1.85a7.024 7.024 0 0 0 3.072-3.067H15.345zm-.738-2.5c.174-.782.282-1.623.312-2.5a6.958 6.958 0 0 0-.656-2.5h2.49z\"/></svg>`;
    const SETTINGS_ICON_CODE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1-11 11.4-22.4 15.8-34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>';
    const GOOGLE_FAVICON_SERVICE = "https://www.google.com/s2/favicons?domain=";
    const FAVICON_SIZE = "&sz=32"; // Request a slightly larger size for better quality

// --- State ---
    let tabs = []; // Array storing tab data objects { id, url, title, webview, faviconUrl, isLoading, canGoBack, canGoForward }
    let activeTabId = null;
    let DEFAULT_URL = 'https://www.google.com'; // Default homepage

    // --- DOM Elements ---
    // We need the webview container to append new webviews
    const webviewContainer = document.getElementById('webview-container');
    // We assume Titlebar handles getting the DOM elements for nav buttons etc.

    // --- Event Emitters/Listeners ---
    // Simple event emitter pattern
    const listeners = {
        'tab-added': [],
        'tab-removed': [],
        'tab-updated': [], // For title, favicon, loading state, url changes
        'tab-activated': [],
        'nav-state-change': [], // Emits { tabId, canGoBack, canGoForward, isLoading }
    };

    function emit(eventName, data) {
        if (listeners[eventName]) {
            listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in listener for ${eventName}:`, error);
                }
            });
        }
    }

    function on(eventName, callback) {
        if (listeners[eventName]) {
            listeners[eventName].push(callback);
        }
    }


    // --- Helper Functions ---\

    /**
     * Gets the tab data object for the currently active tab.
     * @returns {object|null} The active tab data object or null.
     */
const getActiveTab = () => tabs.find(tab => tab.id === activeTabId) || null;

/**
     * Gets a copy of the full tabs array.
     * @returns {Array<object>} A shallow copy of the tabs array.
     */
    const getAllTabs = () => [...tabs];

    /**
     * Gets the default favicon URL.
     * @returns {string}
     */
    const getDefaultFavicon = () => DEFAULT_FAVICON_SVG;

    /**
     * Gets the settings icon SVG code.
     * @returns {string}
     */
    const getSettingsIcon = () => SETTINGS_ICON_CODE;


    /**
     * Loads the default URL from settings via the preload API.
     * Called during initialization and potentially when settings change.
 */
async function loadDefaultUrl() {
    try {
            if (window.electronAPI?.getSettings) {
            const settings = await window.electronAPI.getSettings();
                const oldDefaultUrl = DEFAULT_URL;
                if (settings?.homepage) {
                DEFAULT_URL = settings.homepage;
                     if (oldDefaultUrl !== DEFAULT_URL) {
                         console.log('TabManager: Default URL updated to:', DEFAULT_URL);
                         // Optionally emit an event if components need to react to default URL changes
                     }
                } else {
                    console.warn('TabManager: Homepage setting not found, using current default:', DEFAULT_URL);
                }
            } else {
                console.warn('TabManager: Cannot load settings: getSettings API not available.');
            }
        } catch (error) {
            console.error('TabManager: Error loading default URL from settings:', error);
        }
    }

    /**
     * Generates a URL to fetch a favicon using Google's service or returns default.
     * @param {string} pageUrl - The URL of the page.
     * @returns {string} The URL for the favicon service or the default SVG.
     */
const getFaviconUrl = (pageUrl) => {
    try {
            if (!pageUrl || pageUrl === 'about:blank') {
                return DEFAULT_FAVICON_SVG;
            }
        const url = new URL(pageUrl);
            // Don't fetch favicon for internal pages like settings
            if (url.protocol === 'file:') {
                 // Specific handling for settings page based on ID? No, check URL directly.
                 if (pageUrl.endsWith(INTERNAL_PAGES.SETTINGS_FILE)) {
                    const encodedSvg = btoa(SETTINGS_ICON_CODE);
                    return `data:image/svg+xml;base64,${encodedSvg}`;
                 }
                 return DEFAULT_FAVICON_SVG; // Default for other local files
            }
            // Don't fetch for non-http protocols
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
                return DEFAULT_FAVICON_SVG;
            }
        return `${GOOGLE_FAVICON_SERVICE}${url.hostname}${FAVICON_SIZE}`;
    } catch (e) {
            // console.warn("TabManager: Could not parse URL for favicon:", pageUrl, e);
            return DEFAULT_FAVICON_SVG; // Fallback to default
        }
    };


    /**
     * Applies the current theme to a webview by setting the 'data-theme' attribute on its documentElement.
     * @param {HTMLElement} webview - The <webview> element.
     * @param {string} theme - The theme name ('light' or 'dark').
     */
    function applyThemeToWebview(webview, theme) {
        if (!webview || typeof webview.executeJavaScript !== 'function') {
            return;
        }

        if (!webview.getWebContentsId()) {
            // If webview isn't ready, set up a one-time listener for dom-ready
            webview.addEventListener('dom-ready', () => {
                applyThemeToWebview(webview, theme);
            }, { once: true });
            return;
        }

        const script = `
            try {
                document.documentElement.setAttribute('data-theme', '${theme}');
                true; // Return success
            } catch (e) {
                console.error('Error applying theme:', e);
                false; // Return failure
            }
        `;

        webview.executeJavaScript(script)
            .catch(err => console.error('Failed to execute theme script:', err));
    }

    /**
     * Updates the navigation state (canGoBack, canGoForward, isLoading) for a specific tab
     * and emits an event.
     * @param {string} tabId - The ID of the tab to update.
     */
    function updateTabNavigationState(tabId) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || !tab.webview) return;

        const newState = {
            tabId: tabId,
            canGoBack: tab.webview.canGoBack(),
            canGoForward: tab.webview.canGoForward(),
            isLoading: tab.isLoading,
        };

        // Update tab data if changed (avoids unnecessary updates)
        let changed = false;
        if (tab.canGoBack !== newState.canGoBack) { tab.canGoBack = newState.canGoBack; changed = true; }
        if (tab.canGoForward !== newState.canGoForward) { tab.canGoForward = newState.canGoForward; changed = true; }
        // isLoading is updated directly in start/stop loading events

        // Emit even if only isLoading changed, as nav buttons depend on it
        emit('nav-state-change', newState);

        // Also emit a general tab-updated if back/forward state changed
        if (changed) {
            emit('tab-updated', { id: tabId, changed: { canGoBack: tab.canGoBack, canGoForward: tab.canGoForward } });
        }
    }

    /**
     * Resolves a user-input URL string into a fully qualified URL.
     * Adds 'https://' if no protocol is present.
     * Handles special internal URLs like 'about:settings'.
     * @param {string} inputUrl - The URL string input by the user.
     * @returns {string} A resolved URL string.
     */
    function resolveURL(inputUrl) {
        if (!inputUrl) return DEFAULT_URL;
        let trimmedInput = inputUrl.trim();

        // Handle empty input after trim
        if (!trimmedInput) return DEFAULT_URL;

        // Check for internal pages first
        if (trimmedInput === INTERNAL_PAGES.SETTINGS) {
            // Return the *relative* path expected by webview src
            return `../${INTERNAL_PAGES.SETTINGS_FILE}`;
        }

        // Check if it looks like a file path
        if (trimmedInput.startsWith('file:///')) {
            return trimmedInput; // Assume valid file URL
        }

        // Basic check for protocol
        const hasProtocol = /^[a-z]+:\/\//i.test(trimmedInput);

        if (hasProtocol) {
            // Already has a protocol (http, https, ftp, etc.)
            try {
                 // Validate if it's a known good protocol, otherwise maybe treat as search?
                 // For now, accept any protocol.
                new URL(trimmedInput); // Validate syntax
                return trimmedInput;
            } catch (_) {
                 // Invalid URL syntax even with protocol, treat as search
                 console.warn(`Invalid URL syntax: ${trimmedInput}, treating as search.`);
                 // TODO: Use configured search engine
                 return `https://www.google.com/search?q=${encodeURIComponent(trimmedInput)}`;
            }
        } else {
            // No protocol, determine if it's a domain/IP or search term
            // Improved check: includes a dot OR is localhost OR is IP address
            const isDomainLike = trimmedInput.includes('.') ||
                                trimmedInput.startsWith('localhost') ||
                                /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(trimmedInput);

            if (isDomainLike && !trimmedInput.includes(' ')) {
                // Add protocol - default to https, but maybe http for localhost?
                const protocol = trimmedInput.startsWith('localhost') || trimmedInput.startsWith('127.0.0.1') ? 'http://' : 'https://';
                return `${protocol}${trimmedInput}`;
            } else {
                // Treat as search term
                // TODO: Use configured search engine
                return `https://www.google.com/search?q=${encodeURIComponent(trimmedInput)}`;
            }
        }
    }


    // --- Webview Creation and Event Handling ---

    /**
     * Creates the <webview> element for a tab.
     * @param {string} tabId - The unique ID for the tab.
     * @param {string} url - The initial URL to load (already resolved).
     * @param {boolean} isActive - Whether this webview should be initially visible.
     * @returns {HTMLElement} The created <webview> element.
     */
function createWebviewElement(tabId, url, isActive) {
        if (!webviewContainer) {
            console.error("TabManager: Webview container not found! Cannot create webview.");
            return null;
        }
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.setAttribute('src', url);
        webview.setAttribute('webpreferences', 'contextIsolation=yes'); // Enable context isolation
        // Partition example (uncomment to isolate sessions)
        // webview.setAttribute('partition', `persist:tab_${tabId}`);
        webview.setAttribute('allowpopups', ''); // Allow popups

        // Apply initial theme based on current document theme
        const currentTheme = document.documentElement.dataset.theme || 'light';
        // Apply theme *after* webview is added to DOM and potentially ready
        // applyThemeToWebview(webview, currentTheme); // Moved to event listener

    if (isActive) {
        webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
    }

        // Append to container *before* adding listeners? Does it matter? Usually safe after.
        webviewContainer.appendChild(webview);

    return webview;
}

    /**
     * Sets up standard event listeners for a webview.
     * @param {object} tabData - The data object for the tab (must include webview).
     */
    function setupWebviewEventListeners(tabData) {
        const { webview, id } = tabData;
        if (!webview) return;

        const handleNavigation = (eventUrl) => {
            if (!eventUrl || eventUrl === tabData.url) return; // Avoid redundant updates

            tabData.url = eventUrl;
            const newFavicon = getFaviconUrl(eventUrl);
             let changed = { url: eventUrl };
             if (tabData.faviconUrl !== newFavicon) {
                 tabData.faviconUrl = newFavicon;
                 changed.faviconUrl = newFavicon;
             }
             emit('tab-updated', { id, changed });
             updateTabNavigationState(id);
        };

        // --- Webview Event Handlers ---

         // 'dom-ready' is often a better place to interact with the webview's document
         webview.addEventListener('dom-ready', () => {
             console.log(`TabManager: Webview DOM ready for ${id}`);
             // Apply theme when DOM is ready
             const currentTheme = document.documentElement.dataset.theme || 'light';
             applyThemeToWebview(webview, currentTheme);

             // Inject other necessary scripts or styles here if needed
         });

    webview.addEventListener('page-title-updated', (e) => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) return; // Settings title is static
       
            const newTitle = e.title?.trim() || webview.getURL() || 'Untitled'; // Use URL as fallback
            if (newTitle !== tabData.title) {
        tabData.title = newTitle;
                emit('tab-updated', { id, changed: { title: newTitle } });
            }
    });

    webview.addEventListener('page-favicon-updated', (e) => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) return; // Settings icon is static

            let newFavicon = DEFAULT_FAVICON_SVG; // Default
        if (e.favicons && e.favicons.length > 0) {
                newFavicon = e.favicons[0]; // Use the first one provided
        } else {
                // If page provides none, generate based on URL
                newFavicon = getFaviconUrl(webview.getURL());
            }

            if (newFavicon !== tabData.faviconUrl) {
                tabData.faviconUrl = newFavicon;
                 emit('tab-updated', { id, changed: { faviconUrl: newFavicon } });
            }
    });

    webview.addEventListener('did-start-loading', () => {
            if (id === INTERNAL_PAGES.SETTINGS_ID) return; // Settings doesn't 'load' externally

            if (!tabData.isLoading) {
                // console.log(`TabManager: Tab ${id} started loading`);
        tabData.isLoading = true;
                // Reset favicon/title to loading state? Titlebar can handle this visually.
                // Maybe emit a specific loading state? Yes, via nav-state-change.
                updateTabNavigationState(id); // Updates isLoading and emits nav-state-change
                emit('tab-updated', { id, changed: { isLoading: true } }); // Also emit general update
            }
        });

        webview.addEventListener('did-stop-loading', () => {
            // Always mark as not loading, even for settings (though it shouldn't fire often)
            if (tabData.isLoading) {
                // console.log(`TabManager: Tab ${id} stopped loading`);
                tabData.isLoading = false;
                // Update actual URL and potentially title/favicon if they didn't fire events
                const currentURL = webview.getURL();
                const currentTitle = webview.getTitle() || currentURL || 'Untitled'; // Get current title
                const expectedFavicon = getFaviconUrl(currentURL);

                let changed = { isLoading: false };
                if (tabData.url !== currentURL) { tabData.url = currentURL; changed.url = currentURL; }
                 // Don't update title for settings page here
                if (id !== INTERNAL_PAGES.SETTINGS_ID && tabData.title !== currentTitle) {
                     tabData.title = currentTitle; changed.title = currentTitle;
                 }
                 // Don't update favicon for settings page here
                 if (id !== INTERNAL_PAGES.SETTINGS_ID && tabData.faviconUrl !== expectedFavicon) {
                     tabData.faviconUrl = expectedFavicon; changed.faviconUrl = expectedFavicon;
                 }

                emit('tab-updated', { id, changed });
                updateTabNavigationState(id); // Update back/forward state and emit nav-state-change
            }
        });

        webview.addEventListener('did-fail-load', (e) => {
            // Ignore failures for internal pages or specific error codes if needed
            if (e.isMainFrame && id !== INTERNAL_PAGES.SETTINGS_ID) {
                console.error(`TabManager: Tab ${id} failed to load: ${e.errorCode}, ${e.errorDescription}, URL: ${e.validatedURL}`);
        tabData.isLoading = false;
                tabData.title = 'Load Failed';
                // tabData.url = e.validatedURL; // Keep the URL that failed?
                tabData.faviconUrl = DEFAULT_FAVICON_SVG; // Reset favicon

                let changed = { isLoading: false, title: tabData.title, faviconUrl: tabData.faviconUrl };
                emit('tab-updated', { id, changed });
                updateTabNavigationState(id); // Update nav state

                // Optionally load an internal error page
                // webview.loadURL(`data:text/html,<h1>Error loading page</h1><p>${e.errorDescription}</p>`);
            }
        });

        webview.addEventListener('did-navigate', (e) => {
            // console.log(`Tab ${id} navigated to: ${e.url}`);
             if (e.isMainFrame) { // Only handle main frame navigation here
                 handleNavigation(e.url);
             }
        });

        webview.addEventListener('did-navigate-in-page', (e) => {
            // console.log(`Tab ${id} navigated in-page to: ${e.url}`);
            if (e.isMainFrame) { // Only handle main frame navigation here
                handleNavigation(e.url); // Update URL, favicon, nav state
            }
        });

        // Add listener for IPC messages from preload script (if needed)
        webview.addEventListener('ipc-message', (event) => {
             console.log(`TabManager: IPC message from ${id}:`, event.channel, event.args);
            // Handle messages, e.g., from settings page saving
             if (event.channel === 'settings-saved') {
                 // Reload settings or notify other components
                 loadDefaultUrl();
                 // Forward the event if titlebar or others need to know
                 emit('settings-saved');
             }
        });

        // Handle new window requests (e.g., target="_blank")
        webview.addEventListener('new-window', (e) => {
            console.log(`TabManager: New window requested for ${e.url} from ${id}`);
            e.preventDefault(); // Prevent Electron from opening a new native window
            createTab(e.url, true); // Open in a new tab instead
        });

         // Example: Listening for context menu requests
        webview.addEventListener('context-menu', (params) => {
            // console.log('Context menu requested in webview:', params);
            // Here you could potentially send an IPC message to the main process
            // to show a custom context menu using Menu.buildFromTemplate
            if (window.electronAPI && window.electronAPI.showContextMenu) {
                // Pass relevant info (isEditable, selectionText, srcURL etc.)
                window.electronAPI.showContextMenu({
                    isEditable: params.isEditable,
                    selectionText: params.selectionText,
                    linkURL: params.linkURL,
                    srcURL: params.srcURL,
                    mediaType: params.mediaType,
                     // Add more needed properties
                });
            }
        });


    }

    // --- Public API ---

    /**
     * Creates a new tab with its webview and adds it to the state.
     * @param {string} [urlInput=DEFAULT_URL] - The URL or internal page name to load.
     * @param {boolean} [activate=true] - Whether to make the new tab active immediately.
     * @returns {string|null} The ID of the newly created tab, or null on failure.
     */
    function createTab(urlInput = DEFAULT_URL, activate = true) {
        const resolvedUrl = resolveURL(urlInput);
        const isSettings = urlInput === INTERNAL_PAGES.SETTINGS || resolvedUrl.endsWith(INTERNAL_PAGES.SETTINGS_FILE);
        const tabId = isSettings ?
                  INTERNAL_PAGES.SETTINGS_ID : 
                  `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    
        console.log(`TabManager: Creating tab ${tabId} with resolved URL: ${resolvedUrl} (input: ${urlInput})`);

         // Prevent duplicate settings tab if it already exists
         if (isSettings && tabs.some(tab => tab.id === INTERNAL_PAGES.SETTINGS_ID)) {
             console.log(`TabManager: Settings tab already exists, activating it.`);
             switchToTab(INTERNAL_PAGES.SETTINGS_ID);
             return INTERNAL_PAGES.SETTINGS_ID;
         }


        // Create Webview
    const webview = createWebviewElement(tabId, resolvedUrl, activate);
        if (!webview) return null; // Failed to create webview

        // Assign preload script specifically for settings
         if (isSettings && window.electronAPI?.getSettingsPreloadPath) {
             const preloadPath = window.electronAPI.getSettingsPreloadPath(); // Get path from main via preload
             if (preloadPath) {
                 webview.setAttribute('preload', preloadPath);
                 console.log(`TabManager: Attaching preload script for settings: ${preloadPath}`);
             } else {
                 console.warn('TabManager: Could not get settings preload path.');
             }
         } else {
             // Assign a default preload for other tabs if necessary
             // const defaultPreload = window.electronAPI?.getDefaultPreloadPath();
             // if (defaultPreload) webview.setAttribute('preload', defaultPreload);
             // Ensure contextIsolation is enabled (set in createWebviewElement)
         }

        // Store Tab Data
        const newTabData = {
        id: tabId,
            url: resolvedUrl, // Store the resolved URL initially
            requestedUrl: urlInput, // Store the original request
            title: isSettings ? 'Nastavení' : 'Loading...',
            webview: webview,
            faviconUrl: isSettings ? getFaviconUrl(resolvedUrl) : DEFAULT_FAVICON_SVG, // Use static icon for settings
            isLoading: !isSettings, // Settings page loads locally, assume instantly loaded
            canGoBack: false,
            canGoForward: false,
        };
        tabs.push(newTabData);

        // Add Webview Event Listeners
        setupWebviewEventListeners(newTabData);

        // Emit event
        emit('tab-added', { ...newTabData, webview: undefined }); // Don't emit the webview element itself

        // Activate if needed
    if (activate) {
            switchToTab(tabId);
        } else {
            // Ensure inactive webviews are hidden
             webview.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
    }

    return tabId;
}

    /**
     * Switches the active view to the tab with the given ID.
     * @param {string} tabId - The ID of the tab to switch to.
     */
function switchToTab(tabId) {
        if (!tabId || activeTabId === tabId) {
            return; // No change needed or invalid ID
        }

    const targetTab = tabs.find(t => t.id === tabId);
    if (!targetTab) {
            console.error(`TabManager: Tab with id ${tabId} not found for switching.`);
            // Optionally try to recover or switch to the first tab
            if (tabs.length > 0) {
                switchToTab(tabs[0].id);
            } else {
                 console.warn("TabManager: No tabs left to switch to.");
                 activeTabId = null;
                 emit('tab-activated', { activeTabId: null, previousTabId: activeTabId });
            }
        return;
    }

        const previousTabId = activeTabId;
    activeTabId = tabId;

        // Deactivate all others visually (remove active class)
        tabs.forEach(tab => {
            if (tab.webview) { // Ensure webview exists
                if (tab.id === tabId) {
                    tab.webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
                } else {
                    tab.webview.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
                }
            }
        });

        // Focus the target webview (important for keyboard events)
        // Use setTimeout to ensure rendering completes after class change
    setTimeout(() => {
            targetTab.webview?.focus();
        }, 50); // Short delay

        // Emit activation event
        emit('tab-activated', { activeTabId, previousTabId });

        // Update navigation state for the newly active tab
        updateTabNavigationState(activeTabId);
    }

    /**
     * Closes the tab with the given ID.
     * @param {string} tabId - The ID of the tab to close.
     */
function closeTab(tabId) {
         if (!tabId) return;
         // Prevent closing the settings tab? Or handle differently?
         // if (tabId === INTERNAL_PAGES.SETTINGS_ID) {
         //     console.log("TabManager: Closing settings tab is disallowed.");
         //     return;
         // }

        console.log(`TabManager: Closing tab ${tabId}`);
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) {
            console.warn(`TabManager: Attempted to close non-existent tab: ${tabId}`);
        return;
    }

    const tabToRemove = tabs[tabIndex];

        // Remove webview element from DOM
        tabToRemove.webview?.remove();

        // Remove tab data from state
    tabs.splice(tabIndex, 1);

        // Emit removal event before potentially switching tabs
        emit('tab-removed', { tabId });

        // If the closed tab was the active one, switch to another tab
    if (activeTabId === tabId) {
            activeTabId = null; // Reset active ID first
        if (tabs.length > 0) {
                // Activate the previous tab if possible, otherwise the first
            const newActiveIndex = Math.max(0, tabIndex - 1);
            switchToTab(tabs[newActiveIndex].id);
        } else {
                // Last tab closed, potentially create a new one or emit an event
                console.log("TabManager: Last tab closed.");
                emit('tab-activated', { activeTabId: null, previousTabId: tabId }); // Notify UI no tab is active
                // Maybe create a new default tab automatically?
                 // createTab(DEFAULT_URL, true);
            }
        }
        // If a non-active tab was closed, activeTabId remains the same, no switch needed.
    }

    /**
     * Updates the URL of an existing tab and initiates navigation.
     * @param {string} tabId - The ID of the tab to update.
     * @param {string} urlInput - The new URL or search term entered by the user.
     */
    function navigateTab(tabId, urlInput) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab || !tab.webview) {
            console.error(`TabManager: Cannot navigate tab ${tabId}, not found or no webview.`);
            return;
        }

        // Prevent navigation for settings tab?
        if (tabId === INTERNAL_PAGES.SETTINGS_ID) {
             console.warn(`TabManager: Navigation is disabled for the settings tab.`);
             // Maybe just switch to it if it's the requested URL?
             if (urlInput === INTERNAL_PAGES.SETTINGS) {
                 switchToTab(tabId);
             }
             return;
         }


        const resolvedUrl = resolveURL(urlInput);
        console.log(`TabManager: Navigating tab ${tabId} to ${resolvedUrl} (input: ${urlInput})`);

        // Update requested URL immediately
        tab.requestedUrl = urlInput;

        // Check if the resolved URL is different from the current one before loading
        // This check might be problematic with redirects, but prevents unnecessary reloads
        // if (tab.webview.getURL() !== resolvedUrl) {
             tab.webview.loadURL(resolvedUrl);
        // } else {
             // console.log(`TabManager: Target URL ${resolvedUrl} is the same as current, not reloading.`);
             // Even if same URL, update internal state and emit?
             // tab.url = resolvedUrl; // Ensure internal state matches
             // emit('tab-updated', { id: tabId, changed: { url: resolvedUrl, requestedUrl: urlInput } });
             // updateTabNavigationState(tabId);
        // }
    }

    /**
      * Reloads the specified tab.
      * @param {string} tabId - The ID of the tab to reload.
      * @param {boolean} [ignoreCache=false] - Whether to bypass the cache.
      */
     function reloadTab(tabId, ignoreCache = false) {
         const tab = tabs.find(t => t.id === tabId);
         if (!tab || !tab.webview) return;

         if (tab.isLoading) {
             console.log(`TabManager: Stopping load for tab ${tabId}`);
             tab.webview.stop();
         } else {
             console.log(`TabManager: Reloading tab ${tabId} (ignoreCache: ${ignoreCache})`);
             if (ignoreCache) {
                 tab.webview.reloadIgnoringCache();
             } else {
                 tab.webview.reload();
             }
         }
         // State update (isLoading) will be handled by did-start/stop-loading events
     }

     /**
      * Navigates the specified tab back in history.
      * @param {string} tabId - The ID of the tab.
      */
     function goBack(tabId) {
         const tab = tabs.find(t => t.id === tabId);
         if (tab?.webview?.canGoBack()) {
             tab.webview.goBack();
             // Nav state update handled by did-navigate event
         }
     }

     /**
      * Navigates the specified tab forward in history.
      * @param {string} tabId - The ID of the tab.
      */
     function goForward(tabId) {
         const tab = tabs.find(t => t.id === tabId);
         if (tab?.webview?.canGoForward()) {
             tab.webview.goForward();
             // Nav state update handled by did-navigate event
         }
     }

     /**
      * Navigates the specified tab to the default homepage.
      * @param {string} tabId - The ID of the tab.
      */
      function goHome(tabId) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;
        // Use navigateTab to ensure URL resolution and event handling
        navigateTab(tabId, DEFAULT_URL);
    }

    /**
      * Updates the theme for all existing webviews.
      * @param {string} newTheme - The theme name ('light' or 'dark').
      */
     function updateAllWebviewsTheme(newTheme) {
         console.log(`TabManager: Updating theme for all webviews to ${newTheme}`);
         tabs.forEach(tab => {
             if (tab.webview) {
                 applyThemeToWebview(tab.webview, newTheme);
             }
         });
     }

     /**
     * Updates the order of tabs in the internal state array based on visual reordering.
     * Assumes the UI layer (titlebar) handles the drag/drop visually and then calls this.
     * @param {Array<string>} orderedTabIds - An array of tab IDs in the new desired order.
     */
    function updateTabOrder(orderedTabIds) {
        if (!Array.isArray(orderedTabIds)) {
            console.error('TabManager: updateTabOrder expects an array of IDs.');
            return;
        }

        const newTabs = [];
        const currentTabsMap = new Map(tabs.map(tab => [tab.id, tab]));
        let changed = false;

        orderedTabIds.forEach(id => {
            const tab = currentTabsMap.get(id);
            if (tab) {
                newTabs.push(tab);
            } else {
                console.warn(`TabManager: Tab ID ${id} provided in new order not found.`);
            }
        });

        // Basic check if order actually changed
        if (newTabs.length !== tabs.length || !newTabs.every((tab, index) => tab.id === tabs[index]?.id)) {
            changed = true;
            tabs = newTabs;
            console.log('TabManager: Tab order updated.');
             // Emit an event indicating the order changed? UI might need this.
             // emit('tab-order-updated', { orderedIds: orderedTabIds });
        }

        if (!changed) {
            console.log('TabManager: Tab order unchanged.');
        }
    }


    /**
     * Initializes the TabManager, loads settings, and potentially creates the first tab.
     * Should be called once on startup.
     */
    async function initialize() {
        console.log("TabManager: Initializing...");
        await loadDefaultUrl(); // Load default URL from settings

        // Listen for settings changes from main process via preload
        if (window.electronAPI?.onSettingsSaved) {
            window.electronAPI.onSettingsSaved(async () => {
                console.log('TabManager: Received settings-saved notification.');
                await loadDefaultUrl();
                // Potentially notify UI components if needed
            });
        }
         // Listen for theme changes
         if (window.electronAPI?.onThemeChanged) {
             window.electronAPI.onThemeChanged((theme) => {
                 updateAllWebviewsTheme(theme);
             });
         }

        // Ensure webview container exists
        if (!webviewContainer) {
             console.error("TabManager FATAL: Webview container element not found during initialization!");
             // Cannot proceed without the container
             return;
         }

        // Example: Create initial tab if none exist (maybe Titlebar decides this?)
        // if (tabs.length === 0) {
        //     createTab(DEFAULT_URL, true);
        // }
         console.log("TabManager: Initialized.");
    }


    // --- Public API exposed ---
    return {
        initialize,
    createTab,
        closeTab,
    switchToTab,
        navigateTab, // Use this instead of directly manipulating webview.loadURL from outside
        reloadTab,
        goBack,
        goForward,
        goHome,
    getActiveTab,
        getAllTabs,
        getDefaultFavicon, // For titlebar to display
        getSettingsIcon,   // For titlebar to display
        updateTabOrder, // Allow titlebar to report new order after D&D
        on, // Allow other modules to listen for events
        // Expose internal pages info if needed by UI?
        INTERNAL_PAGES: { ...INTERNAL_PAGES },
        // Maybe expose resolveURL if titlebar needs it for suggestions?
        resolveURL,
    };

})(); // End of IIFE

// Make TabManager globally accessible
window.TabManager = TabManager;

// --- Initialization Call ---
document.addEventListener('DOMContentLoaded', () => {
    TabManager.initialize();
});

// Ensure tabs have a visible background and border in light mode
const tabsContainer = document.getElementById('tabs-container');

if (tabsContainer) {
    const observer = new MutationObserver(() => {
        const tabs = tabsContainer.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.style.backgroundColor = 'var(--tab-bg, #f3f3f3)'; // Light background
            tab.style.border = '1px solid var(--tab-border, #e0e0e0)'; // Light border
        });
    });

    observer.observe(tabsContainer, { childList: true, subtree: true });
}
