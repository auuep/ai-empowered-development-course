# Implementation Plan: Todo Priority System

**Branch**: `001-todo-priority` | **Date**: 2026-03-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-todo-priority/spec.md`

## Summary

Add High/Medium/Low priority to todos in a vanilla JS/Vite todo app. Extend the todo data model with a `priority` field (default: `'medium'`), add a segmented selector to the creation form, render a colored badge per todo, support inline priority editing, and add a composable "Sort by Priority" button that works alongside the existing due-date sort. Migrate legacy localStorage todos to Medium priority at load time.

## Technical Context

**Language/Version**: JavaScript (ES Modules, no TypeScript)
**Primary Dependencies**: date-fns 4.1.0 (existing), Vite 7.3.1 (build)
**Storage**: Browser localStorage, key `'todos-app'`, full JSON re-serialization on every change
**Testing**: None configured (no test runner in project)
**Target Platform**: Browser (single-page app served by Vite dev server)
**Project Type**: Vanilla JS single-page web application
**Performance Goals**: Renders instantly for typical personal todo lists (< 200 items)
**Constraints**: Must not break existing todos stored in localStorage (backward compatibility)
**Scale/Scope**: Single user, single page, all state in memory + localStorage

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The project constitution (`/.specify/memory/constitution.md`) is the unmodified default template — no project-specific principles have been ratified. There are no constitution gates to evaluate.

**Post-design re-check**: No violations. The design adds to existing patterns (badge approach, segmented buttons, filter/sort state) without introducing new architectural layers or dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-priority/
├── plan.md              # This file
├── research.md          # Phase 0: design decisions
├── data-model.md        # Phase 1: extended todo model + state
├── quickstart.md        # Phase 1: dev setup and verification
├── contracts/
│   └── ui-contract.md   # Phase 1: UI states and interaction contract
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
index.html       # Add priority selector to input form + Sort by Priority button
main.js          # Extend model, migration, rendering, sorting, event handlers
styles.css       # Priority badge styles + priority selector styles
```

This project has no `src/` directory — all source files live at the repository root.

**Structure Decision**: Flat single-project layout. All changes are confined to three existing files. No new files, modules, or directories are created in the source tree.

## Implementation Blueprint

### 1. Constants & State (`main.js`)

Add after the existing `STORAGE_KEY` constant and state declarations:

```js
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
let currentSortPriority = false;
```

---

### 2. Migration in `loadTodos()` (`main.js`)

After parsing the stored JSON, migrate todos that lack a `priority` field:

```js
function loadTodos() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        const data = JSON.parse(stored);
        todos = data.todos.map(todo => ({
            ...todo,
            priority: todo.priority ?? 'medium'
        }));
        nextId = data.nextId;
    }
}
```

---

### 3. HTML: Priority Selector in Add Form (`index.html`)

Add a segmented button group inside `.input-section`, between the date input and the Add button:

```html
<div class="priority-selector" id="prioritySelector">
    <button type="button" class="priority-btn" data-priority="high">High</button>
    <button type="button" class="priority-btn active" data-priority="medium">Medium</button>
    <button type="button" class="priority-btn" data-priority="low">Low</button>
</div>
```

---

### 4. HTML: Sort by Priority Button (`index.html`)

Add alongside the existing `sortDueDateBtn` inside `.filters`:

```html
<button class="sort-btn" id="sortPriorityBtn">Sort by priority</button>
```

---

### 5. `addTodo()` — Read Priority from Selector (`main.js`)

Read the active priority button before creating the todo object:

```js
const priorityBtn = document.querySelector('.priority-btn.active');
const priority = priorityBtn ? priorityBtn.dataset.priority : 'medium';

const todo = {
    id: nextId++,
    text,
    completed: false,
    dueDate: dueDate || null,
    notes: '',
    priority
};
```

After adding, reset selector to Medium:
```js
document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.priority === 'medium');
});
```

---

### 6. `renderTodos()` — Priority Badge + Inline Select (`main.js`)

**Priority badge HTML** (added before `badgeHtml` in the row):
```js
const priorityLabel = todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1);
const priorityBadgeHtml = `<span class="priority-badge priority-${todo.priority}">${priorityLabel}</span>`;
```

**Inline priority select** (added after delete button):
```js
const prioritySelectHtml = `
    <select class="todo-priority-select" aria-label="Todo priority">
        <option value="high" ${todo.priority === 'high' ? 'selected' : ''}>High</option>
        <option value="medium" ${todo.priority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="low" ${todo.priority === 'low' ? 'selected' : ''}>Low</option>
    </select>
`;
```

**Event handler** for priority select (add alongside existing checkbox/delete listeners):
```js
li.querySelector('.todo-priority-select').addEventListener('change', (e) => {
    const todoItem = todos.find(t => t.id === todo.id);
    if (todoItem) {
        todoItem.priority = e.target.value;
        saveTodos();
        renderTodos();
    }
});
```

---

### 7. `getFilteredTodos()` — Priority Sort (`main.js`)

Replace the existing sort block with a composed sort that handles both flags:

```js
if (currentSortPriority || currentSort === 'dueDate') {
    result.sort((a, b) => {
        // Primary: priority (when enabled)
        if (currentSortPriority) {
            const diff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
            if (diff !== 0) return diff;
        }
        // Secondary: due date (when enabled)
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
```

---

### 8. Sort by Priority Button Event Handler (`main.js`)

Add in the init/event handler section alongside the existing `sortDueDateBtn` handler:

```js
document.getElementById('sortPriorityBtn').addEventListener('click', () => {
    currentSortPriority = !currentSortPriority;
    document.getElementById('sortPriorityBtn').classList.toggle('active', currentSortPriority);
    renderTodos();
});
```

---

### 9. Priority Selector Event Handler in Init (`main.js`)

Wire up the priority selector buttons:

```js
document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
```

---

### 10. CSS: Priority Badge Styles (`styles.css`)

```css
.priority-badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
}

.priority-high   { background: #fee2e2; color: #b91c1c; }
.priority-medium { background: #fef3c7; color: #b45309; }
.priority-low    { background: #d1fae5; color: #065f46; }
```

---

### 11. CSS: Priority Selector (Add Form) Styles (`styles.css`)

```css
.priority-selector {
    display: flex;
    gap: 4px;
}

.priority-btn {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    background: var(--color-surface);
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.875rem;
}

.priority-btn.active {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
}
```

---

### 12. CSS: Inline Priority Select Styles (`styles.css`)

```css
.todo-priority-select {
    border: none;
    background: transparent;
    color: var(--color-muted);
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0;
}
```

---

## Complexity Tracking

> No violations — no table needed.

The implementation extends existing patterns without adding layers, abstractions, or dependencies.
