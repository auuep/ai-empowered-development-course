# Research: Todo Priority System

**Feature**: 001-todo-priority
**Date**: 2026-03-04
**Status**: Complete — no NEEDS CLARIFICATION markers in spec

---

## Decision 1: Priority Selector UI in the Add-Todo Form

**Decision**: Segmented button group (three buttons: High / Medium / Low) with one active at a time, defaulting to Medium.

**Rationale**: The existing app already uses a segmented button pattern for the All/Active/Completed filter. Reusing this pattern is visually consistent, immediately scannable, and requires no dropdown interaction. A `<select>` dropdown is more compact but less discoverable and visually distinct from the existing design language.

**Alternatives considered**:
- `<select>` dropdown — simpler HTML but inconsistent with existing button-group UI; less visually scannable.
- Radio buttons — semantically accurate but require more horizontal/vertical space and don't match the existing design.
- Icon-only buttons (▲▼–) — too cryptic for new users; fails the "text label" accessibility requirement (FR-004).

---

## Decision 2: Priority Selector UI on Existing Todos (Inline Edit)

**Decision**: A compact `<select>` dropdown embedded in each todo row, showing the current priority. Changes save immediately on `change` event.

**Rationale**: The todo row already has several elements (checkbox, text, due date badge, notes button, delete button). A three-button segmented control would be too wide. A `<select>` is compact, native, and keyboard-accessible. Its visual design can be styled to be minimal (no border chrome, colored text) to avoid cluttering the row.

**Alternatives considered**:
- Click-to-cycle (click badge to cycle High→Medium→Low→High) — fun but not discoverable and hard to skip a value.
- Inline segmented buttons — too wide for a todo row.
- Edit modal/panel — overkill for a single field; inconsistent with the notes textarea inline approach.

---

## Decision 3: Sort State Architecture

**Decision**: Add a separate boolean `currentSortPriority` alongside the existing `currentSort` string. When `currentSortPriority` is `true`, priority is applied as the primary sort key. When `currentSort === 'dueDate'`, due date is applied as secondary (within same priority group). The two sort options are independent toggles that compose.

**Rationale**: The existing `currentSort` is a string toggling between `'default'` and `'dueDate'`. Changing it to a third state `'priority'` would break the ability to combine priority + due date sorting (required by FR-008). Using two independent boolean flags — or a boolean for priority plus the existing string — allows the composable behaviour specified in the requirements.

**Alternatives considered**:
- Single `currentSort` with `'priority+dueDate'` composite value — possible but creates a combinatorial explosion of states as more sorts are added.
- Priority-always-first with no toggle — simpler but removes user control and changes existing list order unexpectedly for returning users.

---

## Decision 4: Priority Visual Style

**Decision**: A colored pill badge rendered before the due date badge in each todo row. Three colors using the same static approach as due date badges (background + text color pairs):

| Priority | Background | Text | Label |
|----------|------------|------|-------|
| High     | `#fee2e2` (red-100)    | `#b91c1c` (red-700) | High |
| Medium   | `#fef3c7` (amber-100)  | `#b45309` (amber-700) | Medium |
| Low      | `#d1fae5` (green-100)  | `#065f46` (green-700) | Low |

**Rationale**: Matches the color approach already used for due date badges. Colors chosen from the same Tailwind palette already present in the codebase. Both color AND text label satisfy FR-004's accessibility requirement (distinguishable without color alone).

**Alternatives considered**:
- CSS custom property-based theme colors — overkill for three static states; due date badges are also static colors.
- Icon-only (flag emoji 🚩🟡🔵) — fails text label requirement (FR-004).
- Border-left accent on the todo-item `<li>` — visually clean but less immediately parseable when scanning; less consistent with the badge pattern already used.

---

## Decision 5: Backward Compatibility for Legacy Todos

**Decision**: In `loadTodos()`, after parsing localStorage data, iterate all todos and set `todo.priority = todo.priority ?? 'medium'` for any todo missing the field.

**Rationale**: One-time migration at load time is simpler than defensive null-checks scattered throughout render and sort code. This matches the implicit contract in FR-009 and the Assumptions section of the spec.

**Alternatives considered**:
- Fallback in every access site (`todo.priority ?? 'medium'`) — works but is error-prone and repetitive.
- Version field on the stored object to trigger migration — unnecessary complexity for a single-field addition.

---

## No Further Unknowns

All NEEDS CLARIFICATION items were resolved at spec time. No external APIs, authentication, or service integrations are involved. The project is a standalone vanilla JS/Vite app with localStorage persistence.
