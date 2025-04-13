const SettingsManager = {
    init() {
        this.sidebarItems = document.querySelectorAll('.settings-menu li');
        this.sections = document.querySelectorAll('.settings-section');
        this.setupEventListeners();
        this.loadSettings();

        // Listen for theme changes from the main window
        if (window.electronAPI?.onThemeChanged) {
            window.electronAPI.onThemeChanged((newTheme) => {
                document.documentElement.setAttribute('data-theme', newTheme);
                const themeSelect = document.querySelector('select[data-setting="theme"]');
                if (themeSelect) themeSelect.value = newTheme;
            });
        }
    },

    setupEventListeners() {
        // Sidebar navigation
        this.sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const sectionId = item.dataset.section;
                this.activateSection(sectionId);
            });
        });

        // Form controls
        document.querySelectorAll('select, input').forEach(control => {
            control.addEventListener('change', (e) => {
                this.handleSettingChange(e.target);
            });
        });
    },

    activateSection(sectionId) {
        // Update sidebar active state
        this.sidebarItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === sectionId);
        });

        // Show selected section, hide others
        this.sections.forEach(section => {
            section.classList.toggle('hidden', section.id !== sectionId);
        });
    },

    async loadSettings() {
        try {
            if (window.electronAPI?.getSettings) {
                const settings = await window.electronAPI.getSettings();
                this.applySettings(settings);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    },

    applySettings(settings) {
        // Apply theme
        if (settings?.theme) {
            const themeSelect = document.querySelector('select[data-setting="theme"]');
            if (themeSelect) themeSelect.value = settings.theme;
        }

        // Apply homepage
        if (settings?.homepage) {
            const homepageInput = document.querySelector('input[data-setting="homepage"]');
            if (homepageInput) homepageInput.value = settings.homepage;
        }

        // Apply other settings as needed
        if (settings?.doNotTrack) {
            const dntCheckbox = document.querySelector('input[data-setting="doNotTrack"]');
            if (dntCheckbox) dntCheckbox.checked = settings.doNotTrack;
        }
    },

    async handleSettingChange(control) {
        if (!window.electronAPI?.saveSettings) return;

        try {
            const settings = await window.electronAPI.getSettings();
            const setting = control.dataset.setting;
            const value = control.type === 'checkbox' ? control.checked : control.value;

            const updatedSettings = {
                ...settings,
                [setting]: value
            };

            const result = await window.electronAPI.saveSettings(updatedSettings);
            
            // If theme changed, apply it immediately across all windows
            if (setting === 'theme') {
                // Apply theme to current window
                document.documentElement.setAttribute('data-theme', value);
                
                // Immediately notify all windows about theme change
                if (window.electronAPI?.setTheme) {
                    await window.electronAPI.setTheme(value);
                }
                
                // Update any webviews in the current window
                if (window.TabManager && typeof window.TabManager.updateAllWebviewsTheme === 'function') {
                    window.TabManager.updateAllWebviewsTheme(value);
                }
            }
        } catch (error) {
            console.error('Error saving setting:', error);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SettingsManager.init();
});


