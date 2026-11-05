/**
 * Modern Vanilla JavaScript To-Do List Application
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'minimalist_todo_tasks_v1';
  const THEME_STORAGE_KEY = 'minimalist_todo_theme';

  // --- State ---
  let tasks = loadTasksFromStorage();
  let currentFilter = 'all'; // 'all' | 'active' | 'completed'

  // --- DOM Elements ---
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySubtitle = document.getElementById('emptySubtitle');
  const itemsLeft = document.getElementById('itemsLeft');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const currentDateEl = document.getElementById('currentDate');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const themeToggleBtn = document.getElementById('themeToggle');

  // Filter tab buttons and badge counters
  const filterTabs = document.querySelectorAll('.filter-tab');
  const countAll = document.getElementById('countAll');
  const countActive = document.getElementById('countActive');
  const countCompleted = document.getElementById('countCompleted');

  // --- Initialization ---
  function init() {
    initTheme();
    displayCurrentDate();
    setupEventListeners();
    render();
  }

  // --- Theme Management ---
  function getPreferredTheme() {
    // 1. Check if user already picked a preference saved in localStorage
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (err) {
      console.warn('Could not read theme from localStorage:', err);
    }

    // 2. Fallback to operating system's theme preference on first visit
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    // 3. Default fallback
    return 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      const isDark = theme === 'dark';
      const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';
      themeToggleBtn.setAttribute('aria-label', label);
      themeToggleBtn.setAttribute('title', label);
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (err) {
      console.error('Failed to save theme to localStorage:', err);
    }
  }

  function initTheme() {
    const activeTheme = getPreferredTheme();
    applyTheme(activeTheme);

    // React automatically if user changes OS appearance and hasn't manually overridden it
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e) => {
        let hasCustomTheme = false;
        try {
          hasCustomTheme = Boolean(localStorage.getItem(THEME_STORAGE_KEY));
        } catch (_) {}

        if (!hasCustomTheme) {
          applyTheme(e.matches ? 'dark' : 'light');
        }
      };

      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
      }
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }
  }

  // --- Storage Functions ---
  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to load tasks from localStorage:', err);
      return [];
    }
  }

  function saveTasksToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      console.error('Failed to save tasks to localStorage:', err);
    }
  }

  // --- Date Formatter ---
  function displayCurrentDate() {
    if (!currentDateEl) return;
    const today = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString(undefined, options);
  }

  // --- Task Operations ---
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTask = {
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    render();
  }

  function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    saveTasksToStorage();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasksToStorage();
    render();
  }

  function clearCompletedTasks() {
    tasks = tasks.filter(task => !task.completed);
    saveTasksToStorage();
    render();
  }

  function setFilter(filter) {
    currentFilter = filter;

    filterTabs.forEach(tab => {
      const isActive = tab.dataset.filter === filter;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    render();
  }

  function generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // --- Rendering ---
  function render() {
    // 1. Calculate counts
    const totalCount = tasks.length;
    const completedCount = tasks.filter(t => t.completed).length;
    const activeCount = totalCount - completedCount;

    // 2. Update filter badges
    if (countAll) countAll.textContent = totalCount;
    if (countActive) countActive.textContent = activeCount;
    if (countCompleted) countCompleted.textContent = completedCount;

    // 3. Update footer stats
    if (itemsLeft) {
      const word = activeCount === 1 ? 'task' : 'tasks';
      itemsLeft.textContent = `${activeCount} ${word} remaining`;
    }

    if (clearCompletedBtn) {
      clearCompletedBtn.disabled = completedCount === 0;
      clearCompletedBtn.style.visibility = completedCount > 0 ? 'visible' : 'hidden';
    }

    // 4. Update progress bar
    if (progressBar && progressText) {
      const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${percentage}% completed`;
    }

    // 5. Filter tasks for current view
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
      filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = tasks.filter(t => t.completed);
    }

    // 6. Render Task List or Empty State
    taskList.innerHTML = '';

    if (filteredTasks.length === 0) {
      showEmptyState(totalCount);
    } else {
      if (emptyState) emptyState.hidden = true;
      taskList.hidden = false;

      const fragment = document.createDocumentFragment();
      filteredTasks.forEach(task => {
        fragment.appendChild(createTaskElement(task));
      });
      taskList.appendChild(fragment);
    }
  }

  function showEmptyState(totalCount) {
    if (!emptyState) return;
    taskList.hidden = true;
    emptyState.hidden = false;

    if (totalCount === 0) {
      emptyTitle.textContent = 'No tasks yet';
      emptySubtitle.textContent = 'Add your first task above to get organized!';
    } else if (currentFilter === 'active') {
      emptyTitle.textContent = 'No active tasks';
      emptySubtitle.textContent = 'All current tasks are marked as completed!';
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptySubtitle.textContent = 'Mark tasks as done to see them here.';
    }
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    // Toggle button (custom checkbox)
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'task-checkbox-btn';
    toggleBtn.setAttribute('aria-label', task.completed ? 'Mark task as incomplete' : 'Mark task as complete');
    toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    // Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    textSpan.title = 'Click to toggle completion';

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;

    li.appendChild(toggleBtn);
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);

    return li;
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // Form submission
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = taskInput.value;
      if (text.trim()) {
        addTask(text);
        taskInput.value = '';
        taskInput.focus();
      }
    });

    // Task item delegation (toggle / delete)
    taskList.addEventListener('click', (e) => {
      const item = e.target.closest('.task-item');
      if (!item) return;

      const taskId = item.dataset.id;

      // Click delete button
      if (e.target.closest('.btn-delete')) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => deleteTask(taskId), 150);
        return;
      }

      // Click checkbox button or task text
      if (e.target.closest('.task-checkbox-btn') || e.target.closest('.task-text')) {
        toggleTaskCompletion(taskId);
      }
    });

    // Clear completed button
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', () => {
        clearCompletedTasks();
      });
    }

    // Filter tab clicks
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;
        setFilter(filter);
      });
    });
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
