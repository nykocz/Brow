const path = require('path');
const { app } = require('electron');
const { BrowserWindow } = require('electron');

const utils = {
    isMacOS: () => process.platform === 'darwin',
    isWindows: () => process.platform === 'win32',
    isLinux: () => process.platform === 'linux',
    

    setDockIcon: function() {
        if (utils.isMacOS()) {
            app.dock.setIcon(path.join(__dirname, '../assets/brow.png'));
        }
    },

    setWindowPos: function(window, x, y) {
        window.setBounds({x: x, y: y});
    },

    getWindowPos: function(window) {
        return window.getBounds();
    }
}

module.exports = utils;