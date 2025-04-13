/**
 * settings.js - Logic for the settings page (settings.html)
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const sidebarLinks = document.querySelectorAll('.settings-sidebar ul li a');
    const contentSections = document.querySelectorAll('.settings-content section');
    const themeToggle = document.getElementById('theme-toggle');
    const homepageSelect = document.getElementById('homepage-select');
    const customHomepageContainer = document.querySelector('.custom-homepage-input-container');
    const customHomepageInput = document.getElementById('custom-homepage-input');
    const chooseFolderButton = document.getElementById('choose-folder-button');
    const downloadPathDisplay = document.getElementById('download-path-display');
    const resetSettingsButton = document.getElementById('reset-settings-button');
    const applySettingsButton = document.getElementById('apply-settings-button');
    const appVersionSpan = document.getElementById('app-version');

    // --- State ---
    let currentSettings = {}; // Cache for loaded settings
    let pendingChanges = {}; // Store changes before applying

    // --- Helper Functions ---

    /** Mark a setting as changed and enable Apply button */
    function markChanged(key, value) {
        pendingChanges[key] = value;
        if (applySettingsButton) applySettingsButton.disabled = false;
        console.log('Pending changes:', pendingChanges);
    }

    /** Reset pending changes and disable Apply button */
    function clearPendingChanges() {
        pendingChanges = {};
        if (applySettingsButton) applySettingsButton.disabled = true;
         console.log('Pending changes cleared.');
    }

    /** Displays the selected download path, truncating if necessary.
     * @param {string} path - The full download path.
     */
    function displayDownloadPath(path) {
        if (downloadPathDisplay) {
            if (path) {
                // Simple truncation logic (you might want more sophisticated path shortening)
                const maxLength = 30;
                const truncatedPath = path.length > maxLength
                    ? '...' + path.slice(-(maxLength - 3))
                    : path;
                downloadPathDisplay.textContent = truncatedPath;
                downloadPathDisplay.title = path; // Full path in tooltip
            } else {
                downloadPathDisplay.textContent = 'Not set';
                downloadPathDisplay.title = 'Download location not set';
            }
        }
    }

    /** Shows or hides the custom homepage input field */
    function toggleCustomHomepageInput(show) {
        if (customHomepageContainer) {
            customHomepageContainer.style.display = show ? 'block' : 'none';
        }
    }

    /** Updates the UI elements based on the provided settings object.
     * @param {object} settings - The settings object.
     */
    function applySettingsToUI(settings) {
        if (!settings) return;

        // Apply theme
        const currentTheme = settings.theme || 'light';
        document.documentElement.setAttribute('data-theme', currentTheme);
        if (themeToggle) themeToggle.checked = currentTheme === 'dark';

        // Set homepage
        if (homepageSelect && settings.homepage) {
            const homepage = settings.homepage;
            const isPredefined = Array.from(homepageSelect.options).some(opt => opt.value === homepage && opt.value !== 'custom');

            if (isPredefined) {
                // Saved value is one of the predefined options (Google, DDG, Blank)
                homepageSelect.value = homepage;
                toggleCustomHomepageInput(false); // Hide custom input
                 if (customHomepageInput) customHomepageInput.value = ''; // Clear custom input value
            } else {
                // Saved value is not predefined, assume it's custom
                homepageSelect.value = 'custom'; // Select the 'custom' option
                if (customHomepageInput) customHomepageInput.value = homepage; // Populate custom input
                toggleCustomHomepageInput(true); // Show custom input
            }
        } else {
            // No homepage setting exists, default to Google
             homepageSelect.value = 'https://www.google.com';
             toggleCustomHomepageInput(false);
             if (customHomepageInput) customHomepageInput.value = ''; // Clear custom input
        }

        // Set download path
        displayDownloadPath(settings.downloadPath);

        // Set app version (if available through preload)
        if (appVersionSpan && window.electronAPI?.getAppVersion) {
            window.electronAPI.getAppVersion().then(version => {
                if (appVersionSpan) appVersionSpan.textContent = version || 'N/A';
            }).catch(err => {
                 console.error("Failed to get app version:", err);
                 if (appVersionSpan) appVersionSpan.textContent = 'Error';
            });
        }
    }

    // --- Core Functions ---

    /** Loads settings and applies them */
    async function loadSettings() {
        try {
            console.log('Settings page: Requesting settings...');
            const settings = await window.electronAPI?.getSettings();
            console.log('Settings page: Received settings:', settings);
            if (settings) {
                currentSettings = settings;
                applySettingsToUI(currentSettings);
                clearPendingChanges(); // Clear changes and disable Apply button after load
            } else {
                console.error('Settings page: Failed to load settings.');
            }
        } catch (error) {
            console.error('Settings page: Error loading settings:', error);
        }
    }

    /** Saves all pending changes */
    async function applyPendingChanges() {
        if (Object.keys(pendingChanges).length === 0) {
            console.log('Settings page: No changes to apply.');
            return;
        }

        const settingsToSave = { ...currentSettings, ...pendingChanges };
        console.log('Settings page: Applying changes:', settingsToSave);

        try {
            const result = await window.electronAPI?.saveSettings(settingsToSave);
            if (result?.success) {
                console.log('Settings page: Changes applied successfully.');
                currentSettings = settingsToSave; // Update local cache
                clearPendingChanges(); // Reset pending changes and disable button
            } else {
                console.error('Settings page: Failed to apply changes:', result?.error || 'Unknown error');
                // Show error to user?
            }
        } catch (error) {
            console.error(`Settings page: Error applying changes:`, error);
            // Show error to user?
        }
    }

    // --- Event Listeners ---

    // Sidebar Navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.getAttribute('data-section');
            if (!sectionName) return;

            // Update active link
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update active content section
            contentSections.forEach(s => s.classList.remove('active'));
            const sectionId = `${sectionName}-section`;
            document.getElementById(sectionId)?.classList.add('active');
        });
    });

    // Theme Toggle
    if (themeToggle) {
        themeToggle.addEventListener('change', () => {
            const newTheme = themeToggle.checked ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme); // Update settings page preview immediately

            // --- Optional: Send direct theme change signal ---
            console.log(`Settings page: Sending immediate theme-change-request: ${newTheme}`);
            window.electronAPI?.send('theme-change-request', newTheme);
            // --- End Optional ---

            markChanged('theme', newTheme); // Still mark for saving via Apply button
        });
    }

    // Homepage Select
    if (homepageSelect) {
        homepageSelect.addEventListener('change', () => {
            const selectedValue = homepageSelect.value;
            if (selectedValue === 'custom') {
                toggleCustomHomepageInput(true);
                // Don't mark changed yet, wait for input in the custom field
            } else {
                toggleCustomHomepageInput(false);
                if (customHomepageInput) customHomepageInput.value = ''; // Clear custom input when switching away
                markChanged('homepage', selectedValue); // Mark predefined change
            }
        });
    }

    // Custom Homepage Input
    if (customHomepageInput) {
        customHomepageInput.addEventListener('input', () => {
             // Only mark changed if the "Custom" option is selected
             if (homepageSelect.value === 'custom') {
                 markChanged('homepage', customHomepageInput.value.trim());
             }
        });
    }

    // Choose Folder Button
    if (chooseFolderButton) {
        chooseFolderButton.addEventListener('click', async () => {
            try {
                const folderPath = await window.electronAPI?.chooseFolder();
                if (folderPath) {
                    console.log('Settings page: Folder chosen:', folderPath);
                    displayDownloadPath(folderPath); // Update UI preview
                    markChanged('downloadPath', folderPath); // Mark change
                } else {
                    console.log('Settings page: Folder selection cancelled.');
                }
            } catch (error) {
                console.error('Settings page: Error choosing folder:', error);
            }
        });
    }

    // Apply Settings Button
    if (applySettingsButton) {
        applySettingsButton.addEventListener('click', applyPendingChanges);
    }

    // Reset Settings Button
    if (resetSettingsButton) {
        resetSettingsButton.addEventListener('click', async () => {
            console.log('Settings page: Reset button clicked.');
            try {
                // Optional: Confirmation Dialog
                // if (!confirm("Are you sure you want to reset all settings to their defaults?")) return;

                const defaultSettings = await window.electronAPI?.resetSettings();
                console.log('Settings page: Received default settings after reset:', defaultSettings);
                if (defaultSettings) {
                    currentSettings = defaultSettings; // Update cache
                    applySettingsToUI(currentSettings); // Update UI
                    clearPendingChanges(); // Reset pending state
                    console.log('Settings page: Settings reset and UI updated.');
                } else {
                    console.error('Settings page: Failed to reset settings (API returned null/error).');
                }
            } catch (error) {
                console.error('Settings page: Error resetting settings:', error);
            }
        });
    }

    // Listen for external updates
    if (window.electronAPI?.onSettingsUpdated) {
        window.electronAPI.onSettingsUpdated((updatedSettings) => {
            console.log('Settings page: Received settings update from backend:', updatedSettings);
            currentSettings = updatedSettings;
            applySettingsToUI(currentSettings);
            clearPendingChanges(); // Clear local pending changes if external update occurs
        });
    }

    // --- Initial Load ---
    loadSettings();
}); 