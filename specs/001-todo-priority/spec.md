# Feature Specification: Todo Priority System

**Feature Branch**: `001-todo-priority`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "Add a priority system (High/Medium/Low) to todos with visual indicators and sorting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Assign Priority When Creating a Todo (Priority: P1)

A user wants to mark a new todo as important before adding it. When adding a new todo, they can select a priority level (High, Medium, or Low). The selected priority is saved with the todo and visible immediately after creation.

**Why this priority**: This is the foundation of the feature. Without the ability to assign priority, no other part of the feature delivers value. Users need to set priority at creation time to avoid an extra editing step.

**Independent Test**: Can be tested by creating a todo with each priority level (High, Medium, Low) and verifying each is saved and displayed correctly. Delivers core value: users can categorize tasks by importance.

**Acceptance Scenarios**:

1. **Given** the add-todo form is visible, **When** a user selects "High" priority and submits a new todo, **Then** the todo appears in the list with a High priority indicator.
2. **Given** the add-todo form is visible, **When** a user does not explicitly select a priority, **Then** the todo is created with Medium priority as the default.
3. **Given** the add-todo form is visible, **When** a user selects "Low" and submits, **Then** the todo shows the Low priority indicator.
4. **Given** a todo has been created, **When** the page is reloaded, **Then** the priority is still shown correctly (persisted).

---

### User Story 2 - View Priority Indicators on Each Todo (Priority: P2)

A user wants to see at a glance which todos are most important. Each todo in the list displays a clear visual indicator of its priority level — distinguishable by both color and label — so the user can quickly identify High, Medium, and Low priority tasks without interacting with them.

**Why this priority**: Visual indicators are the main user-facing value of the priority system. Without them, assigning priority has no practical benefit. This story depends on Story 1 (priority must be stored before it can be shown).

**Independent Test**: Can be tested by seeding todos with each priority level and verifying each displays a distinct visual indicator. Delivers value: users can scan their list and understand urgency without clicking.

**Acceptance Scenarios**:

1. **Given** a todo has High priority, **When** the list renders, **Then** a visually distinct High indicator (color + label) is shown on that todo item.
2. **Given** a todo has Medium priority, **When** the list renders, **Then** a distinct Medium indicator is shown.
3. **Given** a todo has Low priority, **When** the list renders, **Then** a distinct Low indicator is shown.
4. **Given** a completed todo has any priority level, **When** the list renders, **Then** the priority indicator is still visible (not hidden on completion).

---

### User Story 3 - Sort Todos by Priority (Priority: P3)

A user wants to process their most important todos first. They can sort the todo list by priority, which reorders the list so High priority todos appear at the top, followed by Medium, then Low. Todos without a priority difference retain their relative order within the same priority group.

**Why this priority**: Sorting provides actionability — it lets users focus on what matters most. This depends on both priority storage (P1) and visual indicators (P2) to be meaningful. It adds workflow value on top of the existing sort-by-due-date capability.

**Independent Test**: Can be tested by creating todos with mixed priorities, activating sort-by-priority, and verifying the order: High → Medium → Low within each group.

**Acceptance Scenarios**:

1. **Given** todos with mixed priorities exist, **When** the user activates "Sort by Priority", **Then** todos appear in order: High first, Medium second, Low last.
2. **Given** multiple todos share the same priority level, **When** sorted by priority, **Then** their relative order within that group remains stable.
3. **Given** sort-by-priority is active and sort-by-due-date is also toggled, **When** both are active, **Then** priority takes precedence as the primary sort and due date as the secondary sort within each priority group.
4. **Given** sort-by-priority is active, **When** the user deactivates it, **Then** todos return to their default insertion order.

---

### User Story 4 - Change Priority on an Existing Todo (Priority: P4)

A user's todo priorities change over time. They can update the priority of an existing todo directly from the list, without recreating it.

**Why this priority**: Real-world use requires updating priorities as circumstances change. This is an important quality-of-life feature but less critical than creation-time assignment and visual display.

**Independent Test**: Can be tested by creating a High priority todo, changing it to Low, and verifying the indicator updates immediately and persists on reload.

**Acceptance Scenarios**:

1. **Given** an existing todo has High priority, **When** the user changes it to Low, **Then** the indicator updates immediately to Low.
2. **Given** a priority change is made, **When** the page is reloaded, **Then** the updated priority is still shown correctly.

---

### Edge Cases

- What happens when an existing todo (created before this feature) has no priority set? It should be treated as Medium (default) and display correctly.
- What happens when a user filters to "Active" or "Completed" and then sorts by priority? Filtering and sorting should work together — sorted results should respect the active filter.
- What happens when the todo list is empty and sort-by-priority is toggled? The control remains available but no todos are reordered (graceful no-op).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to assign a priority level (High, Medium, or Low) to a todo at creation time.
- **FR-002**: System MUST default to Medium priority when no priority is explicitly selected during todo creation.
- **FR-003**: System MUST display a visually distinct indicator for each priority level (High, Medium, Low) on every todo item in the list.
- **FR-004**: Priority indicators MUST be distinguishable by both color and text label so users can tell them apart without relying on color alone.
- **FR-005**: Users MUST be able to sort the todo list by priority level (High → Medium → Low).
- **FR-006**: System MUST persist the priority of each todo across page reloads.
- **FR-007**: Users MUST be able to change the priority of an existing todo from the list view.
- **FR-008**: When sort-by-priority is active alongside another sort (e.g., by due date), priority MUST act as the primary sort key and due date as secondary.
- **FR-009**: Existing todos that predate this feature MUST be treated as Medium priority by default.
- **FR-010**: Priority filtering/sorting MUST work correctly in combination with the existing All/Active/Completed filters.

### Key Entities

- **Todo**: Extended with a `priority` attribute with three possible values: High, Medium, Low. Default value: Medium. Priority is part of the todo's persisted state.
- **Priority Level**: An ordered enumeration — High > Medium > Low — used for display and sort ordering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can assign a priority to a new todo in under 5 seconds (one additional interaction beyond the current creation flow).
- **SC-002**: All three priority levels are visually distinguishable at a glance — 100% of todos display the correct priority indicator without additional interaction.
- **SC-003**: Sort-by-priority correctly orders all todos (High first, Low last) within 1 second of activation with lists up to 100 items.
- **SC-004**: Priority changes on existing todos take effect immediately (no page reload required) and persist correctly on reload.
- **SC-005**: Existing todos without a stored priority are seamlessly treated as Medium — no errors, missing indicators, or broken sort behavior for legacy data.

## Assumptions

- The existing todo list currently supports at most a few hundred items — no special performance optimization is needed for sorting.
- Priority is not used as a filter (e.g., "show only High priority todos") — filtering by priority is out of scope for this feature.
- There is no notion of "No Priority" — every todo has a priority level, defaulting to Medium if not set.
- Priority applies to both active and completed todos (completed todos are not exempt from priority display).
- Keyboard shortcuts for changing priority or triggering priority sort are out of scope for this feature.
