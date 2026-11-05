/**
 * Modern Vanilla JavaScript To-Do List Application
 * With Interactive Calendar, Priority System & PWA Support
 */

(function () {
  'use strict';

  // --- Constants & Storage Keys ---
  const STORAGE_KEY = 'minimalist_todo_tasks_v1';
  const THEME_STORAGE_KEY = 'minimalist_todo_theme';

  // --- Date Helpers ---
  function getLocalDateString(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function parseLocalDateString(str) {
    if (!str) return new Date();
    const parts = str.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return new Date();
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  // --- State ---
  let tasks = loadTasksFromStorage();
  let currentFilter = 'all'; // 'all' | 'active' | 'completed'
  let selectedDate = getLocalDateString(new Date()); // ALWAYS starts on today!
  
  // Calendar View State
  const initialDate = new Date();
  let calendarViewYear = initialDate.getFullYear();
  let calendarViewMonth = initialDate.getMonth(); // 0-11
  let isCalendarOpen = false;

  // Priority Selector State: 'medium' | 'high' | 'low'
  const PRIORITIES = ['medium', 'high', 'low'];
  const PRIORITY_LABELS = {
    low: 'Low',
    medium: 'Med',
    high: 'High'
  };
  let currentPriority = 'medium';

  // Undo Delete State
  let lastDeletedTask = null;
  let undoToastTimeout = null;

  // --- DOM Elements ---
  const appTitle = document.getElementById('appTitle');
  const currentDateEl = document.getElementById('currentDate');
  const todayQuickBtn = document.getElementById('todayQuickBtn');
  const calendarToggleBtn = document.getElementById('calendarToggleBtn');
  const calendarBadgeDot = document.getElementById('calendarBadgeDot');
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeColorMeta = document.getElementById('themeColorMeta');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');

  // Calendar Elements
  const calendarPanel = document.getElementById('calendarPanel');
  const calendarMonthYear = document.getElementById('calendarMonthYear');
  const calendarGrid = document.getElementById('calendarGrid');
  const prevMonthBtn = document.getElementById('prevMonthBtn');
  const nextMonthBtn = document.getElementById('nextMonthBtn');
  const calendarGoTodayBtn = document.getElementById('calendarGoTodayBtn');
  const calendarCloseBtn = document.getElementById('calendarCloseBtn');

  // Form & Priority Elements
  const taskForm = document.getElementById('taskForm');
  const taskInput = document.getElementById('taskInput');
  const priorityBtn = document.getElementById('priorityBtn');
  const priorityText = document.getElementById('priorityText');

  // Filter & List Elements
  const filterTabs = document.querySelectorAll('.filter-tab');
  const countAll = document.getElementById('countAll');
  const countActive = document.getElementById('countActive');
  const countCompleted = document.getElementById('countCompleted');
  const taskList = document.getElementById('taskList');
  const emptyState = document.getElementById('emptyState');
  const emptyTitle = document.getElementById('emptyTitle');
  const emptySubtitle = document.getElementById('emptySubtitle');
  const itemsLeft = document.getElementById('itemsLeft');
  const clearCompletedBtn = document.getElementById('clearCompletedBtn');
  const toastContainer = document.getElementById('toastContainer');

  // --- Initialization ---
  function init() {
    initTheme();
    registerServiceWorker();
    setupEventListeners();
    updatePriorityUI();
    render();
    renderCalendar();
  }

  // --- Progressive Web App (PWA) Service Worker ---
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('./sw.js')
          .then((registration) => {
            console.log('ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('ServiceWorker registration failed:', error);
          });
      });
    }
  }

  // --- Theme Management ---
  function getPreferredTheme() {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
    } catch (err) {
      console.warn('Could not read theme from localStorage:', err);
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

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

    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', theme === 'dark' ? '#090d16' : '#ffffff');
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

  // --- Storage Functions (with Backward Compatibility) ---
  function loadTasksFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      const todayStr = getLocalDateString(new Date());

      // Ensure backward compatibility: add dueDate and priority to older tasks
      return parsed.map(task => ({
        ...task,
        dueDate: task.dueDate || todayStr,
        priority: task.priority || 'medium'
      }));
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

  // --- Calendar Functionality ---
  function toggleCalendar(forceState) {
    if (typeof forceState === 'boolean') {
      isCalendarOpen = forceState;
    } else {
      isCalendarOpen = !isCalendarOpen;
    }

    if (calendarPanel) {
      calendarPanel.hidden = !isCalendarOpen;
    }

    if (calendarToggleBtn) {
      calendarToggleBtn.classList.toggle('active', isCalendarOpen);
      calendarToggleBtn.setAttribute('aria-expanded', isCalendarOpen ? 'true' : 'false');
    }

    if (isCalendarOpen) {
      // Sync calendar view month with currently selected date
      const d = parseLocalDateString(selectedDate);
      calendarViewYear = d.getFullYear();
      calendarViewMonth = d.getMonth();
      renderCalendar();
    }
  }

  function navigateCalendarMonth(delta) {
    calendarViewMonth += delta;
    if (calendarViewMonth < 0) {
      calendarViewMonth = 11;
      calendarViewYear -= 1;
    } else if (calendarViewMonth > 11) {
      calendarViewMonth = 0;
      calendarViewYear += 1;
    }
    renderCalendar();
  }

  function renderCalendar() {
    if (!calendarGrid || !calendarMonthYear) return;

    const todayStr = getLocalDateString(new Date());
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    calendarMonthYear.textContent = `${monthNames[calendarViewMonth]} ${calendarViewYear}`;

    // Calculate days
    const firstDayIndex = new Date(calendarViewYear, calendarViewMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(calendarViewYear, calendarViewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calendarViewYear, calendarViewMonth, 0).getDate();

    calendarGrid.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(calendarViewYear, calendarViewMonth - 1, dayNum);
      const dateStr = getLocalDateString(prevDate);
      fragment.appendChild(createCalendarDayCell(dayNum, dateStr, true));
    }

    // 2. Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(calendarViewYear, calendarViewMonth, d);
      const dateStr = getLocalDateString(curDate);
      fragment.appendChild(createCalendarDayCell(d, dateStr, false));
    }

    // 3. Next month leading days to complete grid rows
    const totalRendered = firstDayIndex + daysInMonth;
    const remainingSlots = (7 - (totalRendered % 7)) % 7;
    for (let n = 1; n <= remainingSlots; n++) {
      const nextDate = new Date(calendarViewYear, calendarViewMonth + 1, n);
      const dateStr = getLocalDateString(nextDate);
      fragment.appendChild(createCalendarDayCell(n, dateStr, true));
    }

    calendarGrid.appendChild(fragment);
    updateCalendarBadgeDot();
  }

  function createCalendarDayCell(dayNum, dateStr, isOutside) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day-cell';
    btn.dataset.date = dateStr;
    btn.setAttribute('aria-label', `${dateStr}`);

    if (isOutside) btn.classList.add('is-outside');

    const todayStr = getLocalDateString(new Date());
    if (dateStr === todayStr) btn.classList.add('is-today');
    if (dateStr === selectedDate) btn.classList.add('is-selected');

    // Day number text
    const numSpan = document.createElement('span');
    numSpan.textContent = dayNum;
    btn.appendChild(numSpan);

    // Check for tasks on this date
    const tasksOnDate = tasks.filter(t => t.dueDate === dateStr);
    if (tasksOnDate.length > 0) {
      const hasActive = tasksOnDate.some(t => !t.completed);
      const dot = document.createElement('span');
      dot.className = 'calendar-dot';

      if (!hasActive) {
        dot.classList.add('dot-completed');
      } else if (dateStr < todayStr) {
        dot.classList.add('dot-overdue');
      }
      btn.appendChild(dot);
    }

    return btn;
  }

  function updateCalendarBadgeDot() {
    if (!calendarBadgeDot) return;
    const todayStr = getLocalDateString(new Date());
    // Check if there are active tasks on other dates (overdue or future)
    const hasOtherActiveTasks = tasks.some(t => !t.completed && t.dueDate !== todayStr);
    calendarBadgeDot.hidden = !hasOtherActiveTasks;
  }

  function selectDate(dateStr) {
    selectedDate = dateStr;
    render();
    renderCalendar();
  }

  function returnToToday() {
    selectedDate = getLocalDateString(new Date());
    const d = new Date();
    calendarViewYear = d.getFullYear();
    calendarViewMonth = d.getMonth();
    render();
    renderCalendar();
  }

  // --- Priority Cycling ---
  function cyclePriority() {
    const currentIndex = PRIORITIES.indexOf(currentPriority);
    const nextIndex = (currentIndex + 1) % PRIORITIES.length;
    currentPriority = PRIORITIES[nextIndex];
    updatePriorityUI();
  }

  function updatePriorityUI() {
    if (!priorityBtn || !priorityText) return;
    priorityBtn.className = `priority-selector-btn priority-${currentPriority === 'medium' ? 'med' : currentPriority}`;
    priorityText.textContent = PRIORITY_LABELS[currentPriority];
    const capitalized = currentPriority.charAt(0).toUpperCase() + currentPriority.slice(1);
    priorityBtn.title = `Priority: ${capitalized} (Click to change)`;
    priorityBtn.setAttribute('aria-label', `Priority: ${capitalized}. Click to cycle priority`);
  }

  // --- Task CRUD Operations ---
  function addTask(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const newTask = {
      id: generateId(),
      text: trimmed,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: selectedDate, // Assigned to currently viewed date
      priority: currentPriority
    };

    tasks.unshift(newTask);
    saveTasksToStorage();
    render();
    renderCalendar();
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
    renderCalendar();
  }

  function deleteTask(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const deleted = tasks[taskIndex];
    lastDeletedTask = { task: deleted, index: taskIndex };

    tasks = tasks.filter(t => t.id !== id);
    saveTasksToStorage();
    render();
    renderCalendar();

    showUndoToast(deleted);
  }

  function undoDelete() {
    if (!lastDeletedTask) return;
    const { task, index } = lastDeletedTask;
    const insertIndex = Math.min(index, tasks.length);
    tasks.splice(insertIndex, 0, task);
    lastDeletedTask = null;

    saveTasksToStorage();
    render();
    renderCalendar();
    dismissToast();
  }

  function clearCompletedTasks() {
    // Only clear completed tasks for currently selected date
    tasks = tasks.filter(task => !(task.completed && task.dueDate === selectedDate));
    saveTasksToStorage();
    render();
    renderCalendar();
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

  // --- Toast Notification System ---
  function showUndoToast(task) {
    if (!toastContainer) return;
    dismissToast();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'activeToast';

    const textSpan = document.createElement('span');
    const displaySnippet = task.text.length > 25 ? task.text.substring(0, 25) + '…' : task.text;
    textSpan.textContent = `Deleted "${displaySnippet}"`;

    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'btn-undo';
    undoBtn.textContent = 'Undo';
    undoBtn.addEventListener('click', undoDelete);

    toast.appendChild(textSpan);
    toast.appendChild(undoBtn);
    toastContainer.appendChild(toast);

    undoToastTimeout = setTimeout(() => {
      dismissToast();
    }, 4500);
  }

  function dismissToast() {
    if (undoToastTimeout) {
      clearTimeout(undoToastTimeout);
      undoToastTimeout = null;
    }
    if (toastContainer) {
      toastContainer.innerHTML = '';
    }
  }

  // --- Rendering Functions ---
  function renderHeaderDate() {
    const todayStr = getLocalDateString(new Date());
    const isToday = selectedDate === todayStr;

    // 1. "Back to Today" quick button visibility
    if (todayQuickBtn) {
      todayQuickBtn.hidden = isToday;
    }

    // 2. Format title and subtitle
    const parsedDate = parseLocalDateString(selectedDate);
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    let titleText = "Today's Tasks";
    if (selectedDate === tomorrowStr) {
      titleText = "Tomorrow's Tasks";
    } else if (selectedDate === yesterdayStr) {
      titleText = "Yesterday's Tasks";
    } else if (!isToday) {
      const shortMonthDay = parsedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      titleText = `Tasks for ${shortMonthDay}`;
    }

    if (appTitle) {
      appTitle.textContent = titleText;
    }

    if (currentDateEl) {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      currentDateEl.textContent = parsedDate.toLocaleDateString(undefined, options);
    }
  }

  function render() {
    renderHeaderDate();

    // 1. Get tasks specifically for currently selected date
    const dateTasks = tasks.filter(t => t.dueDate === selectedDate);
    const totalCount = dateTasks.length;
    const completedCount = dateTasks.filter(t => t.completed).length;
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
    let filteredTasks = dateTasks;
    if (currentFilter === 'active') {
      filteredTasks = dateTasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
      filteredTasks = dateTasks.filter(t => t.completed);
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

    const todayStr = getLocalDateString(new Date());

    if (totalCount === 0) {
      if (selectedDate === todayStr) {
        emptyTitle.textContent = 'All caught up for today!';
        emptySubtitle.textContent = 'Add a new task above to get organized.';
      } else if (selectedDate > todayStr) {
        emptyTitle.textContent = 'No tasks scheduled yet';
        emptySubtitle.textContent = 'Plan ahead and add a task for this date above.';
      } else {
        emptyTitle.textContent = 'No tasks for this day';
        emptySubtitle.textContent = 'No tasks were recorded for this past date.';
      }
    } else if (currentFilter === 'active') {
      emptyTitle.textContent = 'No active tasks';
      emptySubtitle.textContent = 'All tasks for this day are marked as completed!';
    } else if (currentFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptySubtitle.textContent = 'Mark tasks as done to see them here.';
    }
  }

  function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    // 1. Toggle button (custom checkbox)
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'task-checkbox-btn';
    toggleBtn.setAttribute('aria-label', task.completed ? 'Mark task as incomplete' : 'Mark task as complete');
    toggleBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    // 2. Task text
    const textSpan = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.textContent = task.text;
    textSpan.title = 'Click to toggle completion';

    // 3. Task meta badges (Priority & Overdue)
    const badgesDiv = document.createElement('div');
    badgesDiv.className = 'task-meta-badges';

    // Overdue badge: task is past due date and incomplete
    const todayStr = getLocalDateString(new Date());
    if (task.dueDate < todayStr && !task.completed) {
      const overdueBadge = document.createElement('span');
      overdueBadge.className = 'task-overdue-badge';
      overdueBadge.textContent = 'Overdue';
      badgesDiv.appendChild(overdueBadge);
    }

    // Priority badge
    const priority = task.priority || 'medium';
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `task-priority-badge priority-${priority}`;
    priorityBadge.textContent = PRIORITY_LABELS[priority] || 'Med';
    badgesDiv.appendChild(priorityBadge);

    // 4. Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'btn-delete';
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.text}`);
    deleteBtn.innerHTML = `
      <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        <line x1="10" y1="11" x2="10" y2="17"></line>
        <line x1="14" y1="11" x2="14" y2="17"></line>
      </svg>
    `;

    li.appendChild(toggleBtn);
    li.appendChild(textSpan);
    li.appendChild(badgesDiv);
    li.appendChild(deleteBtn);

    return li;
  }

  // --- Event Listeners ---
  function setupEventListeners() {
    // 1. Task form submission
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = taskInput.value;
      if (text.trim()) {
        addTask(text);
        taskInput.value = '';
        taskInput.focus();
      }
    });

    // 2. Priority button cycling
    if (priorityBtn) {
      priorityBtn.addEventListener('click', () => {
        cyclePriority();
      });
    }

    // 3. Calendar header toggle
    if (calendarToggleBtn) {
      calendarToggleBtn.addEventListener('click', () => {
        toggleCalendar();
      });
    }

    // 4. Calendar navigation
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        navigateCalendarMonth(-1);
      });
    }

    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        navigateCalendarMonth(1);
      });
    }

    if (calendarGoTodayBtn) {
      calendarGoTodayBtn.addEventListener('click', () => {
        returnToToday();
        toggleCalendar(false);
      });
    }

    if (calendarCloseBtn) {
      calendarCloseBtn.addEventListener('click', () => {
        toggleCalendar(false);
      });
    }

    // 5. Calendar day selection delegation
    if (calendarGrid) {
      calendarGrid.addEventListener('click', (e) => {
        const cell = e.target.closest('.calendar-day-cell');
        if (!cell || !cell.dataset.date) return;
        selectDate(cell.dataset.date);
        toggleCalendar(false);
      });
    }

    // 6. "Return to Today" quick button in header
    if (todayQuickBtn) {
      todayQuickBtn.addEventListener('click', () => {
        returnToToday();
      });
    }

    // 7. Task item delegation (toggle / delete)
    taskList.addEventListener('click', (e) => {
      const item = e.target.closest('.task-item');
      if (!item) return;

      const taskId = item.dataset.id;

      // Click delete button
      if (e.target.closest('.btn-delete')) {
        item.style.opacity = '0';
        item.style.transform = 'translateX(24px)';
        setTimeout(() => deleteTask(taskId), 180);
        return;
      }

      // Click checkbox button or task text
      if (e.target.closest('.task-checkbox-btn') || e.target.closest('.task-text')) {
        toggleTaskCompletion(taskId);
      }
    });

    // 8. Clear completed button
    if (clearCompletedBtn) {
      clearCompletedBtn.addEventListener('click', () => {
        clearCompletedTasks();
      });
    }

    // 9. Filter tab clicks
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;
        setFilter(filter);
      });
    });

    // 10. Global keyboard navigation (Escape to close calendar)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (isCalendarOpen) {
          toggleCalendar(false);
        }
      }
    });
  }

  // Initialize on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

// Testing Git integration in Antigravity
