const { BrowserWindow } = require('electron');
const path = require('path');
const utils = require('./src/utils.js');

let splashWindow = null;

/**
 * Vytvoří a zobrazí okno splash screenu.
 * @returns {BrowserWindow} Instance vytvořeného okna.
 */
function createSplashWindow() {
    // get window position
  
  if (splashWindow) {
    return splashWindow; // Pokud už existuje, vrátíme ho
  }

  
  splashWindow = new BrowserWindow({
    width: 300,
 
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    center: true,
    skipTaskbar: true, // Nezobrazovat v taskbaru
  });

  console.error(splashWindow.getBounds());

  const splashPath = path.join(__dirname, 'public', 'views', 'splash', 'splash.html');
  splashWindow.loadFile(splashPath);
  splashWindow.center();

  // Dočasně přidejte toto pro otevření DevTools
  /* splashWindow.webContents.openDevTools({ mode: 'detach' }); */

  // Zabráníme zavření splash okna uživatelem (i když nemá rám)
  splashWindow.on('close', (event) => {
     event.preventDefault();
  });

  // Uvolníme paměť, když je okno explicitně zničeno
  splashWindow.on('closed', () => {
    splashWindow = null;
  });

  return splashWindow;
}

/**
 * Zavře a zničí okno splash screenu, pokud existuje.
 */
function destroySplashWindow() {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.destroy();
  }
  splashWindow = null; // Odstraníme referenci
}

/**
 * Spustí animaci zmizení (fade-out) na splash screenu a poté ho zničí.
 * @param {number} [duration=500] - Doba trvání animace v milisekundách.
 */
function animateAndDestroySplashWindow(duration = 500) {
  if (!splashWindow || splashWindow.isDestroyed()) {
    return; // Nic nedělat, pokud okno neexistuje
  }

  console.log(`Starting splash screen fade out (${duration}ms)...`);
  // Spustíme JavaScript v renderer procesu splash okna, který přidá třídu pro animaci
  splashWindow.webContents.executeJavaScript('document.body.classList.add("fade-out");', true)
    .then(() => {
      console.log('Fade-out class added to splash body.');
      // Nastavíme časovač, který zničí okno po době trvání animace
      setTimeout(() => {
        console.log('Destroying splash window after animation.');
        destroySplashWindow();
      }, duration);
    })
    .catch(err => {
      console.error('Failed to execute fade-out script in splash window:', err);
      // Pokud se skript nepodaří spustit, okno zničíme rovnou
      destroySplashWindow();
    });
}

module.exports = {
  createSplashWindow,
  destroySplashWindow,
  animateAndDestroySplashWindow,
}; 