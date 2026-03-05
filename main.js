import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import { format, parse, isToday, isTomorrow, isPast, compareAsc } from 'date-fns';

const STORAGE_KEY = 'todos-app';

// Todos array (Feature 1)
let todos = [];
let nextId = 1;

// Current sort (Feature 3)
let currentSort = 'default';

// Priority system
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
let currentSortPriority = false;

/** Persists the current todos array and nextId counter to localStorage. */
function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, nextId }));
}

/**
 * Loads todos from localStorage into the in-memory array.
 * Backfills missing priority fields with 'medium' for backwards compatibility.
 */
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const data = JSON.parse(stored);
        todos = data.todos.map(todo => ({ ...todo, priority: todo.priority ?? 'medium' }));
        nextId = data.nextId;
    }
}

// Current filter (Feature 2)
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    init();
    initVibeKanban();
});

/** Reads the saved theme from localStorage and applies it to the document on load. */
function initTheme() {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
        document.documentElement.dataset.theme = 'dark';
        document.getElementById('themeToggle').textContent = '☀️';
    } else {
        delete document.documentElement.dataset.theme;
        document.getElementById('themeToggle').textContent = '🌙';
    }
}

/** Toggles between light and dark theme and saves the preference to localStorage. */
function toggleTheme() {
    const isDark = document.documentElement.dataset.theme === 'dark';
    if (isDark) {
        delete document.documentElement.dataset.theme;
        localStorage.setItem('theme', 'light');
        document.getElementById('themeToggle').textContent = '🌙';
    } else {
        document.documentElement.dataset.theme = 'dark';
        localStorage.setItem('theme', 'dark');
        document.getElementById('themeToggle').textContent = '☀️';
    }
}

/**
 * Initialises the app: loads persisted data, wires up all UI event listeners,
 * and performs the initial render.
 */
function init() {
    initTheme();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    const shortcutsBtn = document.getElementById('shortcutsBtn');
    const shortcutsPanel = document.getElementById('shortcutsPanel');
    shortcutsBtn.addEventListener('click', () => {
        shortcutsPanel.hidden = !shortcutsPanel.hidden;
        shortcutsBtn.classList.toggle('active', !shortcutsPanel.hidden);
    });
    loadTodos();

    // Wire up add button
    const addBtn = document.getElementById('addBtn');
    const todoInput = document.getElementById('todoInput');

    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    // Wire up filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Wire up priority selector buttons
    document.querySelectorAll('.priority-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Wire up sort buttons
    document.getElementById('sortDueDateBtn').addEventListener('click', () => {
        currentSort = currentSort === 'dueDate' ? 'default' : 'dueDate';
        document.getElementById('sortDueDateBtn').classList.toggle('active', currentSort === 'dueDate');
        renderTodos();
    });

    document.getElementById('sortPriorityBtn').addEventListener('click', () => {
        currentSortPriority = !currentSortPriority;
        document.getElementById('sortPriorityBtn').classList.toggle('active', currentSortPriority);
        renderTodos();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const tag = document.activeElement.tagName;
        const inInput = tag === 'INPUT' || tag === 'TEXTAREA';

        if (e.key === 'Escape') {
            document.getElementById('todoInput').value = '';
            document.activeElement.blur();
            document.querySelectorAll('.todo-notes:not([hidden])').forEach(el => { el.hidden = true; });
            shortcutsPanel.hidden = true;
            shortcutsBtn.classList.remove('active');
            return;
        }
        if (inInput) return;

        if (e.key === 'n' || e.key === 'N') {
            e.preventDefault();
            document.getElementById('todoInput').focus();
        }
        if (e.key === '1') setFilter('all');
        if (e.key === '2') setFilter('active');
        if (e.key === '3') setFilter('completed');
    });

    renderTodos();
}

/** Mounts the Vibe Kanban web companion widget into the document body. */
function initVibeKanban() {
    const companion = new VibeKanbanWebCompanion();
    companion.render(document.body);
}

// Feature 1: Add, toggle, delete todos
/**
 * Reads the input field and creates a new todo with the selected priority and
 * optional due date, then saves and re-renders the list.
 */
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text === '') return;

    const dueDateInput = document.getElementById('dueDateInput');
    const activeBtn = document.querySelector('.priority-btn.active');
    const priority = activeBtn ? activeBtn.dataset.priority : 'medium';

    todos.push({
        id: nextId++,
        text: text,
        completed: false,
        dueDate: dueDateInput.value || null,
        notes: '',
        priority
    });

    input.value = '';
    dueDateInput.value = '';
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.toggle('active', b.dataset.priority === 'medium'));
    saveTodos();
    renderTodos();
}

/**
 * Toggles the completed state of the todo with the given id.
 * @param {number} id - The id of the todo to toggle.
 */
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

/**
 * Removes the todo with the given id from the list, then saves and re-renders.
 * @param {number} id - The id of the todo to delete.
 */
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Feature 1: Render todos
/**
 * Clears and rebuilds the todo list DOM from the current filtered and sorted
 * todos, attaching all necessary event listeners to each item.
 */
function renderTodos() {
    const todoList = document.getElementById('todoList');
    const filteredTodos = getFilteredTodos();

    todoList.innerHTML = '';

    filteredTodos.forEach(todo => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        if (todo.completed) li.classList.add('completed');

        const dueDateBadge = formatDueDate(todo.dueDate);
        const badgeHtml = dueDateBadge
            ? `<span class="todo-due-date ${dueDateBadge.className}">${escapeHtml(dueDateBadge.label)}</span>`
            : '';

        const priorityLabel = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
        const priorityBadgeHtml = `<span class="priority-badge priority-${todo.priority}">${priorityLabel}</span>`;

        const hasNotes = todo.notes && todo.notes.trim().length > 0;
        li.innerHTML = `
            <div class="todo-row">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${priorityBadgeHtml}
                ${badgeHtml}
                <select class="todo-priority-select" aria-label="Todo priority">
                    <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
                    <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
                    <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
                </select>
                <button class="todo-notes-btn ${hasNotes ? 'has-notes' : ''}" aria-label="Toggle notes">📝</button>
                <button class="todo-delete">Delete</button>
            </div>
            <div class="todo-notes" hidden>
                <textarea class="todo-notes-textarea" placeholder="Add notes...">${escapeHtml(todo.notes ?? '')}</textarea>
            </div>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));
        li.querySelector('.todo-priority-select').addEventListener('change', (e) => {
            const todoItem = todos.find(t => t.id === todo.id);
            if (todoItem) {
                todoItem.priority = e.target.value;
                saveTodos();
                renderTodos();
            }
        });

        const notesBtn = li.querySelector('.todo-notes-btn');
        const notesPanel = li.querySelector('.todo-notes');
        const notesTextarea = li.querySelector('.todo-notes-textarea');

        notesBtn.addEventListener('click', () => {
            notesPanel.hidden = !notesPanel.hidden;
            if (!notesPanel.hidden) notesTextarea.focus();
        });

        notesTextarea.addEventListener('blur', () => {
            const todoItem = todos.find(t => t.id === todo.id);
            if (todoItem) {
                todoItem.notes = notesTextarea.value;
                saveTodos();
                const hasContent = notesTextarea.value.trim().length > 0;
                notesBtn.classList.toggle('has-notes', hasContent);
            }
        });

        todoList.appendChild(li);
    });
}

// Feature 2: Filter todos based on current filter
/**
 * Returns a filtered and optionally sorted copy of the todos array based on
 * the current filter, priority sort, and due-date sort state.
 * @returns {Array} The filtered and sorted todos.
 */
function getFilteredTodos() {
    let result;
    if (currentFilter === 'active') {
        result = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        result = todos.filter(t => t.completed);
    } else {
        result = [...todos];
    }

    // Sort by priority and/or due date (composable)
    if (currentSortPriority || currentSort === 'dueDate') {
        result.sort((a, b) => {
            if (currentSortPriority) {
                const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
                if (diff !== 0) return diff;
            }
            if (currentSort === 'dueDate') {
                if (!a.dueDate && !b.dueDate) return 0;
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return compareAsc(
                    parse(a.dueDate, 'yyyy-MM-dd', new Date()),
                    parse(b.dueDate, 'yyyy-MM-dd', new Date())
                );
            }
            return 0;
        });
    }

    return result;
}

// Feature 3: Format a yyyy-MM-dd string into a display label + CSS class
/**
 * Converts a yyyy-MM-dd date string into a human-readable label and CSS class
 * for the due-date badge (e.g. "Due today", "Overdue: 3 Jan").
 * @param {string|null} dateString - ISO-format date string or null.
 * @returns {{ label: string, className: string }|null} Badge data, or null if no date.
 */
function formatDueDate(dateString) {
    if (!dateString) return null;
    // Use parse (not parseISO) to get a local date, avoiding UTC offset issues
    const date = parse(dateString, 'yyyy-MM-dd', new Date());
    if (isToday(date)) return { label: 'Due today', className: 'due-today' };
    if (isTomorrow(date)) return { label: 'Due tomorrow', className: 'due-tomorrow' };
    if (isPast(date)) return { label: `Overdue: ${format(date, 'd MMM')}`, className: 'due-overdue' };
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return {
        label: `Due ${format(date, sameYear ? 'd MMM' : 'd MMM yyyy')}`,
        className: 'due-upcoming'
    };
}

// Feature 2: Set filter and update UI
/**
 * Sets the active filter, updates filter button styles, and re-renders the list.
 * @param {string} filter - One of 'all', 'active', or 'completed'.
 */
function setFilter(filter) {
    currentFilter = filter;

    // Update button styling
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        }
    });

    renderTodos();
}

// Utility function to escape HTML
/**
 * Escapes a string for safe insertion into HTML to prevent XSS.
 * @param {string} text - The raw string to escape.
 * @returns {string} The HTML-escaped string.
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
