// =============================================================================
// Main Process - main.js
// =============================================================================
// This file is the main entry point for the Electron application.
// It manages the application lifecycle, creates browser windows, and communicates
// with renderer processes using IPC.
// =============================================================================

// Load environment variables from .env file (if used)
require('dotenv').config();

// --- Electron and Node.js Modules ---
const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron'); // Added dialog back for menu logic
const path = require('path');                     // Module for working with paths

// --- Custom Application Modules ---
const customStore = require('./src/components/store/store.js'); // Settings management
const utils = require('./src/utils.js');                   // Utility functions (dock icon)
const splash = require('./splash.js');                     // Splash screen logic
const { registerIpcHandlers } = require('./src/ipcHandle.js'); // IPC handler registration (ensure this path is correct)

// --- Global Variables and Configuration ---
let mainWindow = null; // Reference to the main application window
const isDev = process.env.NODE_ENV !== 'production'; // Development environment detection
const useSplashScreen = process.env.SPLASH_SCREEN === 'true'; // Control splash screen via env variable

// --- Development Environment Setup (Hot Reload) ---
if (isDev) {
    setupDevelopmentEnvironment(); // Encapsulate dev setup
}

// =============================================================================
// Development Environment Setup Function
// =============================================================================
function setupDevelopmentEnvironment() {
    console.log('Setting up development environment (Hot Reload)...');
    // Configure electron-reload
    try {
        const electronReload = require('electron-reload');
        electronReload(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
            hardResetMethod: 'exit',
            watched: [ // Watched files and directories
                path.join(__dirname, 'src/'), // Watch entire src
                path.join(__dirname, 'public/'), // Watch entire public
                path.join(__dirname, 'main.js'),
                path.join(__dirname, 'splash.js'),
                path.join(__dirname, '*.js'), // Watch root JS files
            ],
            ignored: /node_modules|[\/\\]\.|dist|build/, // Ignore output/deps
            forceHardReset: false,
            awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
        });
        console.log('electron-reload configured.');
    } catch (err) {
        console.warn('electron-reload not found, skipping hot reload setup.', err);
    }

    // Configure chokidar for CSS-only reload
    try {
        const chokidar = require('chokidar');
        const cssWatcher = chokidar.watch(path.join(__dirname, '**/*.css'), { // Watch all CSS files
            ignored: /node_modules|dist|build/,
            persistent: true,
            awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 }
        });

        const notifyCssReload = () => {
            // Send to main window renderer and potentially all webviews
            if (mainWindow?.webContents) {
                mainWindow.webContents.send('css-reload');
                console.log('CSS reload notification sent to main renderer');
            }
            // TODO: Consider sending 'css-reload' to webviews if needed
        };
        cssWatcher.on('change', (filePath) => {
            console.log(`CSS file changed: ${filePath}`);
            notifyCssReload();
        });
        console.log('chokidar CSS watcher configured.');
    } catch (err) {
         console.warn('chokidar not found, skipping CSS-only reload setup.', err);
    }
}


// =============================================================================
// Main Window Creation Function
// =============================================================================
function createWindow() {
    console.log('Creating main window...');
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        show: false, // Show only when 'ready-to-show'
        frame: false,
        // macOS specific appearance
        vibrancy: 'under-window',
        visualEffectState: 'active',
        // Web Preferences for security and functionality
        webPreferences: {
            preload: path.join(__dirname, 'src/preload.js'),
            webviewTag: true,
            nodeIntegration: false,
            contextIsolation: true,
            allowRunningInsecureContent: false,
            spellcheck: true // Enable spellcheck
        },
    });

    // Load the main application page
    const indexHTML = path.join(__dirname, 'public', 'index.html');
    mainWindow.loadFile(indexHTML)
        .then(() => console.log(`Loaded index.html from: ${indexHTML}`))
        .catch(err => console.error(`Failed to load index.html: ${err}`));

    // Register IPC handlers (defined in ipcHandle.js)
    registerIpcHandlers(mainWindow);

    // --- Main Window Event Listeners ---
    mainWindow.on('closed', () => {
        console.log('Main window closed.');
        mainWindow = null; // Dereference the window object
    });

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error(`Main window failed to load content: ${errorDescription} (Code: ${errorCode}) URL: ${validatedURL}`);
        // TODO: Implement fallback or error page loading
    });

    // Show window gracefully when ready
    mainWindow.once('ready-to-show', () => {
        console.log('Main window is ready to show.');
        const splashAnimationDuration = useSplashScreen ? 2500 : 0; // Duration from splash animation

        if (useSplashScreen) {
            splash.animateAndDestroySplashWindow(splashAnimationDuration);
        }

        // Show the main window after the splash animation (or immediately if no splash)
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.show();
                console.log('Main window shown.');
                if (isDev) {
                    mainWindow.webContents.openDevTools({ mode: 'detach' });
                    console.log('Opening DevTools for main window.');
                }
            } else {
                console.log('Main window was destroyed before it could be shown.');
            }
        }, splashAnimationDuration);
    });
}

// =============================================================================
// Application Menu Definition
// =============================================================================
/**
 * Creates the application menu template.
 * @param {BrowserWindow} appWindow - Reference to the main window for IPC.
 * @returns {Array} The Electron menu template array.
 */
const createMenuTemplate = (appWindow) => {
    // Keep template concise, only include necessary items
    const template = [
        // App Menu (macOS)
        {
            label: app.name,
            submenu: [
                { role: 'about', label: `About ${app.name}` },
                { type: 'separator' },
                {
                    label: 'Settings...',
                    accelerator: 'CmdOrCtrl+,',
                    click: () => appWindow?.webContents?.send('open-settings')
                },
                {
                    label: 'Check for Updates...',
                    click: async () => {
                        console.log('Menu: Checking for updates... (placeholder)');
                        dialog.showMessageBox(appWindow, { // Use dialog module directly
                            type: 'info', title: 'Updates',
                            message: 'Update checking is not implemented yet.', buttons: ['OK']
                        }).catch(err => console.error("Error showing update dialog:", err)); // Add catch for safety
                    }
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        // Basic Edit Menu (Optional but recommended for copy/paste)
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' }, { role: 'redo' }, { type: 'separator' },
                { role: 'cut' }, { role: 'copy' }, { role: 'paste' },
                { role: 'selectAll' }
            ]
        },
         // Basic Window Menu
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' }, { role: 'zoom' },
                ...(process.platform === 'darwin' ? [
                    { type: 'separator' }, { role: 'front' }
                ] : [
                    { role: 'close' }
                ])
            ]
        }
    ];
    return template;
};


// =============================================================================
// Electron Application Lifecycle Events
// =============================================================================

// --- 'ready' event ---
app.whenReady().then(() => {
    console.log('Electron app is ready.');

    // Set dock icon (macOS only)
    if (process.platform === 'darwin') {
        utils.setDockIcon();
        console.log('Dock icon set (macOS).');
    }

    // Create splash screen if enabled
    if (useSplashScreen) {
        splash.createSplashWindow();
        console.log('Splash window created.');
    }

    // Create the main browser window
    createWindow(); // Creates and assigns mainWindow

    // Set the application menu (requires mainWindow for context)
    if (mainWindow) {
        const menuTemplate = createMenuTemplate(mainWindow);
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
        console.log('Custom application menu set.');
    } else {
        // Fallback if window creation failed before menu setup
        console.warn('Main window not available when setting menu, setting minimal fallback menu.');
        Menu.setApplicationMenu(Menu.buildFromTemplate([{ role: 'appMenu' }]));
    }
});

// --- 'activate' event (macOS) ---
app.on('activate', () => {
    // Re-create window if no windows are open when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
        console.log('App activated (macOS) - no windows open, creating main window.');
        createWindow();
    } else if (mainWindow && !mainWindow.isVisible()) {
        console.log('App activated (macOS) - main window hidden, showing.');
        mainWindow.show();
    } else if (mainWindow) {
        console.log('App activated (macOS) - main window visible, focusing.');
        mainWindow.focus();
    }
});

// --- 'window-all-closed' event ---
app.on('window-all-closed', () => {
    console.log('All windows closed.');
    // Quit the app on Windows/Linux
    if (process.platform !== 'darwin') {
        console.log('Quitting app (non-macOS).');
        app.quit();
    }
    // On macOS, app usually stays active. Uncomment below to quit on macOS too.
    // app.quit();
});

// --- Additional IPC Handlers (that don't belong in ipcHandle.js) ---

// Example: Handler for getting app version needed by settings page preload
ipcMain.handle('get-app-version', () => {
    console.log('IPC: Request for app version received.');
    return app.getVersion();
});

// No specific handler needed in main.js for 'theme-change-request'
// as it's renderer-to-renderer communication facilitated by preload.
// Just ensure the preload script allows the channel if using the optional method.

// =============================================================================
// End of main.js file
// =============================================================================