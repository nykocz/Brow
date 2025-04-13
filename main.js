// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const customStore = require('./src/components/store/store.js');

// Přidat: Načtení nastavení při startu pomocí customStore
let currentSettings = customStore.getSettings();

// Aktualizovaná DEFAULT_URL - použijeme načtená nastavení
let DEFAULT_URL = currentSettings.homepage;

// Přidání electron-reload pro hot reload
const isDev = process.env.NODE_ENV !== 'production';
if (isDev) {
  const electronReload = require('electron-reload');
  electronReload(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    hardResetMethod: 'exit',
    // Sledovat tyto soubory a adresáře pro změny
    watched: [
      path.join(__dirname, 'src/**/*.js'),
      path.join(__dirname, 'src/**/*.css'),
      path.join(__dirname, 'public/**/*'),
      path.join(__dirname, 'main.js'),
    ],
    // Ignorovat node_modules
    ignored: /node_modules|[\/\\]\./,
    // Funkce volaná před reloadem
    forceHardReset: false,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });
  
  // Doplňková funkce pro oznámení preload skriptu o hot reloadu
  const notifyReload = () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('app-reload');
      console.log('Hot reload notification sent to renderer');
    }
  };
  
  // Specialní notifikace pro CSS změny
  const notifyCssReload = () => {
    if (mainWindow && mainWindow.webContents) {
      mainWindow.webContents.send('css-reload');
      console.log('CSS reload notification sent to renderer');
    }
  };
  
  // Sleduj změny v CSS souborech samostatně (bez restartování celé aplikace)
  const chokidar = require('chokidar');
  const cssWatcher = chokidar.watch(path.join(__dirname, 'src/**/*.css'), {
    ignored: /node_modules/,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100
    }
  });
  
  cssWatcher.on('change', (path) => {
    console.log(`CSS file changed: ${path}`);
    notifyCssReload();
  });
}

// Promněná pro uchování instance hlavního okna
let mainWindow;

function createWindow() {
  // Detekce macOS
  const isMacOS = process.platform === 'darwin';

  // Vytvoření okna prohlížeče.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    vibrancy: 'under-window',
    visualEffectState: 'active',
  
    webPreferences: {
      preload: path.join(__dirname, 'src/preload.js'), 
      webviewTag: true, 
      nodeIntegration: false, 
      contextIsolation: true, 
      // Povolení načítání lokálních souborů, pokud by bylo potřeba
      // webSecurity: false, // Nedoporučeno pro produkci!
      allowRunningInsecureContent: false, // Ponechat na false
    },
  });

  // Načtení index.html do okna.
  mainWindow.loadFile('public/index.html');

  // Otevření DevTools (pro ladění)
  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  // --- Komunikace pro ovládání okna z vlastního titlebaru ---
  ipcMain.on('minimize-window', () => mainWindow.minimize());
  ipcMain.on('maximize-window', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });
  ipcMain.on('close-window', () => mainWindow.close());
  ipcMain.on('reload-content', () => mainWindow.reload());

  // --- Komunikace pro Nastavení ---
  ipcMain.handle('get-settings', async () => {
    try {
      // Vracíme aktuálně načtená nastavení (nebo je znovu načteme)
      return customStore.getSettings(); // Vždy vrátí nejaktuálnější z disku
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null; // Nebo vrátit výchozí hodnoty?
    }
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      console.log('Received settings to save:', settings);
      // Uložíme nastavení pomocí customStore
      const success = customStore.saveSettings(settings);

      if (success) {
        // Aktualizace lokální proměnné a DEFAULT_URL
        currentSettings = settings; // Aktualizujeme držená nastavení v paměti
        DEFAULT_URL = settings.homepage;
        console.log('Settings saved successfully. New homepage:', DEFAULT_URL);
        // Můžeme poslat zprávu zpět do rendereru, pokud je potřeba
        if (mainWindow && mainWindow.webContents) {
           mainWindow.webContents.send('settings-updated-backend', currentSettings);
        }
        return { success: true };
      } else {
         // Pokud saveSettings vrátilo false
         console.error('Failed to save settings using custom store.');
         return { success: false, error: 'Failed to write settings file.' };
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Nová metoda pro resetování nastavení na výchozí hodnoty
  ipcMain.handle('reset-settings', async () => {
    try {
      const defaultSettings = customStore.resetSettings();
      if (defaultSettings) {
        currentSettings = defaultSettings;
        DEFAULT_URL = defaultSettings.homepage;
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('settings-updated-backend', defaultSettings);
        }
        return defaultSettings;
      } else {
        return customStore.DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return null;
    }
  });
  
  // Dialog pro výběr složky (pro nastavení složky pro stahování)
  ipcMain.handle('choose-folder', async () => {
    try {
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Vyberte složku pro stahování souborů'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
      }
      return null;
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
      return null;
    }
  });
  
   // Listener pro případné další akce po změně nastavení
   ipcMain.on('settings-changed', (event, settings) => {
     console.log('Settings changed signal received in main:', settings);
     // Zde můžete provést další akce, např. aktualizovat UI hlavního okna
   });
}

// Tato metoda bude volána, když je Electron připravený.
app.whenReady().then(() => {
  createWindow();

  // Znovu vytvoření okna na macOS, když se klikne na ikonu v docku a nejsou žádná okna otevřená.
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Ukončení aplikace, když jsou všechna okna zavřená (kromě macOS).
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') { // 'darwin' je kódové označení pro macOS
    app.quit();
  }
  app.quit();
});