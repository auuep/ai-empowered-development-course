# Data Model: Todo Priority System

**Feature**: 001-todo-priority
**Date**: 2026-03-04

---

## Extended Todo Object

The existing `todo` object is extended with one new field:

```js
{
  id:        number,          // Existing — unique identifier (auto-increment)
  text:      string,          // Existing — todo title
  completed: boolean,         // Existing — completion state
  dueDate:   string | null,   // Existing — ISO date string 'yyyy-MM-dd' or null
  notes:     string,          // Existing — freeform notes (default '')
  priority:  'high' | 'medium' | 'low'  // NEW — priority level (default 'medium')
}
```

### Field Details: `priority`

| Attribute     | Value |
|---------------|-------|
| Type          | String enum |
| Allowed values | `'high'`, `'medium'`, `'low'` |
| Default       | `'medium'` |
| Required      | Yes (all todos must have a priority after migration) |
| Persisted     | Yes (included in localStorage JSON) |
| Mutable       | Yes (user can change on any existing todo) |

---

## Priority Sort Order

Priority values have a defined ordering used for sorting:

| Priority | Sort rank (ascending) |
|----------|-----------------------|
| `'high'`   | 0 (first) |
| `'medium'` | 1 |
| `'low'`    | 2 (last) |

Implemented as a lookup constant:

```js
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
```

---

## Application State Changes

Two state variables are affected:

| Variable | Type | Before | After | Notes |
|----------|------|--------|-------|-------|
| `todos` | `Array<Todo>` | Existing | Extended with `priority` field | Each todo gains `priority` |
| `currentSort` | string | `'default' \| 'dueDate'` | Unchanged | Existing due-date sort |
| `currentSortPriority` | boolean | (new) | `false` | New — tracks priority sort toggle state |

---

## Persistence Schema

Stored in `localStorage` under key `'todos-app'` as JSON:

```json
{
  "todos": [
    {
      "id": 1,
      "text": "Submit report",
      "completed": false,
      "dueDate": "2026-03-10",
      "notes": "",
      "priority": "high"
    },
    {
      "id": 2,
      "text": "Buy coffee",
      "completed": false,
      "dueDate": null,
      "notes": "Ethiopian blend",
      "priority": "low"
    }
  ],
  "nextId": 3
}
```

---

## Migration: Legacy Todos Without Priority

Todos saved before this feature have no `priority` field. Migration runs at load time in `loadTodos()`:

```js
// After parsing stored data:
todos = data.todos.map(todo => ({
  ...todo,
  priority: todo.priority ?? 'medium'
}));
```

**Outcome**: All legacy todos gain `priority: 'medium'`. No user-visible change on first load beyond Medium badge appearing on all existing items.

---

## Validation Rules

| Rule | Detail |
|------|--------|
| Priority is required | Every new todo must have a priority (UI defaults to 'medium') |
| Priority must be a valid enum value | Only `'high'`, `'medium'`, `'low'` are accepted |
| Priority is case-sensitive | Stored and compared as lowercase strings |
| Priority is not cleared on completion | Completed todos retain their priority |

---

## Sort Composition

When both sort flags are active, the composed sort comparator is:

```text
Primary key:   priority rank (PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
Secondary key: due date ascending (compareAsc, nulls last) — only when currentSort === 'dueDate'
Tertiary key:  insertion order (stable sort preserves original array order within same group)
```

This satisfies FR-008: priority is always the primary sort when enabled.
