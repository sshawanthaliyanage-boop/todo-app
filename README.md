# Minimalist To-Do List Application

A simple, modern, and responsive To-Do List web application built from scratch using pure **HTML5**, **CSS3**, and **vanilla JavaScript**. It contains zero external frameworks or dependencies and persists tasks locally in your browser using `localStorage`.

---

## ✨ Features

- **Light & Dark Mode**: Seamless theme toggle featuring Sun ☀️ and Moon 🌙 icons.
- **System Preference Detection**: Automatically defaults to your operating system's dark/light appearance on your first visit.
- **Persistent Theme Storage**: Remembers your theme selection across page reloads via `localStorage`.
- **Smooth Transitions**: Eye-friendly color animations when toggling themes.
- **Add Tasks**: Easily create new tasks with real-time validation and form submission.
- **Mark Complete / Incomplete**: Toggle tasks by clicking the custom checkbox or task text, complete with animated strikethrough styling.
- **Delete Tasks**: Remove individual tasks with a smooth exit transition.
- **Persistent Storage**: Automatically saves all tasks and their completion states in browser `localStorage`.
- **Progress Tracking**: Dynamic progress bar that visualizes your completion percentage in real time.
- **Status Filters**: View "All", "Active", or "Completed" tasks with live count badges.
- **Clear Completed**: Quick action to purge all finished tasks at once.
- **Responsive & Modern Design**: Clean typography, subtle shadows, and mobile-friendly layout optimized for touch and desktop.
- **Zero Dependencies**: Lightweight and fast, requiring no build tools, npm packages, or external CDN libraries.

---

## 📁 Project Structure

```
todo-app/
│
├── index.html     # Semantic markup, theme toggle button, and layout
├── style.css      # CSS variables for Light/Dark themes, responsive styling & transitions
├── script.js      # Task operations, theme engine, and localStorage handling
└── README.md      # Project overview and documentation
```

---

## 🚀 How to Run

No installation, build step, or server configuration is required.

1. **Directly in Browser**:
   - Double-click `index.html` (or right-click and select **Open with...** > your preferred web browser like Chrome, Edge, Firefox, or Safari).

2. **Using a Local Development Server (Optional)**:
   - If using VS Code, install the **Live Server** extension and click **Go Live**.
   - Or with Python 3:
     ```bash
     python -m http.server 3000
     ```
     Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Technical Details

- **HTML5**: Uses accessible elements (`<main>`, `<header>`, `<footer>`, `<form>`, `role="tablist"`, `aria-selected`, `aria-label`).
- **CSS3**:
  - CSS custom properties (variables) for consistent light and dark mode colors, spacing, and border radius.
  - Flexbox for responsive centering and flexible card layouts.
  - Clean media queries adapting seamlessly for screen widths below 480px.
  - Pure SVG icons for crisp display across any resolution.
- **Vanilla JavaScript**:
  - Encapsulated within an IIFE (Immediately Invoked Function Expression) to avoid global namespace pollution.
  - Theme engine reading/writing to `localStorage` and syncing with system color scheme queries (`prefers-color-scheme`).
  - Event delegation for scalable list interaction handling.
  - Defensive parsing for `localStorage` to handle corrupt or disabled storage gracefully.
  - XSS-safe DOM node creation via `document.createElement` and `textContent`.

---

## 📄 License

This project is open-source and free to use for personal and commercial projects.
