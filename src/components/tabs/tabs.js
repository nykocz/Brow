/**
 * tabs.js - Manages browser tabs, webviews, and related UI elements.
 */

// --- Constants ---
const CSS_CLASSES = {
    ACTIVE_TAB: 'active-tab',
    ACTIVE_WEBVIEW: 'active-webview',
    TAB_ITEM: 'tab-item',
    TAB_FAVICON: 'tab-favicon',
    TAB_TITLE: 'tab-title',
    CLOSE_TAB_BTN: 'close-tab-button',
    TAB_URL_INPUT: 'tab-url-input',
    DRAG_OVER: 'tab-drag-over', // Used for drag & drop styling
    IS_LOADING: 'is-loading',   // Added for loading state styling
    IS_EDITING: 'editing-url',  // Added for URL editing state
};

const INTERNAL_PAGES = {
    SETTINGS: 'about:settings',
    SETTINGS_FILE: 'views/settings/settings.html',
    SETTINGS_ID: 'settings-tab' // Unique ID for the settings tab
};

// Default icons and services
const DEFAULT_FAVICON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.188 3.067a6.7 6.7 0 0 1-.597-.933A9.266 9.266 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 3.067zM1.674 8.5H4.167c-.174.782-.282 1.623-.312 2.5a6.958 6.958 0 0 0 .656 2.5H1.674zm10.826-6.933A6.7 6.7 0 0 1 11.36 2.461a9.266 9.266 0 0 1 .64 1.539H13.746a7.024 7.024 0 0 0-3.072-3.067zM8.5 1.077V4h2.855c.138-.386.295-.744.468-1.068.552-1.035 1.218-1.65 1.887-1.855H8.5zm3.655 2.923c.174.782.282 1.623.312 2.5h2.49a6.959 6.959 0 0 0-.656-2.5H12.155zm-.013 3.5c.03.877.138 1.718.312 2.5h2.49a6.959 6.959 0 0 0-.656-2.5H12.142zm.013 3.5c-.03.877-.138 1.718-.312 2.5h2.49a6.958 6.958 0 0 0 .656-2.5H12.155zm3.19 4.933a6.7 6.7 0 0 1-.597.933 9.267 9.267 0 0 1-.64 1.539h1.85a7.024 7.024 0 0 0 3.072-3.067H15.345zm-.738-2.5c.174-.782.282-1.623.312-2.5a6.958 6.958 0 0 0-.656-2.5h2.49z"/></svg>`;
const SETTINGS_ICON_CODE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>';
const GOOGLE_FAVICON_SERVICE = "https://www.google.com/s2/favicons?domain=";
const FAVICON_SIZE = "&sz=32"; // Request a slightly larger size for better quality

// --- State ---
let tabs = []; // Array storing tab data objects { id, url, title, tabElement, webview, favicon, titleSpan, isLoading, isEditing }
let activeTabId = null;
let DEFAULT_URL = 'https://www.google.com'; // Default homepage

// --- DOM Elements ---
const tabsContainer = document.getElementById('tabs-container');
const webviewContainer = document.getElementById('webview-container');
const backButton = document.getElementById('back-button');
const forwardButton = document.getElementById('forward-button');
const reloadButton = document.getElementById('reload-button');
// Ensure title bar elements are also accessible if needed elsewhere

// --- Helper Functions ---

/**
 * Gets the tab data object for the currently active tab.
 * @returns {object|null} The active tab data object or null.
 */
const getActiveTab = () => tabs.find(tab => tab.id === activeTabId) || null;

/**
 * Loads the default URL from settings via the preload API.
 * Also called initially.
 */
async function loadDefaultUrl() {
    try {
        if (window.electronAPI?.getSettings) {
            const settings = await window.electronAPI.getSettings();
            if (settings?.homepage) {
                // Update the module-level DEFAULT_URL variable
                DEFAULT_URL = settings.homepage;
                console.log('TabManager: Default URL updated to:', DEFAULT_URL);
            } else {
                console.warn('TabManager: Homepage setting not found, using default:', DEFAULT_URL);
            }
        } else {
            console.warn('TabManager: Cannot load settings: getSettings API not available.');
        }
    } catch (error) {
        console.error('TabManager: Error loading default URL from settings:', error);
    }
}

/**
 * Sets the favicon source for a given tab element.
 * Handles errors by setting the default favicon.
 * @param {HTMLElement} faviconElement - The <img> element for the favicon.
 * @param {string} faviconUrl - The URL of the favicon to set.
 */
function setFaviconSrc(faviconElement, faviconUrl) {
    if (!faviconElement) return;
    faviconElement.src = faviconUrl || DEFAULT_FAVICON_SVG;
    faviconElement.onerror = () => {
        if (faviconElement.src !== DEFAULT_FAVICON_SVG) {
            console.warn('Favicon failed to load, setting default:', faviconUrl);
            faviconElement.src = DEFAULT_FAVICON_SVG;
        }
        faviconElement.onerror = null; // Prevent infinite loops if default fails
    };
}

/**
 * Applies the current theme to a webview by setting the 'data-theme' attribute on its documentElement.
 * @param {HTMLElement} webview - The <webview> element.
 * @param {string} theme - The theme name ('light' or 'dark').
 */
function applyThemeToWebview(webview, theme) {
    if (!webview || typeof webview.executeJavaScript !== 'function') {
        // console.error('Invalid webview object passed to applyThemeToWebview'); // Keep this less noisy
        return;
    }
    const webviewId = webview.id || 'unknown-id'; // Get webview ID for logging
    const script = `document.documentElement.setAttribute('data-theme', '${theme}');`;
    console.log(`Tabs: Attempting to apply theme '${theme}' to webview ${webviewId}`); // Log attempt
    webview.executeJavaScript(script)
        .then(() => { console.log(`Tabs: Theme '${theme}' script executed successfully in webview ${webviewId}`); }) // Log success
        .catch(err => { console.error(`Tabs: Failed to apply theme '${theme}' to webview ${webviewId}:`, err); }); // Log error
}

/**
 * Updates the enabled/disabled state of the back/forward navigation buttons
 * based on the active webview's navigation history.
 */
function updateNavigationState() {
    const activeTab = getActiveTab();
    const webview = activeTab?.webview;

    const canGoBack = webview?.canGoBack() ?? false;
    const canGoForward = webview?.canGoForward() ?? false;

    if (backButton) backButton.disabled = !canGoBack;
    if (forwardButton) forwardButton.disabled = !canGoForward;
}

/**
 * Updates the visual state of the reload button (reload vs. stop icon).
 * @param {boolean} isLoading - Whether the active tab is currently loading.
 */
function updateReloadButtonState(isLoading) {
    if (!reloadButton) return;
    const icon = reloadButton.querySelector('i'); // Assuming Font Awesome used
    if (icon) {
        icon.classList.toggle('fa-redo', !isLoading); // Show reload if NOT loading
        icon.classList.toggle('fa-times', isLoading); // Show stop if loading
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
    inputUrl = inputUrl.trim();

    if (inputUrl === INTERNAL_PAGES.SETTINGS) {
        // Construct file path relative to the root HTML file
        // Assuming index.html is in 'public/' and settings is in 'public/views/settings/'
        return INTERNAL_PAGES.SETTINGS_FILE;
    }

    try {
        // Check if it's already a valid URL (including file://)
        new URL(inputUrl);
        return inputUrl;
    } catch (_) {
        // Not a valid URL, try adding protocol or treating as search
        if (inputUrl.includes('.') && !inputUrl.includes(' ')) {
             // Looks like a domain name, add https://
            return `https://${inputUrl}`;
        } else if (inputUrl.startsWith('localhost:')) {
            // Common local dev pattern, add http://
            return `http://${inputUrl}`;
        }
         else {
            // Assume it's a search query for the default search engine
            // TODO: Implement search engine logic if needed
            console.warn('Search functionality not implemented, loading as URL:', inputUrl);
             // For now, attempt to load it as is, or default? Let's try adding https as a guess
             return `https://${inputUrl}`; // Or return a search URL: `https://www.google.com/search?q=${encodeURIComponent(inputUrl)}`
        }
    }
}

// --- Tab Element Creation and Handling ---

/**
 * Creates the DOM elements for a tab (the clickable item in the tab bar).
 * @param {string} tabId - The unique ID for the tab.
 * @param {boolean} isActive - Whether this tab should be initially active.
 * @returns {{tabElement: HTMLElement, favicon: HTMLElement, titleSpan: HTMLElement}}
 */
function createTabElement(tabId, isActive) {
    const tabElement = document.createElement('div');
    tabElement.id = tabId;
    tabElement.classList.add(CSS_CLASSES.TAB_ITEM);
    if (isActive) tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
    tabElement.dataset.tabId = tabId;
    tabElement.draggable = true; // Enable dragging

    const favicon = document.createElement('img'); // Using <img> for easier src setting
    favicon.classList.add(CSS_CLASSES.TAB_FAVICON);
    setFaviconSrc(favicon, DEFAULT_FAVICON_SVG); // Set default initially

    const titleSpan = document.createElement('span');
    titleSpan.classList.add(CSS_CLASSES.TAB_TITLE);
    titleSpan.textContent = 'New Tab'; // Default title
    titleSpan.title = 'New Tab'; // Tooltip

    const closeButton = document.createElement('button');
    closeButton.classList.add(CSS_CLASSES.CLOSE_TAB_BTN);
    closeButton.innerHTML = '&times;'; // Simple 'x'
    closeButton.title = 'Close Tab';
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent tab click event
        closeTab(tabId);
    });

    tabElement.appendChild(favicon);
    tabElement.appendChild(titleSpan);
    tabElement.appendChild(closeButton);

    // Click listener for switching or initiating edit
    tabElement.addEventListener('click', () => handleTabClick(tabId));

    // Add drag and drop listeners (example structure)
    addDragAndDropListeners(tabElement);

    return { tabElement, favicon, titleSpan };
}

/**
 * Creates the <webview> element for a tab.
 * @param {string} tabId - The unique ID for the tab.
 * @param {string} url - The initial URL to load.
 * @param {boolean} isActive - Whether this webview should be initially active.
 * @returns {HTMLElement} The created <webview> element.
 */
function createWebviewElement(tabId, url, isActive) {
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.setAttribute('src', url);
    // webview.setAttribute('webpreferences', 'contextIsolation=yes'); // This attribute doesn't work directly. Context isolation is inherited.
    // webview.setAttribute('partition', `persist:tab_${tabId}`); // Example: Isolate session/storage per tab
    // webview.setAttribute('allowpopups', ''); // Allow popups if needed

    // Apply initial theme
    const currentTheme = document.documentElement.dataset.theme || 'light';
    applyThemeToWebview(webview, currentTheme); // Apply theme before DOM is ready (might be reapplied on dom-ready)

    if (isActive) {
        webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
    }
    return webview;
}

/**
 * Sets up standard event listeners for a webview.
 * @param {object} tabData - The tab data object containing the webview and other elements.
 */
function setupWebviewEventListeners(tabData) {
    const { webview, titleSpan, favicon, id } = tabData;

    webview.addEventListener('page-title-updated', (e) => {
        if (id === INTERNAL_PAGES.SETTINGS_ID) return; // Don't update title for settings tab

        const newTitle = e.title?.trim() || 'Untitled';
        tabData.title = newTitle;
        if (titleSpan) {
            titleSpan.textContent = newTitle;
            titleSpan.title = newTitle; // Update tooltip
        }
        console.log(`Tab ${id} title updated: ${newTitle}`);
    });

    webview.addEventListener('page-favicon-updated', (e) => {
        if (id === INTERNAL_PAGES.SETTINGS_ID) return; // Settings tab uses fixed icon

        const newFavicon = e.favicons?.[0]; // Get the first favicon URL
        setFaviconSrc(favicon, newFavicon); // Use helper to set src and handle errors
        console.log(`Tab ${id} favicon updated: ${newFavicon || 'none found'}`);
    });

    webview.addEventListener('did-start-loading', () => {
        tabData.isLoading = true;
        tabData.tabElement?.classList.add(CSS_CLASSES.IS_LOADING);
        if (id === activeTabId) {
            updateReloadButtonState(true);
        }
    });

    webview.addEventListener('did-stop-loading', () => {
        tabData.isLoading = false;
        tabData.tabElement?.classList.remove(CSS_CLASSES.IS_LOADING);
        if (id === activeTabId) {
            updateReloadButtonState(false);
            updateNavigationState(); // Update nav buttons after load stops
            // Re-apply theme as some pages might reset attributes on load
            applyThemeToWebview(webview, document.documentElement.dataset.theme || 'light');
        }
    });

    webview.addEventListener('dom-ready', () => {
         // Apply theme when DOM is ready, ensures it's set even if initial attempt failed
         applyThemeToWebview(webview, document.documentElement.dataset.theme || 'light');
          if (id === activeTabId) {
             updateNavigationState(); // Initial nav state
         }
    });

    // Update navigation state on any navigation event
    webview.addEventListener('did-navigate', updateNavigationState);
    webview.addEventListener('did-navigate-in-page', updateNavigationState);

    // Handle new window requests (e.g., target="_blank")
    webview.addEventListener('new-window', (e) => {
        console.log('New window requested:', e.url);
        e.preventDefault(); // Prevent Electron from creating a new OS window
        createTab(e.url, true); // Open in a new tab instead
    });

     // Handle console messages from webview (optional, for debugging)
     webview.addEventListener('console-message', (e) => {
         console.log(`[Webview ${id}] L${e.line}: ${e.message} (Source: ${e.sourceId})`);
     });
}

// --- Inline URL Editing ---

/**
 * Handles clicks on a tab element. Switches to the tab or initiates URL editing if already active.
 * @param {string} tabId - The ID of the clicked tab.
 */
function handleTabClick(tabId) {
    const tabData = tabs.find(t => t.id === tabId);
    if (!tabData || tabData.isEditing) return; // Ignore clicks if not found or already editing

    if (activeTabId === tabId) {
        showInlineUrlEditor(tabData);
    } else {
        switchToTab(tabId);
    }
}

/**
 * Replaces the tab title/favicon with an input field for editing the URL.
 * @param {object} tabData - The data object for the tab to edit.
 */
function showInlineUrlEditor(tabData) {
    const { tabElement, webview, url, id } = tabData;
    if (!tabElement || tabData.isEditing) return; // Prevent re-entry

    console.log(`Editing URL for tab: ${id}`);
    tabData.isEditing = true;
    tabElement.classList.add(CSS_CLASSES.IS_EDITING);

    // Hide original content
    const faviconEl = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);
    const titleSpanEl = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
    const closeBtnEl = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);
    if (faviconEl) faviconEl.style.display = 'none';
    if (titleSpanEl) titleSpanEl.style.display = 'none';
    if (closeBtnEl) closeBtnEl.style.display = 'none';

    // Create or reveal input field
    let tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
    if (!tabInput) {
        tabInput = document.createElement('input');
        tabInput.type = 'text';
        tabInput.classList.add(CSS_CLASSES.TAB_URL_INPUT);
        tabElement.appendChild(tabInput); // Append inside the tab element
    }

    tabInput.value = (id === INTERNAL_PAGES.SETTINGS_ID) ? INTERNAL_PAGES.SETTINGS : (webview?.getURL() || url || ''); // Show current URL or original
    tabInput.style.display = 'block';

    // Focus and select text
    setTimeout(() => {
        tabInput.focus();
        tabInput.select();
    }, 10); // Small delay ensures focus works reliably

    // Event handlers for the input field
    const handleInput = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const newUrlInput = tabInput.value;
            restoreTabAppearance(tabData); // Restore appearance first
            const resolvedUrl = resolveURL(newUrlInput);
            tabData.url = resolvedUrl; // Update stored URL
            webview?.loadURL(resolvedUrl); // Load the new URL
            webview?.focus(); // Focus webview content
        } else if (event.key === 'Escape') {
            restoreTabAppearance(tabData);
            webview?.focus();
        }
    };

    const handleBlur = () => {
        // Use setTimeout to allow click events on other elements to register before restoring
        setTimeout(() => {
            // Check if focus is still within the tab or input before restoring
            if (tabData.isEditing && document.activeElement !== tabInput) {
                 restoreTabAppearance(tabData);
            }
        }, 150);
    };

    // Add listeners (remove previous ones if any, though should be cleaned up by restoreTabAppearance)
    tabInput.addEventListener('keydown', handleInput);
    tabInput.addEventListener('blur', handleBlur);

    // Store handlers to remove them later in restoreTabAppearance
    tabData.inputHandlers = { handleInput, handleBlur };
}

/**
 * Restores the original appearance of a tab after URL editing is finished or cancelled.
 * @param {object} tabData - The data object for the tab.
 */
function restoreTabAppearance(tabData) {
    if (!tabData.isEditing) return; // Only restore if editing

    const { tabElement } = tabData;
    const tabInput = tabElement?.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);

    console.log(`Restoring appearance for tab: ${tabData.id}`);

    // Remove input listeners
    if (tabInput && tabData.inputHandlers) {
        tabInput.removeEventListener('keydown', tabData.inputHandlers.handleInput);
        tabInput.removeEventListener('blur', tabData.inputHandlers.handleBlur);
        tabData.inputHandlers = null; // Clear stored handlers
    }

    // Hide input
    if (tabInput) {
        tabInput.style.display = 'none';
    }

    // Show original elements
    const faviconEl = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);
    const titleSpanEl = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
    const closeBtnEl = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);
    if (faviconEl) faviconEl.style.display = '';
    if (titleSpanEl) titleSpanEl.style.display = '';
    if (closeBtnEl) closeBtnEl.style.display = '';

    tabElement.classList.remove(CSS_CLASSES.IS_EDITING);
    tabData.isEditing = false;
}


// --- Tab Management Core Functions ---

/**
 * Creates a new tab and its associated webview.
 * Uses the current module-level DEFAULT_URL.
 * @param {string} [url] - The URL to load. Defaults to the current DEFAULT_URL if undefined.
 * @param {boolean} [activate=true] - Whether to make the new tab active immediately.
 * @returns {string} The ID of the newly created tab.
 */
function createTab(url, activate = true) {
    // Use the module-level DEFAULT_URL if no specific URL is provided
    const targetUrl = url === undefined ? DEFAULT_URL : url;

    const isSettings = (targetUrl === INTERNAL_PAGES.SETTINGS);
    const resolvedUrl = resolveURL(targetUrl); // Resolve the final URL
    const tabId = isSettings ? INTERNAL_PAGES.SETTINGS_ID : `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    console.log(`TabManager: Creating tab ${tabId} with URL: ${resolvedUrl} (original request: ${url}, default was: ${DEFAULT_URL})`);

    // Deactivate current active tab if creating a new active one
    if (activate && activeTabId) {
        const currentActive = getActiveTab();
        currentActive?.tabElement?.classList.remove(CSS_CLASSES.ACTIVE_TAB);
        currentActive?.webview?.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
    }

    // Create DOM elements
    const { tabElement, favicon, titleSpan } = createTabElement(tabId, activate);
    const webview = createWebviewElement(tabId, resolvedUrl, activate);

    // Special handling for settings tab
    if (isSettings) {
        titleSpan.textContent = 'Settings';
        const encodedSvg = btoa(SETTINGS_ICON_CODE); // Encode SVG for data URL
        setFaviconSrc(favicon, `data:image/svg+xml;base64,${encodedSvg}`);
        // If settings page needs its own preload script:
        // webview.setAttribute('preload', `file://${path.join(__dirname, 'path/to/settings_preload.js')}`);
    }

    // Store tab data
    const tabData = {
        id: tabId,
        url: targetUrl, // Store the URL it was created with
        title: isSettings ? 'Settings' : 'New Tab',
        tabElement,
        webview,
        favicon,
        titleSpan,
        isLoading: false,
        isEditing: false,
        inputHandlers: null // To store temporary input listeners
    };

    // Add elements to the DOM
    tabsContainer?.appendChild(tabElement);
    webviewContainer?.appendChild(webview);

    // Add to state array
    tabs.push(tabData);

    // Set up webview event listeners
    setupWebviewEventListeners(tabData);

    // Set as active if requested
    if (activate) {
        switchToTab(tabId); // Use switchToTab to handle activation logic
    }

     // Scroll tab bar if needed
     tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

    return tabId;
}

/**
 * Switches the active tab to the one specified by tabId.
 * @param {string} tabId - The ID of the tab to activate.
 */
function switchToTab(tabId) {
    const targetTab = tabs.find(t => t.id === tabId);
    if (!targetTab || activeTabId === tabId) {
        // Do nothing if target not found or already active
        if (!targetTab) console.warn(`Attempted to switch to non-existent tab: ${tabId}`);
        return;
    }
    console.log(`Switching to tab: ${tabId}`);

    // Deactivate current tab
    const currentTab = getActiveTab();
    currentTab?.tabElement?.classList.remove(CSS_CLASSES.ACTIVE_TAB);
    currentTab?.webview?.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
    // If URL editing was active on the previous tab, cancel it
    if (currentTab?.isEditing) {
        restoreTabAppearance(currentTab);
    }

    // Activate target tab
    targetTab.tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
    targetTab.webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
    activeTabId = tabId;

    // Update navigation state for the new active tab
    updateNavigationState();
    updateReloadButtonState(targetTab.isLoading);

    // Focus the webview content after a short delay
    setTimeout(() => targetTab.webview?.focus(), 50);

    // Ensure the active tab is visible in the tab bar
    targetTab.tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

/**
 * Closes the specified tab and removes its elements.
 * Activates the previous tab or creates a new one if the last tab is closed.
 * @param {string} tabId - The ID of the tab to close.
 */
function closeTab(tabId) {
    console.log(`Closing tab: ${tabId}`);
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) {
        console.warn(`Attempted to close non-existent tab: ${tabId}`);
        return;
    }

    const tabToRemove = tabs[tabIndex];

    // Remove elements from DOM
    tabToRemove.tabElement?.remove();
    tabToRemove.webview?.remove(); // Important: remove webview to free resources

    // Remove from state
    tabs.splice(tabIndex, 1);

    // Handle activation of the next tab
    if (activeTabId === tabId) {
        activeTabId = null; // Clear active ID
        if (tabs.length > 0) {
            // Activate the previous tab, or the first tab if the closed one was first
            const newActiveIndex = Math.max(0, tabIndex - 1);
            switchToTab(tabs[newActiveIndex].id);
        } else {
            // Last tab was closed, create a new default tab
            console.log("Last tab closed, creating a new default tab.");
            createTab(DEFAULT_URL, true);
        }
    }
    // If a non-active tab was closed, no need to change activeTabId
}

// --- Drag and Drop Logic (Basic Structure) ---
let draggedTab = null;

function addDragAndDropListeners(tabElement) {
    tabElement.addEventListener('dragstart', (e) => {
        draggedTab = e.target;
        // e.dataTransfer.setData('text/plain', e.target.id); // Optional: transfer data
        e.target.classList.add('being-dragged'); // Style the dragged tab
        e.dataTransfer.effectAllowed = 'move';
        console.log('Drag start:', e.target.id);
    });

    tabElement.addEventListener('dragend', (e) => {
        e.target.classList.remove('being-dragged');
        draggedTab = null;
        // Remove all drag-over styles
        document.querySelectorAll(`.${CSS_CLASSES.DRAG_OVER}`).forEach(el => el.classList.remove(CSS_CLASSES.DRAG_OVER));
        console.log('Drag end');
    });

    tabElement.addEventListener('dragover', (e) => {
        e.preventDefault(); // Necessary to allow drop
        e.dataTransfer.dropEffect = 'move';
        const targetTab = e.target.closest(`.${CSS_CLASSES.TAB_ITEM}`);
        if (targetTab && targetTab !== draggedTab) {
             // Remove indicator from others
            document.querySelectorAll(`.${CSS_CLASSES.DRAG_OVER}`).forEach(el => el.classList.remove(CSS_CLASSES.DRAG_OVER));
            targetTab.classList.add(CSS_CLASSES.DRAG_OVER); // Style the potential drop target
        }
    });

     tabElement.addEventListener('dragleave', (e) => {
         const targetTab = e.target.closest(`.${CSS_CLASSES.TAB_ITEM}`);
         if (targetTab) {
            targetTab.classList.remove(CSS_CLASSES.DRAG_OVER);
         }
    });


    tabElement.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent drop event from bubbling up
        const targetTab = e.target.closest(`.${CSS_CLASSES.TAB_ITEM}`);
        targetTab?.classList.remove(CSS_CLASSES.DRAG_OVER);

        if (draggedTab && targetTab && draggedTab !== targetTab) {
            console.log(`Drop: ${draggedTab.id} onto ${targetTab.id}`);
            // Reorder tabs in the DOM
            const draggedIndex = Array.from(tabsContainer.children).indexOf(draggedTab);
            const targetIndex = Array.from(tabsContainer.children).indexOf(targetTab);

            if (draggedIndex < targetIndex) {
                tabsContainer.insertBefore(draggedTab, targetTab.nextSibling);
            } else {
                tabsContainer.insertBefore(draggedTab, targetTab);
            }

            // TODO: Reorder the `tabs` array state as well to match the DOM order
            // This requires finding the tabs in the array and splicing/reinserting.
        }
         draggedTab = null; // Reset dragged tab
    });
}

// --- Theme Update Function ---
/**
 * Updates the theme for all currently open webviews.
 * Called when the main application theme changes.
 * @param {string} newTheme - The new theme ('light' or 'dark').
 */
function updateAllWebviewsTheme(newTheme) {
    console.log(`Updating theme for all webviews to: ${newTheme}`);
    tabs.forEach(tab => {
        applyThemeToWebview(tab.webview, newTheme);
    });
}

// --- Initialization ---
async function initializeTabs() {
    // Load settings initially to set DEFAULT_URL correctly before first tab creation
    await loadDefaultUrl();
    if (tabs.length === 0) {
        console.log("TabManager: No tabs exist, creating initial tab with default URL:", DEFAULT_URL);
        createTab(undefined, true); // Pass undefined to explicitly use DEFAULT_URL
    }
    // Expose API
    window.tabManager = {
        createTab,
        switchToTab,
        closeTab,
        getActiveTab,
        setDefaultUrl: (url) => { DEFAULT_URL = url; }, // Allows manual override if needed
        loadDefaultUrl, // Expose for potential manual reload
        updateAllWebviewsTheme
    };
    console.log('Tab Manager Initialized');
}

// Start initialization when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTabs);
} else {
    initializeTabs();
}

// Listen for settings updates from main process (via preload)
if (window.electronAPI?.onSettingsUpdated) {
    window.electronAPI.onSettingsUpdated(async (settings) => {
        console.log('TabManager: Received settings update from backend:', settings);
        // Update the module-level DEFAULT_URL when settings change
        DEFAULT_URL = settings?.homepage || DEFAULT_URL;
        console.log('TabManager: DEFAULT_URL is now:', DEFAULT_URL);
        const newTheme = settings?.theme || 'light';
        updateAllWebviewsTheme(newTheme); // Update theme for webviews
    });
} else {
     console.warn('Tabs: electronAPI.onSettingsUpdated not available.');
}
