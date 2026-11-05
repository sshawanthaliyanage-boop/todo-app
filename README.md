# Minimalist To-Do List Application

A modern, responsive, and distraction-free To-Do List and productivity application built from scratch using pure **HTML5**, **CSS3**, and **vanilla JavaScript**. It contains zero external frameworks or dependencies, persists tasks locally in your browser using `localStorage`, and functions as a standalone **Progressive Web App (PWA)** on iPhone, iPad, Android, and Desktop.

---

## ✨ Features

- **📱 Mobile-First Native Experience**: Specially optimized for iPhone (iOS Safari) and Android with full-bleed layout, Dynamic Island / notch safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)`), and 44px+ tap targets.
- **📅 Interactive Calendar & Future Scheduling**:
  - Open a sleek calendar from the header to plan tasks for tomorrow or any future date.
  - Interactive month navigation with indicators highlighting today, the active date, and dot indicators on days with tasks.
  - **Always defaults to Today's tasks** on open, with an instant "Back to Today" button whenever browsing other dates.
- **⚡ Priority System**: Assign Low, Medium, or High priority to tasks with a single click, displayed via clean, color-coded badges.
- **↩️ Undo Task Deletion**: Accidental deletes are prevented with an unobtrusive toast notification and immediate "Undo" action.
- **⚠️ Overdue Task Highlighting**: Tasks from previous dates that remain incomplete are clearly badged without cluttering the screen.
- **🌓 Light & Dark Mode**: Seamless theme toggle featuring Sun ☀️ and Moon 🌙 icons with smooth transitions.
- **⚙️ System Preference Detection**: Automatically defaults to your operating system's light or dark appearance on first visit.
- **💾 100% Offline & Local Storage**: Powered by a Service Worker (`sw.js`) and `localStorage` so all tasks, themes, and calendar dates work completely offline with zero server requirement.
- **📊 Real-time Progress Tracking**: Animated progress bar that updates dynamically as tasks are checked off.
- **🔍 Status Filters**: View "All", "Active", or "Completed" tasks with live count badges.
- **🚀 Zero Dependencies**: Lightweight, fast, and fully compatible with GitHub Pages hosting.

---

## 📁 Project Structure

```
todo-app/
│
├── index.html            # Semantic markup, PWA meta tags, calendar drawer, and layout
├── style.css             # CSS variables, native mobile layout, animations, safe areas
├── script.js             # State engine, calendar logic, priority handling, and PWA registration
├── manifest.json         # PWA Web App Manifest configuration
├── sw.js                 # Service Worker caching for offline functionality (v2)
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
1. Open your website in **Safari** (e.g. your GitHub Pages URL).
2. Tap the **Share** button at the bottom (square with an arrow pointing up).
3. Scroll down and tap **"Add to Home Screen"**.
4. Confirm the name and tap **"Add"**.
5. Launch the app from your Home Screen to enjoy the full-screen standalone experience!

### On Android (Chrome / Edge)
1. Open the website in **Chrome**.
2. Tap the **"Add To-Do to Home screen"** or **"Install app"** banner that appears.
3. Tap **Install**.

---

## 🚀 How to Run Locally

No installation or build step is required.

1. **Directly in Browser**:
   - Double-click `index.html` to open it in Chrome, Edge, Safari, or Firefox.

2. **Using a Local Development Server (Recommended for PWA testing)**:
   - Run any local HTTP server (such as VS Code Live Server or Python's `http.server 3000`).

---

## 📄 License

This project is open-source and free to use for personal and commercial projects.
