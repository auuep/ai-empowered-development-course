# Quickstart: Todo Priority System

**Feature**: 001-todo-priority
**Branch**: `001-todo-priority`

---

## Prerequisites

- Node.js installed
- Dependencies already installed (`npm install`)

## Running the App

```bash
npm run dev
```

Opens at `http://localhost:5173` (or the next available port).

## Files to Modify

This feature touches three files at the project root:

| File | What changes |
|------|-------------|
| `index.html` | Add priority selector to input form; add Sort by Priority button |
| `main.js` | Extend todo model, migration, rendering, sorting, event handlers |
| `styles.css` | Priority badge styles, priority selector styles |

## Key Areas in main.js

| Concern | Location | Change |
|---------|----------|--------|
| Constants | Top of file (after STORAGE_KEY) | Add `PRIORITY_ORDER` constant |
| State | After `currentSort` declaration | Add `currentSortPriority = false` |
| `loadTodos()` | Lines 17–24 | Add migration for legacy todos |
| `addTodo()` | Lines 128–143 | Read priority from form selector |
| `renderTodos()` | Lines 162–216 | Add priority badge + inline select |
| `getFilteredTodos()` | Lines 219–243 | Add priority sort logic |
| Init/event handlers | Lines 68–90 | Wire up Sort by Priority button |

## Verifying the Feature Works

1. **Creation**: Add a todo with High priority — badge shows "High" in red.
2. **Default**: Add a todo without selecting priority — badge shows "Medium".
3. **Persistence**: Reload page — priorities are still correct.
4. **Legacy migration**: Open browser DevTools → Application → localStorage → delete `priority` from a todo JSON, reload — that todo shows "Medium".
5. **Sort by priority**: Click "Sort by Priority" — High todos float to top.
6. **Combined sort**: Enable both "Sort by Priority" and "Sort by Due Date" — High todos are first; within High, earlier due dates come first.
7. **Inline edit**: Change a todo's priority via the inline dropdown — badge updates immediately, persists on reload.
8. **Filter + sort**: Filter to "Active", enable priority sort — only active todos shown, still sorted by priority.

## Clearing Test Data

```js
// In browser console — clears all stored todos
localStorage.removeItem('todos-app');
location.reload();
```
