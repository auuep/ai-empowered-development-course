import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import { format, parse, isToday, isTomorrow, isPast, compareAsc } from 'date-fns';

const STORAGE_KEY = 'todos-app';

// Todos array (Feature 1)
let todos = [];
let nextId = 1;

// Current sort (Feature 3)
let currentSort = 'default';

function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ todos, nextId }));
}

function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const data = JSON.parse(stored);
        todos = data.todos;
        nextId = data.nextId;
    }
}

// Current filter (Feature 2)
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    init();
    initVibeKanban();
});

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

    // Wire up sort button
    document.getElementById('sortDueDateBtn').addEventListener('click', () => {
        currentSort = currentSort === 'dueDate' ? 'default' : 'dueDate';
        document.getElementById('sortDueDateBtn').classList.toggle('active', currentSort === 'dueDate');
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

function initVibeKanban() {
    const companion = new VibeKanbanWebCompanion();
    companion.render(document.body);
}

// Feature 1: Add, toggle, delete todos
function addTodo() {
    const input = document.getElementById('todoInput');
    const text = input.value.trim();

    if (text === '') return;

    const dueDateInput = document.getElementById('dueDateInput');
    todos.push({
        id: nextId++,
        text: text,
        completed: false,
        dueDate: dueDateInput.value || null,
        notes: ''
    });

    input.value = '';
    dueDateInput.value = '';
    saveTodos();
    renderTodos();
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
    }
}

function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    renderTodos();
}

// Feature 1: Render todos
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

        const hasNotes = todo.notes && todo.notes.trim().length > 0;
        li.innerHTML = `
            <div class="todo-row">
                <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text">${escapeHtml(todo.text)}</span>
                ${badgeHtml}
                <button class="todo-notes-btn ${hasNotes ? 'has-notes' : ''}" aria-label="Toggle notes">📝</button>
                <button class="todo-delete">Delete</button>
            </div>
            <div class="todo-notes" hidden>
                <textarea class="todo-notes-textarea" placeholder="Add notes...">${escapeHtml(todo.notes ?? '')}</textarea>
            </div>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));

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
function getFilteredTodos() {
    let result;
    if (currentFilter === 'active') {
        result = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        result = todos.filter(t => t.completed);
    } else {
        result = [...todos];
    }

    // Feature 3: Sort by due date (upcoming first, no-date at end)
    if (currentSort === 'dueDate') {
        result.sort((a, b) => {
            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return compareAsc(
                parse(a.dueDate, 'yyyy-MM-dd', new Date()),
                parse(b.dueDate, 'yyyy-MM-dd', new Date())
            );
        });
    }

    return result;
}

// Feature 3: Format a yyyy-MM-dd string into a display label + CSS class
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
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
