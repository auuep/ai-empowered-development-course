# UI Contract: Todo Priority System

**Feature**: 001-todo-priority
**Date**: 2026-03-04

This document defines the user-facing interface contract for the priority system — the states, interactions, and visual guarantees the UI must uphold.

---

## Priority Badge Contract

Each todo item MUST display exactly one priority badge at all times.

### States

| State | Label | Background | Text color | CSS class |
|-------|-------|------------|------------|-----------|
| High | `High` | `#fee2e2` | `#b91c1c` | `priority-high` |
| Medium | `Medium` | `#fef3c7` | `#b45309` | `priority-medium` |
| Low | `Low` | `#d1fae5` | `#065f46` | `priority-low` |

### Invariants

- Badge is always visible (not hidden on completion or when notes are open)
- Badge appears in the todo row alongside the due date badge (order: priority → due date)
- Badge text matches the stored priority exactly: "High", "Medium", or "Low" (capitalized)
- Badge is not interactive (display-only; changes are made via the inline select)

---

## Priority Selector Contract (Add-Todo Form)

A segmented button group appears in the add-todo input section, between the date input and the Add button.

### States

| Button | Value | Default selected? |
|--------|-------|------------------|
| High   | `'high'`   | No |
| Medium | `'medium'` | Yes |
| Low    | `'low'`    | No |

### Behaviour

- Exactly one button is active at all times (no deselection without selecting another)
- Active button has visually distinct style (matches the active filter button convention)
- After a todo is added, the selector resets to Medium
- The selected value is submitted with the new todo on Add button click or Enter key

---

## Inline Priority Select Contract (Existing Todos)

Each todo row contains a `<select>` element showing the current priority.

### States

| Option | Value |
|--------|-------|
| High | `'high'` |
| Medium | `'medium'` |
| Low | `'low'` |

### Behaviour

- Displays the current priority as the selected option
- On `change` event: saves new priority to the todo, persists to localStorage, re-renders badge
- No confirmation required — change is immediate and auto-saved
- Styled minimally (no heavy border) to avoid dominating the todo row

---

## Sort by Priority Button Contract

A "Sort by Priority" button is added to the filters row alongside the existing "Sort by due date" button.

### States

| State | Visual | `currentSortPriority` |
|-------|--------|-----------------------|
| Inactive | Default button style | `false` |
| Active | Accent color (matches sort-by-due-date active style) | `true` |

### Behaviour

- Clicking toggles between active and inactive
- When active: todos sorted High → Medium → Low
- When both priority sort and due date sort are active: priority is primary, due date is secondary
- State is not persisted across page reloads (resets to inactive on load)

---

## Interaction Summary

| User action | System response |
|-------------|-----------------|
| Select priority in add form + click Add | Todo created with selected priority; form resets to Medium |
| Do not select priority + click Add | Todo created with Medium priority |
| Change inline select on existing todo | Priority updated and saved immediately; badge updates |
| Click Sort by Priority (inactive) | List reorders High → Medium → Low; button becomes active |
| Click Sort by Priority (active) | List returns to default order; button becomes inactive |
| Reload page | Priority badges shown correctly; sort buttons reset to inactive |
