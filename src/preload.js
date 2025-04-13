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
  onSettingsSaved: (callback) => ipcRenderer.on('settings-saved', (_event) => callback())
});

console.log('Preload script loaded and electronAPI exposed.');