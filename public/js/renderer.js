// src/renderer.js
// Theme management functions
const toggleTheme = () => {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    root.setAttribute('data-theme', newTheme);


    // Update theme icon
    const themeIcon = document.querySelector('#theme-toggle-button i');
    themeIcon.className = `fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}`;

    // Save theme preference
    if (window.electronAPI && window.electronAPI.saveSettings) {
        window.electronAPI.getSettings().then(settings => {
            const updatedSettings = { ...settings, theme: newTheme };
            window.electronAPI.saveSettings(updatedSettings);
        });
    }
};

const applyTheme = (theme) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);

    // Update theme icon
    const themeIcon = document.querySelector('#theme-toggle-button i');
    if (themeIcon) {
        themeIcon.className = `fas fa-${theme === 'dark' ? 'sun' : 'moon'}`;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleButton = document.getElementById('theme-toggle-button');

    // Load and apply saved theme
    if (window.electronAPI && window.electronAPI.getSettings) {
        window.electronAPI.getSettings().then(settings => {
            if (settings && settings.theme) {
                applyTheme(settings.theme);
            }
        });
    }

    // Add theme toggle listener
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
});