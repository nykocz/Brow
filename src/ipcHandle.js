const { ipcMain, dialog } = require('electron');
const customStore = require('../src/components/store/store.js');

// Funkce pro registraci všech IPC handlerů
// Přijímá instanci mainWindow, protože některé handlery ji potřebují
function registerIpcHandlers(mainWindow) {
  if (!mainWindow) {
    console.error('Cannot register IPC handlers without a mainWindow instance.');
    return;
  }

  // --- 1. Ovládání okna ---
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

  // --- 2. API pro Nastavení ---
  ipcMain.handle('get-settings', async () => {
    try {
      // Vždy načítáme aktuální nastavení přímo z úložiště
      return customStore.getSettings();
    } catch (error) {
      console.error('Failed to get settings:', error);
      return null;
    }
  });

  ipcMain.handle('save-settings', async (event, settings) => {
    try {
      console.log('Received settings to save:', settings);
      const success = customStore.saveSettings(settings);
      if (success) {
        console.log('Settings saved successfully via custom store.');
        // Oznámíme renderer procesu, že nastavení byla aktualizována
        if (mainWindow && mainWindow.webContents) {
          // Pošleme nově uložená nastavení (načtená znovu pro jistotu)
          mainWindow.webContents.send('settings-updated-backend', customStore.getSettings());
        }
        return { success: true };
      } else {
         console.error('Failed to save settings using custom store.');
         return { success: false, error: 'Failed to write settings file.' };
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('reset-settings', async () => {
    try {
      const defaultSettings = customStore.resetSettings();
      if (defaultSettings) {
        console.log('Settings reset successfully via custom store.');
        // Oznámíme renderer procesu, že nastavení byla resetována
        if (mainWindow && mainWindow.webContents) {
          mainWindow.webContents.send('settings-updated-backend', defaultSettings);
        }
        return defaultSettings;
      } else {
        console.error('Failed to reset settings using custom store.');
        // V případě chyby vrátíme alespoň výchozí konstanty
        return customStore.DEFAULT_SETTINGS;
      }
    } catch (error) {
      console.error('Failed to reset settings:', error);
      return null;
    }
  });

  // --- 3. Dialog pro výběr složky ---
  ipcMain.handle('choose-folder', async () => {
    try {
      // Použijeme předanou instanci mainWindow pro zobrazení dialogu
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

   // --- 4. Obecný listener pro změny nastavení (pokud by byl potřeba pro další akce v main) ---
   // Tento listener zůstává, pokud by jiné části main procesu potřebovaly reagovat.
   ipcMain.on('settings-changed', (event, settings) => {
     console.log('Settings changed signal received in main:', settings);
     // Zde mohou být další akce v main procesu...
   });

   console.log('IPC handlers registered.');
}

module.exports = {
  registerIpcHandlers,
}; 