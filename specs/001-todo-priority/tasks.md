# Tasks: Todo Priority System

**Input**: Design documents from `/specs/001-todo-priority/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ui-contract.md ✓, quickstart.md ✓

**Tests**: Not requested in spec — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

## Path Conventions

All source files live at the repository root (flat structure — no `src/` directory):

- `index.html` — HTML structure
- `main.js` — All application logic
- `styles.css` — All styles

---

## Phase 1: Setup

**Purpose**: Confirm the development environment is working before making changes.

- [x] T001 Start dev server with `npm run dev` and confirm the todo app loads at localhost

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the data layer so every todo has a `priority` field. Required before any user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Add `PRIORITY_ORDER` constant (`{ high: 0, medium: 1, low: 2 }`) and `currentSortPriority = false` state variable in `main.js`
- [x] T003 Update `loadTodos()` in `main.js` to migrate legacy todos — map each todo with `priority: todo.priority ?? 'medium'` after parsing localStorage data
- [x] T004 Add `priority: 'medium'` field to the new todo object in `addTodo()` in `main.js` (hardcoded default — US1 will replace this with dynamic selector value)

**Checkpoint**: All todos (new and existing) now have a `priority` field. Reload with existing data and confirm no errors in console.

---

## Phase 3: User Story 1 — Assign Priority at Creation (Priority: P1) 🎯 MVP

**Goal**: Users can choose High, Medium, or Low when adding a new todo. Selection persists with the todo and defaults to Medium.

**Independent Test**: Add a todo with each priority level. Reload the page. Verify priorities are persisted correctly (visible via browser DevTools → localStorage). Confirm that submitting without selecting a priority creates a Medium todo.

### Implementation for User Story 1

- [x] T005 [P] [US1] Add priority selector button group (High / Medium / Low, Medium pre-selected) inside `.input-section` in `index.html`
- [x] T006 [P] [US1] Add `.priority-selector` and `.priority-btn` (including `.priority-btn.active`) CSS styles to `styles.css`
- [x] T007 [US1] Wire up priority selector click handlers in the init section of `main.js` — clicking a button removes `active` from siblings and adds it to the clicked button
- [x] T008 [US1] Update `addTodo()` in `main.js` to read the active `.priority-btn`'s `data-priority` value instead of the hardcoded `'medium'` default (added in T004)
- [x] T009 [US1] Reset priority selector to Medium (re-apply `active` to the Medium button, remove from others) after a todo is added successfully in `main.js`

**Checkpoint**: Add todos with each priority level. Check localStorage via DevTools. Confirm correct `priority` values are stored and selector resets to Medium after each submission.

---

## Phase 4: User Story 2 — Priority Visual Indicators (Priority: P2)

**Goal**: Every todo displays a colored pill badge showing its priority level (color + text label). Badges appear for both existing (migrated) and newly created todos.

**Independent Test**: With a mix of High, Medium, and Low todos visible in the list, confirm each has a correctly styled and labeled badge. Verify completed todos also show their badge.

### Implementation for User Story 2

- [x] T010 [P] [US2] Add `.priority-badge`, `.priority-high`, `.priority-medium`, and `.priority-low` CSS classes to `styles.css` using the colors from `contracts/ui-contract.md`
- [x] T011 [US2] Add priority badge HTML (`<span class="priority-badge priority-${todo.priority}">`) to the `renderTodos()` function in `main.js`, positioned before the due date badge in the todo row

**Checkpoint**: All todos show a colored badge labeled "High", "Medium", or "Low". Toggle dark mode and confirm badges remain readable.

---

## Phase 5: User Story 3 — Sort by Priority (Priority: P3)

**Goal**: A "Sort by priority" button reorders the list High → Medium → Low. Works independently and composably with the existing "Sort by due date" button.

**Independent Test**: Create todos with mixed priorities. Click "Sort by priority" — verify High todos are first, Low are last. Enable both sort buttons — verify priority is primary and due date is secondary within each priority group.

### Implementation for User Story 3

- [x] T012 [P] [US3] Add `<button class="sort-btn" id="sortPriorityBtn">Sort by priority</button>` to the `.filters` section in `index.html`, alongside the existing `sortDueDateBtn`
- [x] T013 [P] [US3] Replace the sort block in `getFilteredTodos()` in `main.js` with a composed comparator: when `currentSortPriority` is true apply `PRIORITY_ORDER` as the primary key; when `currentSort === 'dueDate'` apply due date as secondary key (nulls last)
- [x] T014 [US3] Add `sortPriorityBtn` click event handler in `main.js` — toggles `currentSortPriority`, adds/removes `.active` class on the button, calls `renderTodos()`

**Checkpoint**: Sort by priority works alone and combined with sort by due date. Deactivating the button restores default order.

---

## Phase 6: User Story 4 — Change Priority on Existing Todos (Priority: P4)

**Goal**: Each todo row contains a compact `<select>` showing its current priority. Changes save immediately and persist on reload.

**Independent Test**: Change a High priority todo to Low via the inline select. Verify the badge updates immediately. Reload the page and confirm the change persisted.

### Implementation for User Story 4

- [x] T015 [P] [US4] Add `.todo-priority-select` CSS styles to `styles.css` — borderless, transparent background, using `var(--color-muted)` for color
- [x] T016 [US4] Add inline priority `<select>` HTML (with High/Medium/Low options and current priority pre-selected) to the todo row template inside `renderTodos()` in `main.js`
- [x] T017 [US4] Wire up the `change` event handler on the inline select inside `renderTodos()` in `main.js` — update `todo.priority`, call `saveTodos()`, call `renderTodos()`

**Checkpoint**: All four user stories are now independently functional. Run through the full quickstart.md verification checklist.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verify cross-cutting quality — dark mode compatibility and end-to-end manual validation.

- [x] T018 [P] Verify priority selector buttons (`.priority-btn`) and inline select (`.todo-priority-select`) render correctly in dark mode — confirm CSS variable usage in `styles.css` is correct and no hardcoded light-mode colors are present on interactive elements
- [x] T019 Run all 8 verification scenarios from `specs/001-todo-priority/quickstart.md` and confirm each passes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS all user stories**
- **User Story Phases (3–6)**: All depend on Phase 2 completion
  - US1 (P1) → US2 (P2) → US3 (P3) → US4 (P4) is the recommended sequential order
  - US2 can start after Foundational (badges work on migrated todos even without US1)
  - US3 can start after Foundational (sort logic uses `PRIORITY_ORDER` from T002)
  - US4 depends on US2 being done first (inline select lives in the same `renderTodos()` block as the badge)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no story dependencies
- **US2 (P2)**: After Foundational — no story dependencies (badges work without the creation selector)
- **US3 (P3)**: After Foundational — no story dependencies (sort is independent of badges)
- **US4 (P4)**: After US2 — shares `renderTodos()` with the badge; implement inline select after badge is in place to avoid merge conflicts

### Within Each User Story

- HTML structure tasks before JS wiring tasks (DOM must exist before event handlers are attached)
- CSS tasks can run in parallel with HTML/JS tasks (different files)
- Core implementation before integration with other features

### Parallel Opportunities

- **US1**: T005 (index.html) + T006 (styles.css) can run in parallel before T007/T008/T009
- **US2**: T010 (styles.css) can run in parallel with T011 (main.js)
- **US3**: T012 (index.html) + T013 (main.js sort logic) can run in parallel; T014 depends on both
- **US4**: T015 (styles.css) can run in parallel with T016/T017 (main.js)
- **Polish**: T018 (CSS review) can run in parallel with T019 (end-to-end check)

---

## Parallel Example: User Story 1

```text
# Step 1 — Run in parallel (different files):
Task T005: Add priority selector HTML to index.html
Task T006: Add priority-btn CSS to styles.css

# Step 2 — Sequential (depends on T005):
Task T007: Wire up selector click handlers in main.js
Task T008: Update addTodo() to read selected priority in main.js
Task T009: Reset selector to Medium after add in main.js
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (T002–T004)
3. Complete Phase 3: User Story 1 (T005–T009)
4. **STOP and VALIDATE**: Confirm priority is saved to localStorage for newly added todos
5. Demo if ready

### Incremental Delivery

1. Phase 1 + 2 → Data layer ready (all todos have priority, no visible change yet)
2. Phase 3 (US1) → Users can set priority at creation
3. Phase 4 (US2) → Users can see priorities on all todos → **First visible value to users**
4. Phase 5 (US3) → Users can sort by priority
5. Phase 6 (US4) → Users can change priority inline
6. Phase 7 (Polish) → Verified, dark mode confirmed

### Single Developer Strategy

Work sequentially in priority order: Foundation → US1 → US2 → US3 → US4 → Polish. Each phase leaves the app in a working state.

---

## Notes

- **[P]** tasks touch different files — safe to implement in parallel
- **[Story]** label maps each task to its user story for traceability
- `renderTodos()` is modified in both US2 (T011) and US4 (T016/T017) — do these sequentially to avoid conflicts
- Commit after each checkpoint (end of each phase) at minimum
- Badge colors in `.priority-high/medium/low` are intentionally static (not CSS variables) — consistent with how existing due-date badges work
- Total: **19 tasks** across 7 phases
