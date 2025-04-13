// src/preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Posluchač pro hot reload události
ipcRenderer.on('app-reload', () => {
  console.log('Hot reload triggered, refreshing content...');
  
  // Vytvoř a spusť událost pro renderer proces
  const event = new Event('app-reload');
  document.dispatchEvent(event);
  
  // Najít všechny webview v dokumentu a obnovit jejich obsah (pouze pro about:settings ?)
  // Zvážit, zda je toto chování žádoucí pro všechny stránky
  setTimeout(() => {
    if (document.location.href.includes('views/settings/settings.html')) {
        console.log('Reloading settings page content due to hot-reload...');
        document.location.reload();
    } else {
        const webviews = document.querySelectorAll('webview');
        webviews.forEach(webview => {
          const currentURL = webview.getURL();
          if (currentURL && !currentURL.startsWith('file://')) { // Neobnovovat lokální soubory
            webview.reload();
          }
        });
    }
  }, 500); // Krátká prodleva pro dokončení DOM operací
});

// Vystavíme bezpečně funkce do renderer procesu pod globálním objektem 'electronAPI'
contextBridge.exposeInMainWorld('electronAPI', {
  // Ovládání okna
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  
  // Nastavení
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  settingsChanged: (settings) => ipcRenderer.send('settings-changed', settings),
  notifySettingsChanged: (settings) => ipcRenderer.send('settings-changed', settings),
  
  // Dialog pro výběr složky
  chooseFolder: () => ipcRenderer.invoke('choose-folder'),

  // Ostatní
  reloadContent: () => ipcRenderer.send('reload-content'),
  onCssReload: (callback) => {
    ipcRenderer.on('css-reload', () => callback());
  },

  // Příjem zpráv z hlavního procesu
  onSettingsUpdated: (callback) => ipcRenderer.on('settings-updated-backend', (_event, value) => callback(value)),
  
  // Přidáno: Událost pro uložení nastavení
  onSettingsSaved: (callback) => ipcRenderer.on('settings-saved', (_event) => callback()),

  // --- Theme Updates (if needed for main process to react) ---
  // onThemeChange: (callback) => ipcRenderer.on('theme-changed', (_event, theme) => callback(theme)), // Example

  // --- App Info (Example) ---
  getAppVersion: () => ipcRenderer.invoke('get-app-version'), // Need handler in main.js

  // --- General IPC (for sending messages TO main process) ---
  send: (channel, data) => ipcRenderer.send(channel, data),
  // --- General IPC (for receiving messages FROM main process) ---
  on: (channel, func) => {
    const validChannels = ['css-reload', 'app-reload', 'open-settings', 'settings-updated-backend', 'theme-change-request'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    } else {
      console.warn(`Preload: Ignored attempt to listen on invalid channel: ${channel}`);
    }
  },
  // --- Remove listener ---
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Listener for updates AFTER saving (still useful)
ipcRenderer.on('settings-updated-backend', (_event, settings) => {
  const theme = settings?.theme || 'light';
  console.log(`Preload (${document.location.href}): Settings updated backend received. Applying theme: ${theme}`);
  try {
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    console.error('Preload: Error setting data-theme attribute from backend update:', e);
  }
});

// Set initial theme based on settings potentially received early
ipcRenderer.invoke('get-settings').then(settings => {
   const theme = settings?.theme || 'light';
   console.log(`Preload (${document.location.href}): Applying initial theme: ${theme}`);
    try {
        document.documentElement.setAttribute('data-theme', theme);
    } catch(e) {
         console.error('Preload: Error setting initial data-theme attribute:', e);
    }
}).catch(err => console.error('Preload: Error getting initial settings for theme:', err));

// Add a listener specifically for the immediate theme update request
ipcRenderer.on('theme-change-request', (_event, newTheme) => {
    console.log(`Preload (${document.location.href}): Immediate theme change request received: ${newTheme}`);
     try {
        document.documentElement.setAttribute('data-theme', newTheme);

        if (window.tabManager && typeof window.tabManager.updateAllWebviewsTheme === 'function') {
             console.log(`Preload (Main Window): Triggering immediate webview theme update to: ${newTheme}`);
             window.tabManager.updateAllWebviewsTheme(newTheme);
        } else {
            // console.log(`Preload (Settings Page?): Not updating webviews from here.`);
        }
    } catch (e) {
        console.error(`Preload (${document.location.href}): Error setting data-theme attribute on immediate request:`, e);
    }
});

console.log('Preload script executed and electronAPI exposed.');