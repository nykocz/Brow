// src/components/store/store.js
const fs = require('fs');
const path = require('path');
const { app } = require('electron'); // Potřebujeme app pro userData cestu

const CONFIG_FORMATS = {
  JSON: 'json',
  INI: 'ini'
};

// Výchozí formát konfigurace
const CONFIG_FORMAT = CONFIG_FORMATS.INI; 

const SETTINGS_FILE_NAME = CONFIG_FORMAT === CONFIG_FORMATS.INI 
  ? 'settings.ini' 
  : 'settings.json';

// Získání cesty ke složce pro uživatelská data specifická pro aplikaci
// Tato cesta je vhodná pro ukládání konfiguračních souborů
const SETTINGS_FILE_PATH = path.join(app.getPath('userData'), SETTINGS_FILE_NAME);

// Výchozí nastavení, pokud soubor neexistuje nebo je poškozený
const DEFAULT_SETTINGS = {
  homepage: 'https://www.google.com',
  searchEngine: 'google',
  downloadPath: app.getPath('downloads'),
  clearOnExit: false,
  enableNotifications: true
};

function loadSettings() {
  const settings = getSettings();
  return settings;
}

/**
 * Převede objekt nastavení na formát INI
 * @param {Object} settings - Objekt s nastavením
 * @returns {string} - INI formátovaný řetězec
 */
function convertToIni(settings) {
  let iniContent = '[Settings]\n';
  
  for (const [key, value] of Object.entries(settings)) {
    // Pro booleanovské hodnoty použijeme 1/0 místo true/false
    if (typeof value === 'boolean') {
      iniContent += `${key}=${value ? '1' : '0'}\n`;
    } 
    // Pro objekty/pole použijeme JSON.stringify (méně čitelné, ale funkční)
    else if (typeof value === 'object') {
      iniContent += `${key}=${JSON.stringify(value)}\n`;
    } 
    // Pro ostatní typy použijeme přímo hodnotu
    else {
      iniContent += `${key}=${value}\n`;
    }
  }
  
  return iniContent;
}

/**
 * Převede INI formátovaný řetězec na objekt nastavení
 * @param {string} iniContent - INI formátovaný řetězec
 * @returns {Object} - Objekt s nastavením
 */
function parseIni(iniContent) {
  const settings = {};
  const lines = iniContent.split('\n');
  
  // Přeskočíme řádek [Settings] nebo prázdné řádky
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Přeskočíme komentáře, prázdné řádky nebo sekce
    if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('#') || 
        trimmedLine.startsWith('[')) {
      continue;
    }
    
    // Rozdělíme řádek na klíč a hodnotu
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex > 0) {
      const key = trimmedLine.substring(0, equalIndex).trim();
      const valueStr = trimmedLine.substring(equalIndex + 1).trim();
      
      let value;
      
      // Pokusíme se detekovat typ hodnoty
      if (valueStr === '1' || valueStr === 'true') {
        value = true;
      } else if (valueStr === '0' || valueStr === 'false') {
        value = false;
      } else if (!isNaN(valueStr) && valueStr !== '') {
        // Detekce čísel
        value = Number(valueStr);
      } else if ((valueStr.startsWith('{') && valueStr.endsWith('}')) || 
                (valueStr.startsWith('[') && valueStr.endsWith(']'))) {
        // Pokus o parsování JSONu (pro objekty/pole)
        try {
          value = JSON.parse(valueStr);
        } catch (e) {
          value = valueStr; // Pokud parsování selže, ponecháme řetězec
        }
      } else {
        value = valueStr;
      }
      
      settings[key] = value;
    }
  }
  
  return settings;
}

// Načte nastavení ze souboru
function getSettings() {
  try {
    // Zkusíme přečíst soubor s nastavením
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const data = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      
      let settings;
      
      // Parsování podle formátu
      if (CONFIG_FORMAT === CONFIG_FORMATS.INI) {
        settings = parseIni(data);
      } else {
        settings = JSON.parse(data);
      }
      
      // Sloučíme načtená nastavení s výchozími, abychom zajistili,
      // že všechny klíče existují, i když byly přidány později
      return { ...DEFAULT_SETTINGS, ...settings };
    } else {
      // Pokud soubor neexistuje, vrátíme výchozí nastavení
      // a rovnou ho zkusíme uložit pro příští spuštění
      saveSettings(DEFAULT_SETTINGS);
      return DEFAULT_SETTINGS;
    }
  } catch (error) {
    console.error(`Error reading settings file (${SETTINGS_FILE_PATH}):`, error);
    // V případě chyby (např. poškozený JSON) vrátíme výchozí nastavení
    return DEFAULT_SETTINGS;
  }
}

// Uloží nastavení do souboru
function saveSettings(settings) {
  try {
    let data;
    
    // Formátování podle vybraného formátu
    if (CONFIG_FORMAT === CONFIG_FORMATS.INI) {
      data = convertToIni(settings);
    } else {
      data = JSON.stringify(settings, null, 2); // null, 2 pro hezčí formátování JSONu
    }
    
    fs.writeFileSync(SETTINGS_FILE_PATH, data, 'utf-8');
    console.log(`Settings saved successfully to ${SETTINGS_FILE_PATH}`);
    return true; // Signalizace úspěchu
  } catch (error) {
    console.error(`Error writing settings file (${SETTINGS_FILE_PATH}):`, error);
    return false; // Signalizace neúspěchu
  }
}

/**
 * Obnoví výchozí nastavení
 * @returns {Object} - Výchozí nastavení
 */
function resetSettings() {
  try {
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error(`Error resetting settings:`, error);
    return null;
  }
}

module.exports = {
  getSettings,
  saveSettings,
  resetSettings,
  CONFIG_FORMATS,
  DEFAULT_SETTINGS,
  loadSettings
};