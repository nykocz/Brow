// src/renderer.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("Renderer initialized.");
    
    // Získání referencí na prvky uživatelského rozhraní
    const urlInput = document.getElementById('url-input');
    const backButton = document.getElementById('back-button');
    const forwardButton = document.getElementById('forward-button');
    const reloadButton = document.getElementById('reload-button');
    const webviewContainer = document.getElementById('webview-container');
    const newTabButton = document.getElementById('new-tab-button');
    
    // Na začátku zkontrolujeme, zda existuje alespoň jedna záložka
    // Pokud ne, případné zpracování vytvoří záložku
    
    // Funkce pro aktualizaci navigačních tlačítek
    function updateNavigationButtons() {
        // Najdeme aktivní webview
        const activeWebview = webviewContainer.querySelector('.active-webview');
        if (!activeWebview) {
            // Pokud není žádné aktivní webview, zakážeme navigační tlačítka
            backButton.disabled = true;
            forwardButton.disabled = true;
            return;
        }
        
        // Aktualizujeme stav tlačítek podle možností navigace
        backButton.disabled = !activeWebview.canGoBack();
        forwardButton.disabled = !activeWebview.canGoForward();
    }
    
    // Event listenery pro navigační tlačítka
    backButton.addEventListener('click', () => {
        const activeWebview = webviewContainer.querySelector('.active-webview');
        if (activeWebview && activeWebview.canGoBack()) {
            activeWebview.goBack();
        }
    });
    
    forwardButton.addEventListener('click', () => {
        const activeWebview = webviewContainer.querySelector('.active-webview');
        if (activeWebview && activeWebview.canGoForward()) {
            activeWebview.goForward();
        }
    });
    
    reloadButton.addEventListener('click', () => {
        const activeWebview = webviewContainer.querySelector('.active-webview');
        if (activeWebview) {
            activeWebview.reload();
        }
    });
    
    // Event listener pro adresní řádek
    urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            let url = urlInput.value.trim();
            
            // Přidáme protokol, pokud chybí
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                // Pokud vypadá jako doména, přidáme https://
                if (url.includes('.') && !url.includes(' ')) {
                    url = `https://${url}`;
                } else {
                    // Jinak předpokládáme vyhledávání
                    url = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
                }
            }
            
            // Získáme aktivní webview a navigujeme
            const activeWebview = webviewContainer.querySelector('.active-webview');
            if (activeWebview) {
                activeWebview.src = url;
                activeWebview.focus();
            }
        }
    });
    
    // New tab button handler (připojení na titlebar.js)
    if (newTabButton) {
        newTabButton.addEventListener('click', () => {
            // Předpokládáme, že createTab je definovaná v titlebar.js
            // Tato funkce nemusí nic dělat, pokud je listener již nastaven v titlebar.js
            console.log('New tab requested from renderer.js');
        });
    }
    
    // Pravidelně aktualizujeme navigační tlačítka pro případ, že by se změnila navigační historie
    setInterval(updateNavigationButtons, 500);
});