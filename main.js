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

function init() {
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
        dueDate: dueDateInput.value || null
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

        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <span class="todo-text">${escapeHtml(todo.text)}</span>
            ${badgeHtml}
            <button class="todo-delete">Delete</button>
        `;

        li.querySelector('.todo-checkbox').addEventListener('change', () => toggleTodo(todo.id));
        li.querySelector('.todo-delete').addEventListener('click', () => deleteTodo(todo.id));

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
