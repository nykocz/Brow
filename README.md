<div align="center">

<!-- Optional: Add a logo here -->
<!-- <img src="path/to/your/logo.png" alt="Brow Logo" width="150"/> -->

# **Brow Browser** ✨

_A simple, custom web browser built with Electron._

<!-- Optional: Add Badges (replace placeholders) -->
<p>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square"/>
  <img alt="Electron Version" src="https://img.shields.io/badge/Electron-%5E28.0.0-9FEAF9?style=flat-square&logo=electron"/> 
  <!-- Add other badges: build status, downloads, etc. -->
</p>

</div>

---

## 🚀 Description

Brow is a lightweight web browser developed using modern web technologies (HTML, CSS, JavaScript) and the Electron framework. It aims to provide a customizable browsing experience with a clean interface, featuring custom UI elements like a unified title bar and tab management.

## 🌟 Features

*   🎨 **Custom UI:**
    *   macOS-style window controls (close, minimize, maximize) integrated into a custom title bar.
    *   Modern tab design with favicon display, title truncation, and close buttons.
*   📑 **Tab Management:**
    *   Create, switch, and close tabs smoothly.
    *   Visual drag-and-drop reordering of tabs.
    *   Inline URL editing directly within the active tab.
*   🧭 **Navigation:**
    *   Standard Back, Forward, and Reload/Stop controls.
*   ⚙️ **Settings Page (`about:settings`):**
    *   **Appearance:** Light/Dark theme toggle with instant preview.
    *   **Homepage:** Select predefined options or set a custom URL.
    *   **Downloads:** Choose a custom download location.
    *   Apply/Reset functionality for managing changes.
*   🌓 **Theming:**
    *   Supports system-wide light and dark themes using CSS Variables.
    *   Applies theme preferences across the shell and attempts to style webview content.
*   ✨ **User Experience:**
    *   Animated splash screen on startup for a smoother launch.
    *   Custom macOS application menu and dock icon integration.
*   🛠️ **Development:**
    *   Hot reload enabled for faster development iterations (JS, CSS, HTML).
    *   CSS-only hot reload for instant style updates without full app restart.


## 💾 Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/your-username/Brow.git # <-- UPDATE THIS URL!
    cd Brow
    ```
2.  **Install Dependencies:** Ensure you have [Node.js](https://nodejs.org/) installed.
    ```bash
    npm install
    ```

## ▶️ Usage

*   **Run the Application:**
    ```bash
    npm start
    ```
*   **Run in Development Mode (with Hot Reload):**
    ```bash
    npm run dev
    ```
    *(Requires a "dev" script in `package.json`, e.g., `"dev": "cross-env NODE_ENV=development electron ."`)*

## 💻 Technologies Used

*   [Electron](https://www.electronjs.org/)
*   [Node.js](https://nodejs.org/)
*   HTML5
*   CSS3 (Flexbox, Grid, CSS Variables)
*   Vanilla JavaScript

---

## 🤝 Contributing (Optional)

Contributions are welcome! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

Please ensure your code adheres to the project's coding standards.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details (if it exists). 