(() => {
    // Assume TabManager is globally available after tabs.js runs
    const TM = window.TabManager;

    // --- Constants ---
    // Keep only UI-specific classes and IDs
    const CSS_CLASSES = {
        MACOS_CONTROLS: 'macos-window-controls',
        CONTROL_BUTTON: 'control-button',
        ACTIVE_TAB: 'active-tab', // Used for styling the tab element
        TAB_ITEM: 'tab-item',
        TAB_FAVICON: 'tab-favicon',
        TAB_TITLE: 'tab-title',
        CLOSE_TAB_BTN: 'close-tab-button',
        TAB_URL_INPUT: 'tab-url-input',
        TAB_EDITING_URL: 'editing-url', // Class for inline editing state
        LOADING_ICON_CLASS: 'fa-times', // Font Awesome class for stop icon
        RELOAD_ICON_CLASS: 'fa-redo',   // Font Awesome class for reload icon
        DRAG_OVER: 'tab-drag-over',
        DRAGGING: 'dragging', // Class for the element being dragged
        IMMERSIVE_MODE: 'immersive-mode',
        SUGGESTION_LIST: 'suggestion-list',
        INPUT_SEARCH_ICON: 'input-search-icon'
    };

    const ELEMENT_IDS = {
        TITLE_BAR: 'title-bar',
        WINDOW_CONTROLS: 'window-controls',
        CLOSE_BTN: 'close-button',
        MINIMIZE_BTN: 'minimize-button',
        MAXIMIZE_BTN: 'maximize-button',
        FOURTH_BUTTON: 'fourth-button', // Immersive mode toggle
        TABS_CONTAINER: 'tabs-container',
        NEW_TAB_BTN: 'new-tab-button',
        URL_INPUT: 'url-input', // Main address bar input
        ADDRESS_BAR_CONTAINER: 'address-bar-container',
        BACK_BTN: 'back-button',
        FORWARD_BTN: 'forward-button',
        RELOAD_BTN: 'reload-button',
        HOME_BTN: 'home-button',
        BOOKMARK_BTN: 'bookmark-button', // Functionality TBD
        SEARCH_BTN: 'search-button',     // Functionality TBD
        SETTINGS_BTN: 'settings-button',
    };

    // --- Application State (UI specific) ---
    let currentActiveTabId = null; // Keep track of which tab *UI* thinks is active
    let draggedTabElement = null; // For drag & drop tracking

    // --- DOM Element References ---
    let titleBar, tabsContainer, newTabButton, urlInput;
    let addressBarContainer, backButton, forwardButton, reloadButton;
    let homeButton, bookmarkButton, searchButton, settingsButton;
    let windowControlsContainer;

    /**
     * Initializes DOM element references.
     * @returns {boolean} True if initialization is successful, false otherwise.
     */
    function initializeDOMElements() {
        titleBar = document.getElementById(ELEMENT_IDS.TITLE_BAR);
        tabsContainer = document.getElementById(ELEMENT_IDS.TABS_CONTAINER);
        newTabButton = document.getElementById(ELEMENT_IDS.NEW_TAB_BTN);
        urlInput = document.getElementById(ELEMENT_IDS.URL_INPUT);
        addressBarContainer = document.getElementById(ELEMENT_IDS.ADDRESS_BAR_CONTAINER);
        backButton = document.getElementById(ELEMENT_IDS.BACK_BTN);
        forwardButton = document.getElementById(ELEMENT_IDS.FORWARD_BTN);
        reloadButton = document.getElementById(ELEMENT_IDS.RELOAD_BTN);
        homeButton = document.getElementById(ELEMENT_IDS.HOME_BTN);
        bookmarkButton = document.getElementById(ELEMENT_IDS.BOOKMARK_BTN);
        searchButton = document.getElementById(ELEMENT_IDS.SEARCH_BTN);
        settingsButton = document.getElementById(ELEMENT_IDS.SETTINGS_BTN);
        // windowControlsContainer is assigned in setupWindowControls

        if (!titleBar || !tabsContainer || !newTabButton || !urlInput || !addressBarContainer ||
            !backButton || !forwardButton || !reloadButton || !homeButton || !settingsButton) {
            console.error("Titlebar: One or more essential UI elements are missing!");
            return false;
        }
        return true;
    }

    // --- Helper Functions ---

    /**
     * Sets the favicon source for a given tab's favicon element.
     * Handles errors by setting the default favicon provided by TabManager.
     * @param {HTMLElement} faviconElement - The <img> element for the favicon.
     * @param {string} faviconUrl - The URL of the favicon to set.
     */
    function setFaviconSrc(faviconElement, faviconUrl) {
        if (!faviconElement || !TM) return; // Add TM check
        const defaultFavicon = TM.getDefaultFavicon();
        faviconElement.src = faviconUrl || defaultFavicon;
        // Add error handling only if src is not already the default
        if (faviconElement.src !== defaultFavicon) {
            faviconElement.onerror = () => {
                if (faviconElement.src !== defaultFavicon) { // Check again inside handler
                    // console.warn('Titlebar: Favicon failed to load, setting default:', faviconUrl);
                    faviconElement.src = defaultFavicon;
                }
                faviconElement.onerror = null; // Prevent infinite loops
            };
        } else {
             faviconElement.onerror = null; // Remove handler if setting default initially
        }
    }

    // --- macOS Window Controls Setup ---
    function setupWindowControls() {
        console.log("Titlebar: Setting up macOS style title bar controls...");
        const createButton = (id, title) => {
            const button = document.createElement('div');
            button.id = id;
            button.classList.add(CSS_CLASSES.CONTROL_BUTTON);
            button.title = title;
            return button;
        };

        // Check if controls already exist
        let existingControls = document.getElementById(ELEMENT_IDS.WINDOW_CONTROLS);
        if (existingControls) {
            console.log("Titlebar: Window controls already exist, ensuring listeners attached.");
            windowControlsContainer = existingControls;
             // Re-attach listeners to existing buttons if necessary
             const closeBtn = document.getElementById(ELEMENT_IDS.CLOSE_BTN);
             const minBtn = document.getElementById(ELEMENT_IDS.MINIMIZE_BTN);
             const maxBtn = document.getElementById(ELEMENT_IDS.MAXIMIZE_BTN);
             const fourthBtn = document.getElementById(ELEMENT_IDS.FOURTH_BUTTON);

             if (window.electronAPI && closeBtn && minBtn && maxBtn && fourthBtn) {
                 // Remove potential old listeners before adding new ones? Or assume they are idempotent.
                 closeBtn.onclick = () => window.electronAPI.closeWindow();
                 minBtn.onclick = () => window.electronAPI.minimizeWindow();
                 maxBtn.onclick = () => window.electronAPI.maximizeWindow();
                 fourthBtn.onclick = toggleImmersiveMode;
             }
            return;
        }

        // Create controls if they don't exist
        const windowControls = document.createElement('div');
        windowControls.id = ELEMENT_IDS.WINDOW_CONTROLS;
        windowControls.classList.add(CSS_CLASSES.MACOS_CONTROLS);
        windowControlsContainer = windowControls;

        const closeButton = createButton(ELEMENT_IDS.CLOSE_BTN, 'Close');
        const minimizeButton = createButton(ELEMENT_IDS.MINIMIZE_BTN, 'Minimize');
        const maximizeButton = createButton(ELEMENT_IDS.MAXIMIZE_BTN, 'Maximize/Restore');
        const fourthButton = createButton(ELEMENT_IDS.FOURTH_BUTTON, 'Toggle Immersive Mode');

        windowControls.appendChild(closeButton);
        windowControls.appendChild(minimizeButton);
        windowControls.appendChild(maximizeButton);
        windowControls.appendChild(fourthButton);

        titleBar.prepend(windowControls);

        // Add Electron API listeners
        if (window.electronAPI) {
            closeButton.addEventListener('click', () => window.electronAPI.closeWindow());
            minimizeButton.addEventListener('click', () => window.electronAPI.minimizeWindow());
            maximizeButton.addEventListener('click', () => window.electronAPI.maximizeWindow());
            fourthButton.addEventListener('click', toggleImmersiveMode);
        } else {
            console.error('Titlebar: window.electronAPI is not available! Window controls disabled.');
            [closeButton, minimizeButton, maximizeButton, fourthButton].forEach(btn => {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                btn.title = "Error: Window control unavailable";
            });
        }
    }

    // --- Immersive Mode ---
    function toggleImmersiveMode() {
        const body = document.body;
        const isImmersive = body.classList.toggle(CSS_CLASSES.IMMERSIVE_MODE);
        console.log(`Titlebar: Toggling immersive mode: ${isImmersive ? 'ON' : 'OFF'}`);
        
        if (isImmersive) {
            document.addEventListener('keydown', exitImmersiveModeOnEscape);
             const activeTab = TM?.getActiveTab(); // Use TM
             activeTab?.webview?.focus();
        } else {
            document.removeEventListener('keydown', exitImmersiveModeOnEscape);
        }
    }
    
    function exitImmersiveModeOnEscape(event) {
        if (event.key === 'Escape') {
            const body = document.body;
            if (body.classList.contains(CSS_CLASSES.IMMERSIVE_MODE)) {
                console.log('Titlebar: Exiting immersive mode via Escape key');
                body.classList.remove(CSS_CLASSES.IMMERSIVE_MODE);
                document.removeEventListener('keydown', exitImmersiveModeOnEscape);
            }
        }
    }

    // --- Address Bar and Navigation UI Update ---
    const updateNavigationButtons = (navState) => {
        // Only update if the state change is for the currently active tab UI
        if (!navState || navState.tabId !== currentActiveTabId) {
            // If no active tab, disable all
             if (currentActiveTabId === null) {
                backButton.disabled = true;
                forwardButton.disabled = true;
                reloadButton.disabled = true;
                reloadButton.innerHTML = `<i class="fas ${CSS_CLASSES.RELOAD_ICON_CLASS}"></i>`;
                reloadButton.title = 'Reload';
             }
            return;
        }

        const { canGoBack, canGoForward, isLoading } = navState;

         // Special logic for Settings Tab
         if (currentActiveTabId === TM?.INTERNAL_PAGES.SETTINGS_ID) { // Use TM
            backButton.disabled = true;
            forwardButton.disabled = true;
            reloadButton.innerHTML = `<i class="fas ${CSS_CLASSES.RELOAD_ICON_CLASS}"></i>`;
            reloadButton.disabled = true; 
            reloadButton.title = 'Refresh (disabled for settings)';
            return;
        }

        backButton.disabled = !canGoBack;
        forwardButton.disabled = !canGoForward;
        reloadButton.disabled = false;

        const icon = reloadButton.querySelector('i');
        if (icon) {
            if (isLoading) {
                icon.className = `fas ${CSS_CLASSES.LOADING_ICON_CLASS}`;
            reloadButton.title = 'Stop';
        } else {
                icon.className = `fas ${CSS_CLASSES.RELOAD_ICON_CLASS}`;
            reloadButton.title = 'Reload';
            }
        }
    };

    const updateUrlInput = () => {
        const activeTab = TM?.getActiveTab(); // Get fresh data from TM
         let displayUrl = '';
         if (activeTab) {
             // Show 'about:settings' if it's the settings page, otherwise the current URL
             displayUrl = activeTab.id === TM.INTERNAL_PAGES.SETTINGS_ID
                          ? TM.INTERNAL_PAGES.SETTINGS
                          : activeTab.url || '';
         }
        urlInput.value = displayUrl;
    };


    // --- Tab UI Management ---
    function createTabElement(tabData, isActive) {
        const { id, title, faviconUrl } = tabData;

        const tabElement = document.createElement('div');
        tabElement.id = id;
        tabElement.classList.add(CSS_CLASSES.TAB_ITEM);
        if (isActive) {
            tabElement.classList.add(CSS_CLASSES.ACTIVE_TAB);
        }
        tabElement.dataset.tabId = id;
        tabElement.draggable = true;

        const favicon = document.createElement('img');
        favicon.classList.add(CSS_CLASSES.TAB_FAVICON);
        setFaviconSrc(favicon, faviconUrl); // Use helper
        favicon.style.width = '16px';
        favicon.style.height = '16px';
        favicon.style.flexShrink = '0';

        const titleSpan = document.createElement('span');
        titleSpan.classList.add(CSS_CLASSES.TAB_TITLE);
        titleSpan.textContent = title || 'Loading...';
        titleSpan.title = title || 'Loading...';

        const closeButton = document.createElement('button');
        closeButton.classList.add(CSS_CLASSES.CLOSE_TAB_BTN);
        closeButton.innerHTML = '&times;';
        closeButton.title = 'Close Tab';
        closeButton.addEventListener('click', (event) => {
            event.stopPropagation();
            TM?.closeTab(id); // Use TM
        });

        // // Optional: Disable close for settings tab
        // if (id === TM?.INTERNAL_PAGES.SETTINGS_ID) {
        //     closeButton.style.display = 'none';
        // }

        tabElement.appendChild(favicon);
        tabElement.appendChild(titleSpan);
        tabElement.appendChild(closeButton);

        tabElement.addEventListener('click', () => handleTabClick(id));
        addDragAndDropListeners(tabElement); // Add D&D listeners

        return tabElement;
    }

     const findTabElement = (tabId) => document.getElementById(tabId);

     function updateTabElement(tabId, changes) {
        const tabElement = findTabElement(tabId);
        if (!tabElement) return;

        const titleSpan = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
        const favicon = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);

        if (changes.hasOwnProperty('title') && titleSpan) {
            const newTitle = changes.title || 'Untitled';
            titleSpan.textContent = newTitle;
            titleSpan.title = newTitle;
        }
        if (changes.hasOwnProperty('faviconUrl') && favicon) {
            setFaviconSrc(favicon, changes.faviconUrl); // Use helper
        }
        if (changes.hasOwnProperty('isLoading')) {
            // Visual indication handled by nav button state for now
             console.log(`Tab ${tabId} isLoading state changed to: ${changes.isLoading} (UI update TBD)`);
             // tabElement.classList.toggle('loading-visual', changes.isLoading);
        }
         if (changes.hasOwnProperty('url')) {
            // Update main URL input *only if* this is the active tab
            if (tabId === currentActiveTabId) {
                updateUrlInput(); // Update based on latest TM data
            }
        }
     }

    function handleTabClick(tabId) {
        if (!TM) return;
        if (tabId === currentActiveTabId) {
            // Clicked on already active tab -> initiate editing (unless settings)
            if (tabId === TM.INTERNAL_PAGES.SETTINGS_ID) {
                console.log('Titlebar: Clicked on active Settings tab - editing disabled.');
            return;
        }
            const tabElement = findTabElement(tabId);
            // Only start editing if not already editing
            if (tabElement && !tabElement.classList.contains(CSS_CLASSES.TAB_EDITING_URL)) {
                 console.log(`Titlebar: Initiating inline edit for active tab: ${tabId}`);
                 showInlineUrlEditor(tabId);
             }
         } else {
            // Clicked on an inactive tab -> switch to it
            console.log(`Titlebar: Requesting switch to tab: ${tabId}`);
            TM.switchToTab(tabId); // Let TabManager handle the switch
        }
    }

    function showInlineUrlEditor(tabId) {
        const tabElement = findTabElement(tabId);
        if (!tabElement || tabElement.classList.contains(CSS_CLASSES.TAB_EDITING_URL) || !TM) return;

        const tabData = TM.getAllTabs().find(t => t.id === tabId);
        if (!tabData) return;

        tabElement.classList.add(CSS_CLASSES.TAB_EDITING_URL);

        const favicon = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);
        const titleSpan = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
        const closeButton = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);

        if (favicon) favicon.style.display = 'none';
        if (titleSpan) titleSpan.style.display = 'none';
        if (closeButton) closeButton.style.display = 'none';

        let tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
        let searchIcon = tabElement.querySelector(`.${CSS_CLASSES.INPUT_SEARCH_ICON}`);
        if (!tabInput) {
            tabInput = document.createElement('input');
            tabInput.type = 'text';
            tabInput.className = CSS_CLASSES.TAB_URL_INPUT;
            searchIcon = document.createElement('i');
            searchIcon.className = `fas fa-search ${CSS_CLASSES.INPUT_SEARCH_ICON}`;
            tabElement.prepend(searchIcon);
            tabElement.prepend(tabInput);
        } else {
             searchIcon.style.display = '';
        }

        tabInput.value = (tabId === TM.INTERNAL_PAGES.SETTINGS_ID)
                       ? TM.INTERNAL_PAGES.SETTINGS
                       : (tabData.requestedUrl || tabData.url || ''); // Prefer requested, fallback to current
        tabInput.style.display = 'block';

        // --- Suggestion List Logic ---
        let suggestionList = tabElement.querySelector(`.${CSS_CLASSES.SUGGESTION_LIST}`);
        if (!suggestionList) {
            suggestionList = document.createElement('ul');
            suggestionList.className = CSS_CLASSES.SUGGESTION_LIST;
            Object.assign(suggestionList.style, {
                position: 'absolute', background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                padding: '0', margin: '0', listStyle: 'none', zIndex: '1000',
                width: 'calc(100% + 20px)', left: '-10px', // Example positioning
                maxHeight: '200px', overflowY: 'auto', boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                display: 'none'
            });
             tabElement.style.position = 'relative';
             tabElement.appendChild(suggestionList);
        }

        const updateSuggestions = (inputValue) => {
            const popularSites = [
                'https://www.google.com', 'https://www.youtube.com', 'https://github.com',
                'https://developer.mozilla.org', 'https://stackoverflow.com'
            ];
            const lowerInput = inputValue.toLowerCase();
            const suggestions = inputValue ? popularSites.filter(site => site.toLowerCase().includes(lowerInput)) : [];

            suggestionList.innerHTML = '';
            if (suggestions.length > 0) {
                suggestions.forEach(suggestion => {
                    const li = document.createElement('li');
                    li.textContent = suggestion;
                    Object.assign(li.style, {
                         padding: '5px 10px', cursor: 'pointer', color: 'var(--text-color)',
                         borderBottom: '1px solid var(--border-color)'
                    });
                    li.onmouseover = () => li.style.background = 'var(--hover-bg-color)';
                    li.onmouseout = () => li.style.background = 'var(--bg-color)';
                    li.addEventListener('click', (e) => {
                        e.stopPropagation();
                        tabInput.value = suggestion;
                        suggestionList.style.display = 'none';
                        restoreTabAppearance(tabId);
                        TM.navigateTab(tabId, suggestion); // Use TM
                    });
                    suggestionList.appendChild(li);
                });
                suggestionList.style.display = 'block';
                 const inputRect = tabInput.getBoundingClientRect();
                 const tabRect = tabElement.getBoundingClientRect();
                 suggestionList.style.top = `${inputRect.bottom - tabRect.top + 2}px`;
                 suggestionList.style.width = `${inputRect.width}px`;
        } else {
                suggestionList.style.display = 'none';
        }
        };

        const suggestionInputHandler = () => updateSuggestions(tabInput.value);
        tabInput.addEventListener('input', suggestionInputHandler);
        // --- End Suggestion Logic ---

        setTimeout(() => {
            tabInput.focus();
            tabInput.select();
            updateSuggestions(tabInput.value);
        }, 10);

        const handleInputKeydown = (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                const newUrlInput = tabInput.value;
                if(suggestionList) suggestionList.style.display = 'none';
                restoreTabAppearance(tabId);
                TM?.navigateTab(tabId, newUrlInput); // Use TM
            } else if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
                if(suggestionList) suggestionList.style.display = 'none';
                restoreTabAppearance(tabId);
            }
        };

        const handleInputBlur = () => {
            setTimeout(() => {
                 const isEditing = tabElement.classList.contains(CSS_CLASSES.TAB_EDITING_URL);
                 if (isEditing && document.activeElement !== tabInput && !suggestionList.contains(document.activeElement)) {
                     if(suggestionList) suggestionList.style.display = 'none';
                     restoreTabAppearance(tabId);
                }
            }, 150);
        };

        tabInput.addEventListener('keydown', handleInputKeydown);
        tabInput.addEventListener('blur', handleInputBlur);
        tabInput._inlineEditHandlers = { handleInputKeydown, handleInputBlur, suggestionInputHandler };
    }

    function restoreTabAppearance(tabId) {
        const tabElement = findTabElement(tabId);
        if (!tabElement || !tabElement.classList.contains(CSS_CLASSES.TAB_EDITING_URL)) return;

        const tabInput = tabElement.querySelector(`.${CSS_CLASSES.TAB_URL_INPUT}`);
        const searchIcon = tabElement.querySelector(`.${CSS_CLASSES.INPUT_SEARCH_ICON}`);
        const favicon = tabElement.querySelector(`.${CSS_CLASSES.TAB_FAVICON}`);
        const titleSpan = tabElement.querySelector(`.${CSS_CLASSES.TAB_TITLE}`);
        const closeButton = tabElement.querySelector(`.${CSS_CLASSES.CLOSE_TAB_BTN}`);
        const suggestionList = tabElement.querySelector(`.${CSS_CLASSES.SUGGESTION_LIST}`);

        if (tabInput && tabInput._inlineEditHandlers) {
            tabInput.removeEventListener('keydown', tabInput._inlineEditHandlers.handleInputKeydown);
            tabInput.removeEventListener('blur', tabInput._inlineEditHandlers.handleInputBlur);
            tabInput.removeEventListener('input', tabInput._inlineEditHandlers.suggestionInputHandler);
            delete tabInput._inlineEditHandlers;
        }

        if (tabInput) tabInput.style.display = 'none';
        if (searchIcon) searchIcon.style.display = 'none';
        if (suggestionList) suggestionList.style.display = 'none';

        if (favicon) favicon.style.display = '';
        if (titleSpan) titleSpan.style.display = '';
        if (closeButton) closeButton.style.display = '';

        tabElement.classList.remove(CSS_CLASSES.TAB_EDITING_URL);
        tabElement.style.position = ''; // Reset position
    }

    // --- Drag and Drop ---
    function addDragAndDropListeners(tabElement) {
        tabElement.addEventListener('dragstart', (e) => {
            draggedTabElement = e.target;
            e.dataTransfer.setData('text/plain', e.target.id);
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => e.target.classList.add(CSS_CLASSES.DRAGGING), 0);
        });

        tabElement.addEventListener('dragend', (e) => {
             if (draggedTabElement) {
                 draggedTabElement.classList.remove(CSS_CLASSES.DRAGGING);
             }
             document.querySelectorAll(`.${CSS_CLASSES.DRAG_OVER}`).forEach(el => el.classList.remove(CSS_CLASSES.DRAG_OVER));
             draggedTabElement = null;
        });

        tabElement.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const targetElement = e.target.closest(`.${CSS_CLASSES.TAB_ITEM}`);
            if (targetElement && targetElement !== draggedTabElement) {
                 document.querySelectorAll(`.${CSS_CLASSES.DRAG_OVER}`).forEach(el => {
                     if (el !== targetElement) el.classList.remove(CSS_CLASSES.DRAG_OVER);
                 });
                 targetElement.classList.add(CSS_CLASSES.DRAG_OVER);
            }
        });

        tabElement.addEventListener('dragleave', (e) => {
            const targetElement = e.target.closest(`.${CSS_CLASSES.TAB_ITEM}`);
            if (targetElement && !targetElement.contains(e.relatedTarget)) {
                 targetElement.classList.remove(CSS_CLASSES.DRAG_OVER);
            }
        });

        tabElement.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const targetElement = e.target.closest(`.${CSS_CLASSES.TAB_ITEM}`);
            if (targetElement) {
                targetElement.classList.remove(CSS_CLASSES.DRAG_OVER);
            }

            if (draggedTabElement && targetElement && draggedTabElement !== targetElement) {
                const draggedId = draggedTabElement.dataset.tabId;
                const targetId = targetElement.dataset.tabId;
                console.log(`Titlebar: Drop ${draggedId} onto ${targetId}`);

                // Visually reorder immediately
                const rect = targetElement.getBoundingClientRect();
                const offset = e.clientY - rect.top - rect.height / 2;
                if (offset > 0) { // Drop below midpoint
                    targetElement.parentNode.insertBefore(draggedTabElement, targetElement.nextSibling);
                } else { // Drop above midpoint
                    targetElement.parentNode.insertBefore(draggedTabElement, targetElement);
                }

                // Get new order from DOM
                const orderedTabIds = Array.from(tabsContainer.querySelectorAll(`.${CSS_CLASSES.TAB_ITEM}`))
                                         .map(el => el.dataset.tabId);

                // Tell TabManager
                TM?.updateTabOrder(orderedTabIds);
            }
             if (draggedTabElement) {
                 draggedTabElement.classList.remove(CSS_CLASSES.DRAGGING);
                 draggedTabElement = null;
             }
        });
    }

    function updateTabsOrder() {
        if (!tabsContainer || !TM) return;

        const orderedTabsData = TM.getAllTabs();
        const fragment = document.createDocumentFragment();
        const currentActiveId = TM.getActiveTab()?.id; // Get current active from TM

        orderedTabsData.forEach(tabData => {
            let tabElement = findTabElement(tabData.id);
            if (tabElement) {
                // Update existing element if needed (e.g., active state)
                tabElement.classList.toggle(CSS_CLASSES.ACTIVE_TAB, tabData.id === currentActiveId);
                fragment.appendChild(tabElement); // Move existing to fragment
            } else {
                // Create new element if it doesn't exist in DOM
                console.warn(`Titlebar: Tab element for ${tabData.id} not found during reorder, creating.`);
                tabElement = createTabElement(tabData, tabData.id === currentActiveId);
                fragment.appendChild(tabElement);
            }
        });

        // Clear only tab items from the container
         Array.from(tabsContainer.querySelectorAll(`.${CSS_CLASSES.TAB_ITEM}`)).forEach(el => el.remove());

        // Append the ordered fragment before the new tab button
        tabsContainer.insertBefore(fragment, newTabButton);

        // Ensure active tab is visible
        const activeTabElement = findTabElement(currentActiveId);
        activeTabElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }

    // --- Global Event Listeners Setup ---
    function setupGlobalEventListeners() {
         if (!TM) return; // Cannot setup if TM is not loaded

        backButton.addEventListener('click', () => {
            if (currentActiveTabId) TM.goBack(currentActiveTabId);
        });
        forwardButton.addEventListener('click', () => {
            if (currentActiveTabId) TM.goForward(currentActiveTabId);
        });
        reloadButton.addEventListener('click', (event) => { // Pass event if needed for shift-reload
            if (currentActiveTabId) {
                const ignoreCache = event.shiftKey;
                TM.reloadTab(currentActiveTabId, ignoreCache);
            }
        });
        homeButton.addEventListener('click', () => {
            if (currentActiveTabId) TM.goHome(currentActiveTabId);
        });

        urlInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const urlValue = urlInput.value;
                if (currentActiveTabId) {
                    TM.navigateTab(currentActiveTabId, urlValue);
            } else {
                    // No active tab? Create new one.
                    TM.createTab(urlValue, true);
                }
                urlInput.blur(); // Optional: blur after submit
            }
        });

        newTabButton.addEventListener('click', () => {
            TM.createTab(undefined, true); // TM uses default URL
        });

        settingsButton.addEventListener('click', () => {
            TM.createTab(TM.INTERNAL_PAGES.SETTINGS, true); // TM handles existing check
        });

        // Placeholders
        bookmarkButton.addEventListener('click', () => console.log('Bookmark button clicked (TBD)'));
        searchButton.addEventListener('click', () => console.log('Search button clicked (TBD)'));

        // CSS Hot Reload Listener
        if (window.electronAPI && window.electronAPI.onCssReload) {
            window.reloadCSS = () => {
                console.log('Titlebar: Reloading CSS...');
                const links = document.querySelectorAll('link[rel="stylesheet"]');
                links.forEach(link => {
                    const originalHref = link.getAttribute('href');
                    if (originalHref && originalHref.includes('.css')) {
                        const timestamp = Date.now();
                        const newHref = originalHref.split('?')[0] + `?t=${timestamp}`;
                        link.href = newHref;
                        console.log(`Reloaded CSS: ${originalHref} -> ${newHref}`);
                    }
                });
            };
            window.electronAPI.onCssReload(() => {
                if (window.reloadCSS) window.reloadCSS();
            });
             document.addEventListener('app-reload', () => {
                if (window.reloadCSS) window.reloadCSS();
            });
        }
    }

     // --- TabManager Event Listeners ---
     function setupTabManagerListeners() {
         if (!TM) {
             console.error("Titlebar: TabManager not available! Cannot set up listeners.");
             return;
         }

         TM.on('tab-added', (tabData) => {
             console.log('Titlebar: Received tab-added', tabData.id);
             if (!tabsContainer) {
                 console.error("Titlebar: Cannot add tab - tabsContainer not initialized");
                 return;
             }
             if (findTabElement(tabData.id)) {
                 console.warn(`Titlebar: Tab element ${tabData.id} already exists on tab-added.`);
                 updateTabElement(tabData.id, tabData); // Update just in case
                 return;
             }
             const isActive = tabData.id === currentActiveTabId;
             const tabElement = createTabElement(tabData, isActive);
             
             // Find the new tab button or append to the end if not found
             const newTabBtn = document.getElementById(ELEMENT_IDS.NEW_TAB_BTN);
             if (newTabBtn && newTabBtn.parentNode === tabsContainer) {
                 tabsContainer.insertBefore(tabElement, newTabBtn);
             } else {
                 tabsContainer.appendChild(tabElement);
                 console.warn('Titlebar: New tab button not found in tabsContainer, appending tab to end');
             }
         });

         TM.on('tab-removed', ({ tabId }) => {
             console.log('Titlebar: Received tab-removed', tabId);
             const tabElement = findTabElement(tabId);
             tabElement?.remove();
         });

         TM.on('tab-updated', ({ id, changed }) => {
             // console.log('Titlebar: Received tab-updated', id, changed);
             updateTabElement(id, changed);
         });

         TM.on('tab-activated', ({ activeTabId, previousTabId }) => {
             console.log(`Titlebar: Received tab-activated: ${activeTabId} (previous: ${previousTabId})`);

              if (previousTabId) {
                  const previousTabElement = findTabElement(previousTabId);
                  if (previousTabElement?.classList.contains(CSS_CLASSES.TAB_EDITING_URL)) {
                      restoreTabAppearance(previousTabId);
                  }
              }

             currentActiveTabId = activeTabId; // Update UI's tracked active tab

             // Update active class on all tab elements
             tabsContainer.querySelectorAll(`.${CSS_CLASSES.TAB_ITEM}`).forEach(el => {
                 el.classList.toggle(CSS_CLASSES.ACTIVE_TAB, el.dataset.tabId === activeTabId);
             });

             // Update main URL bar
             updateUrlInput(); // Reads active tab data from TM

             // Update navigation buttons state
             const activeTab = TM.getActiveTab();
             if (activeTab) {
                 updateNavigationButtons({
                     tabId: activeTab.id,
                     canGoBack: activeTab.canGoBack,
                     canGoForward: activeTab.canGoForward,
                     isLoading: activeTab.isLoading
                 });
             } else {
                  updateNavigationButtons(null); // No active tab
             }

             // Scroll active tab into view
             const activeTabElement = findTabElement(activeTabId);
             activeTabElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
         });

         TM.on('nav-state-change', (navState) => {
             // Update buttons only if the change is for the currently active tab
             if (navState.tabId === currentActiveTabId) {
                 updateNavigationButtons(navState);
             }
         });

         TM.on('settings-saved', () => {
             console.log("Titlebar: Settings saved event received.");
             // Optional UI feedback
        });
    }

    // --- Initialization ---
    document.addEventListener('DOMContentLoaded', async () => {
        console.log("Titlebar: DOM fully loaded and parsed.");

        if (!initializeDOMElements()) {
            console.error("Titlebar: Failed to initialize essential DOM elements. Aborting UI setup.");
            return;
        }

        // CRITICAL: Check if TabManager loaded
        if (!TM) {
             console.error("Titlebar FATAL: TabManager module (window.TabManager) not found. Ensure tabs.js loads and runs successfully before titlebar.js.");
             // Display a user-friendly error
              if (titleBar) { // Check if titleBar exists before manipulating
                 titleBar.innerHTML = '<div style="padding: 10px; color: red; background: #fee; border: 1px solid red;">Error: Application core failed to load (TabManager). Please try restarting the application.</div>';
              } else {
                  // Fallback if even titleBar is missing
                  document.body.innerHTML = '<div style="padding: 20px; color: red;">Fatal Error: Application cannot start.</div>';
              }
             return; // Stop initialization
         }

        // Proceed with setup
        setupWindowControls();
        setupGlobalEventListeners();
        setupTabManagerListeners();

        // Initial Rendering from TabManager state
        console.log("Titlebar: Performing initial tab rendering from TabManager...");
        const initialTabs = TM.getAllTabs();
        const initialActiveTab = TM.getActiveTab();
        currentActiveTabId = initialActiveTab ? initialActiveTab.id : null;

        // Clear any existing tab elements before rendering (safer)
        tabsContainer.querySelectorAll(`.${CSS_CLASSES.TAB_ITEM}`).forEach(el => el.remove());

        if (initialTabs.length > 0) {
            updateTabsOrder(); // Render tabs based on TM state and order
            updateUrlInput();  // Update URL bar for the active tab
            if (initialActiveTab) {
                updateNavigationButtons({ // Update nav buttons for active tab
                    tabId: initialActiveTab.id,
                    canGoBack: initialActiveTab.canGoBack,
                    canGoForward: initialActiveTab.canGoForward,
                    isLoading: initialActiveTab.isLoading
                });
                 // Ensure the active tab element has the active class (updateTabsOrder should handle this)
                 const activeEl = findTabElement(initialActiveTab.id);
                 activeEl?.classList.add(CSS_CLASSES.ACTIVE_TAB);
                 activeEl?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        } else {
                // Should not happen if initialTabs > 0 and TM is initialized, but handle defensively
                console.warn("Titlebar: Initial tabs exist, but no active tab reported by TabManager.");
                 updateNavigationButtons(null); // Disable nav buttons
                 if (initialTabs[0]) TM.switchToTab(initialTabs[0].id); // Try activating the first one
            }
        } else {
            // No tabs exist initially, create the first one via TabManager
            console.log("Titlebar: No initial tabs found in TabManager, requesting default tab creation.");
            updateNavigationButtons(null); // Ensure buttons are disabled
            TM.createTab(undefined, true); // TM will create default and emit events
        }

        console.log("Titlebar: Initialization complete.");
    });

})(); // End of IIFE