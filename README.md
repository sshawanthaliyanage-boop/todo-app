# Minimalist To-Do List Application

A simple, modern, and responsive To-Do List web application built from scratch using pure **HTML5**, **CSS3**, and **vanilla JavaScript**. It contains zero external frameworks or dependencies, persists tasks locally in your browser using `localStorage`, and functions as an installable **Progressive Web App (PWA)** on iPhone, iPad, Android, and Desktop.

---

## ✨ Features

- **📱 Installable Progressive Web App (PWA)**: Install directly to your iPhone or Android home screen with a custom modern checkmark icon and standalone fullscreen experience.
- **⚡ 100% Offline Support**: Powered by a Service Worker (`sw.js`) that caches all core application assets for instant startup with zero internet.
- **🌗 Light & Dark Mode**: Seamless theme toggle featuring Sun ☀️ and Moon 🌙 icons.
- **⚙️ System Preference Detection**: Automatically defaults to your operating system's dark/light appearance on your first visit.
- **💾 Persistent Theme & Task Storage**: Remembers your theme selection and keeps all tasks saved across reloads via browser `localStorage`.
- **🎨 Smooth Transitions & Safe Areas**: Eye-friendly color animations when toggling themes, with full support for iPhone notches, Dynamic Island, and home bars.
- **✅ Task Management**: Add, complete, and delete tasks with animated strikethrough styling and smooth exit transitions.
- **📊 Progress Tracking**: Dynamic progress bar that visualizes your completion percentage in real time.
- **🔍 Status Filters**: View "All", "Active", or "Completed" tasks with live count badges.
- **🧹 Clear Completed**: Quick action to purge all finished tasks at once.
- **🚀 Zero Dependencies**: Lightweight and fast, requiring no build tools, npm packages, or external CDN libraries.

---

## 📁 Project Structure

```
todo-app/
│
├── index.html            # Semantic markup, PWA meta tags, and theme toggle
├── style.css             # CSS variables, responsive design, and iOS safe areas
├── script.js             # Task logic, theme engine, and Service Worker registration
├── manifest.json         # PWA Web App Manifest configuration
├── sw.js                 # Service Worker caching for offline functionality
├── icons/                # High-resolution app icons
│   ├── icon.svg          # Scalable vector icon
│   ├── icon-192.png      # Android & standard PWA icon (192x192)
│   ├── icon-512.png      # Splash screen & high-res icon (512x512)
│   └── apple-touch-icon.png # iOS home screen icon (180x180)
└── README.md             # Project overview and documentation
```

---

## 📲 How to Install as an App

### On iPhone (iOS Safari)
1. Open the hosted website in **Safari** (e.g. your GitHub Pages URL).
2. Tap the **Share** button (the square with an arrow pointing up at the bottom of the screen).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm the name and tap **"Add"**.
5. The To-Do app will appear on your Home Screen and open like a native app without Safari browser controls!

### On Android (Chrome / Edge)
1. Open the website in **Chrome**.
2. Tap the **"Add To-Do to Home screen"** or **"Install app"** banner that appears (or tap the 3 dots in the top-right and select **Install app**).
3. Tap **Install**.

---

## 🚀 How to Run Locally

No installation or build step is required.

1. **Directly in Browser**:
   - Double-click `index.html` (or right-click and select **Open with...** > your preferred web browser like Chrome, Edge, Firefox, or Safari).

2. **Using a Local Development Server (Recommended for PWA testing)**:
   - Service Workers require `http://localhost` or `https://`:
     - If using VS Code, install the **Live Server** extension and click **Go Live**.
     - Or using any standard static file server.

---

## 📄 License

This project is open-source and free to use for personal and commercial projects.
