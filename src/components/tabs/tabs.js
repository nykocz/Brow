// --- Constants ---
const CSS_CLASSES = {
    ACTIVE_TAB: 'active-tab',
    ACTIVE_WEBVIEW: 'active-webview',
    TAB_ITEM: 'tab-item',
    TAB_FAVICON: 'tab-favicon',
    TAB_TITLE: 'tab-title',
    CLOSE_TAB_BTN: 'close-tab-button',
    TAB_URL_INPUT: 'tab-url-input',
    DRAG_OVER: 'tab-drag-over',
};

const INTERNAL_PAGES = {
    SETTINGS: 'about:settings',
    SETTINGS_FILE: 'views/settings/settings.html',
    SETTINGS_ID: 'settings-tab'
};

const DEFAULT_FAVICON_SVG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="%23555" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>';
const SETTINGS_ICON_CODE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/></svg>';

// --- State ---
let tabs = []; // Array to store tab data objects
let activeTabId = null; // ID of the currently active tab
let DEFAULT_URL = 'https://www.google.com';

// --- Helper Functions ---
const getActiveTab = () => tabs.find(tab => tab.id === activeTabId) || null;

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

// --- Event Listeners pro nastavení ---
if (window.electronAPI) {
    window.electronAPI.onSettingsSaved(async () => {
        console.log('Settings saved, reloading default URL...');
        await loadDefaultUrl();
    });
}

const getFaviconUrl = (pageUrl) => {
    try {
        const url = new URL(pageUrl);
        return `${GOOGLE_FAVICON_SERVICE}${url.hostname}${FAVICON_SIZE}`;
    } catch (e) {
        console.warn("Could not parse URL for favicon:", pageUrl);
        return DEFAULT_FAVICON_SVG;
    }
};

const setFavicon = (tabId, faviconUrl) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
        tab.favicon.src = faviconUrl;
    }
};

// --- Tab Management Functions ---
function createTabElement(tabId, isActive) {
    const tabElement = document.createElement('div');
    tabElement.id = tabId;
    tabElement.classList.add(CSS_CLASSES.TAB_ITEM);
    if (isActive) {
        tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
    }
    tabElement.dataset.tabId = tabId;
    tabElement.draggable = true;

    const favicon = document.createElement('img');
    favicon.classList.add(CSS_CLASSES.TAB_FAVICON);
    favicon.src = DEFAULT_FAVICON_SVG;
    favicon.style.width = '16px';
    favicon.style.height = '16px';
    favicon.style.flexShrink = '0';
    favicon.onerror = () => { favicon.src = DEFAULT_FAVICON_SVG; };

    const titleSpan = document.createElement('span');
    titleSpan.classList.add(CSS_CLASSES.TAB_TITLE);
    titleSpan.textContent = 'New Tab';
    titleSpan.title = 'New Tab';

    const closeButton = document.createElement('button');
    closeButton.classList.add(CSS_CLASSES.CLOSE_TAB_BTN);
    closeButton.innerHTML = '&times;';
    closeButton.title = 'Close Tab';
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        closeTab(tabId);
    });

    tabElement.appendChild(favicon);
    tabElement.appendChild(titleSpan);
    tabElement.appendChild(closeButton);

    tabElement.addEventListener('click', () => handleTabClick(tabId));

    return { tabElement, favicon, titleSpan };
}

function createWebviewElement(tabId, url, isActive) {
    const webview = document.createElement('webview');
    webview.id = `webview-${tabId}`;
    webview.setAttribute('src', url);
    webview.setAttribute('webpreferences', 'contextIsolation=yes');
    if (isActive) {
        webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
    }
    return webview;
}

function handleTabClick(tabId) {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return;

    if (tab.isEditing) {
        return; // Ignore clicks while editing
    }

    if (activeTabId === tabId) {
        showInlineUrlEditor(tab);
    } else {
        switchToTab(tabId);
    }
}

function showInlineUrlEditor(tabData) {
    const { tabElement, webview, url, id } = tabData;
    
    // Create input field if it doesn't exist
    let tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
    if (!tabInput) {
        tabInput = document.createElement('input');
        tabInput.type = 'text';
        tabInput.classList.add(CSS_CLASSES.TAB_URL_INPUT);
        tabInput.style.display = 'block';
        tabInput.value = url || '';
        tabElement.appendChild(tabInput);
    }

    // Store original content for restoration
    const originalContent = {
        favicon: tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`).style.display,
        title: tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`).style.display,
        closeBtn: tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`).style.display
    };

    // Hide original elements
    tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`).style.display = 'none';
    tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`).style.display = 'none';
    tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`).style.display = 'none';

    // Show and focus input
    tabInput.style.display = 'block';
    tabData.isEditing = true;

    setTimeout(() => {
        tabInput.focus();
        tabInput.select();
    }, 10);

    const handleInput = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const newUrlInput = tabInput.value;
            const resolvedUrl = resolveURL(newUrlInput);
            restoreTabAppearance(tabData);
            if (newUrlInput !== url) {
                tabData.url = newUrlInput;
                if (url === INTERNAL_PAGES.SETTINGS && newUrlInput !== url) {
                    // Handle settings page title update if needed
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
        setTimeout(() => {
            if (tabElement.contains(tabInput) && document.activeElement !== tabInput) {
                restoreTabAppearance(tabData);
            }
        }, 150);
    };

    tabInput.removeEventListener('keydown', handleInput);
    tabInput.removeEventListener('blur', handleBlur);

    tabInput.addEventListener('keydown', handleInput);
    tabInput.addEventListener('blur', handleBlur);
}

function restoreTabAppearance(tabData) {
    const { tabElement } = tabData;
    const tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
    if (!tabInput) return;

    // Show original elements
    tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`).style.display = '';
    tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`).style.display = '';
    tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`).style.display = '';

    // Remove input
    tabInput.remove();
    tabData.isEditing = false;
}

function addWebviewListeners(tabData) {
    const { webview, titleSpan, favicon, id } = tabData;

    webview.addEventListener('page-title-updated', (e) => {
        if (id === INTERNAL_PAGES.SETTINGS_ID) return;
       
        const newTitle = e.title || 'Untitled';
        tabData.title = newTitle;
        titleSpan.textContent = newTitle;
        titleSpan.title = newTitle;
        console.log(`Tab ${id} title updated: ${newTitle}`);
    });

    webview.addEventListener('page-favicon-updated', (e) => {
        if (id === INTERNAL_PAGES.SETTINGS_ID) {
            console.log(`Tab ${id} is settings page, skipping favicon update`);
            return;
        }
        if (e.favicons && e.favicons.length > 0) {
            setFavicon(id, e.favicons[0]);
        } else {
            setFavicon(id, getFaviconUrl(webview.getURL() || tabData.url));
        }
        tabData.favicon.onerror = () => { tabData.favicon.src = DEFAULT_FAVICON_SVG; };
    });

    webview.addEventListener('did-start-loading', () => {
        tabData.isLoading = true;
        // Update reload button to show stop icon
        const reloadButton = document.getElementById('reload-button');
        if (reloadButton) {
            const icon = reloadButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-redo');
                icon.classList.add('fa-times');
            }
        }
    });

    webview.addEventListener('did-stop-loading', () => {
        tabData.isLoading = false;
        // Update reload button to show reload icon
        const reloadButton = document.getElementById('reload-button');
        if (reloadButton) {
            const icon = reloadButton.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-redo');
            }
        }
    });

    // Navigation state change handlers
    webview.addEventListener('did-navigate', updateNavigationState);
    webview.addEventListener('did-navigate-in-page', updateNavigationState);
}

function updateNavigationState() {
    const activeTab = getActiveTab();
    if (!activeTab?.webview) return;

    const canGoBack = activeTab.webview.canGoBack();
    const canGoForward = activeTab.webview.canGoForward();

    // Update navigation buttons state
    document.getElementById('back-button').disabled = !canGoBack;
    document.getElementById('forward-button').disabled = !canGoForward;
}

// --- Tab Creation and Management ---
function createTab(url = DEFAULT_URL, activate = true) {
    const resolvedUrl = resolveURL(url);
    const tabId = url === INTERNAL_PAGES.SETTINGS ? 
                  INTERNAL_PAGES.SETTINGS_ID : 
                  `tab-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    
    console.log(`Creating tab: ${tabId} with URL: ${resolvedUrl} (original: ${url})`);

    if (activate && activeTabId) {
        const currentActive = getActiveTab();
        if (currentActive) {
            currentActive.tabElement.classList.remove(CSS_CLASSES.ACTIVE_TAB);
            currentActive.webview.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
        }
    }

    const webview = createWebviewElement(tabId, resolvedUrl, activate);
    const { tabElement, favicon, titleSpan } = createTabElement(tabId, activate);

    if (url === INTERNAL_PAGES.SETTINGS) {
        titleSpan.textContent = 'Nastavení';
        const encodedSvg = btoa(SETTINGS_ICON_CODE);
        favicon.src = `data:image/svg+xml;base64,${encodedSvg}`;
        webview.setAttribute('preload', '../src/preload.js');
    }

    const tabData = {
        id: tabId,
        url: url,
        title: url === INTERNAL_PAGES.SETTINGS ? 'Nastavení' : 'New Tab',
        tabElement,
        webview,
        favicon,
        titleSpan,
        isLoading: false,
        isEditing: false
    };

    // Add to DOM
    document.getElementById('tabs-container').appendChild(tabElement);
    document.getElementById('webview-container').appendChild(webview);

    // Add to state
    tabs.push(tabData);

    // Set up event listeners
    addWebviewListeners(tabData);

    // Set as active if requested
    if (activate) {
        activeTabId = tabId;
        webview.focus();
    }

    return tabId;
}

function switchToTab(tabId) {
    console.log(`Switching to tab: ${tabId}`);
    const targetTab = tabs.find(t => t.id === tabId);
    if (!targetTab) {
        console.warn(`Attempted to switch to non-existent tab: ${tabId}`);
        return;
    }

    // Deactivate current tab
    const currentTab = getActiveTab();
    if (currentTab) {
        currentTab.tabElement.classList.remove(CSS_CLASSES.ACTIVE_TAB);
        currentTab.webview.classList.remove(CSS_CLASSES.ACTIVE_WEBVIEW);
    }

    // Activate target tab
    targetTab.tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
    targetTab.webview.classList.add(CSS_CLASSES.ACTIVE_WEBVIEW);
    activeTabId = tabId;

    // Update navigation state
    updateNavigationState();

    setTimeout(() => {
        targetTab.webview.focus();
    }, 100);

    targetTab.tabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
}

function closeTab(tabId) {
    console.log(`Closing tab: ${tabId}`);
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) {
        console.warn(`Attempted to close non-existent tab: ${tabId}`);
        return;
    }

    const tabToRemove = tabs[tabIndex];

    tabToRemove.tabElement.remove();
    tabToRemove.webview.remove();

    tabs.splice(tabIndex, 1);

    if (activeTabId === tabId) {
        activeTabId = null;
        if (tabs.length > 0) {
            const newActiveIndex = Math.max(0, tabIndex - 1);
            switchToTab(tabs[newActiveIndex].id);
        } else {
            console.log("Last tab closed, creating a new default tab.");
            createTab(DEFAULT_URL, true);
        }
    }
}

// --- Exports ---
window.tabManager = {
    createTab,
    switchToTab,
    closeTab,
    getActiveTab,
    setDefaultUrl: (url) => { DEFAULT_URL = url; },
    loadDefaultUrl // Exportujeme pro použití v titlebar.js
};
