# Getting Started
In section you will learn to how to run the demo TODO app on localhost so you can use it to complete the exercises.

## Prerequisites
- An IDE ([Cursor](https://cursor.com), VSCode, or terminal-only)
- Access to Claude (For Netlighter's follow this [guide](https://docs.chat.netlight.com/guide/codepilot/tools/claude-code))
- [Install Node](https://nodejs.org/en/download)

## Project Structure

```
ai-empowered-development-course/
├── index.html      # Main HTML markup - contains the app layout
├── styles.css      # All CSS styling for the app
├── main.js         # Application logic (add, delete, filter todos)
├── package.json    # Project dependencies and scripts
└── vite.config.js  # Vite configuration
```

**How it works:**
- `index.html` defines the structure (input field, buttons, todo list)
- `styles.css` styling
- `main.js` handles all the interactivity (adding todos, marking complete, filtering)

## Exercise: Run the TODO App
**Goal**: Get the TODO app running locally to verify your setup works

**Steps**:
1. Clone the repository (choose one option):

   **Option A: Clone directly (read-only)**
   ```bash
   git clone https://github.com/RBirkeland/ai-empowered-development-course
   cd ai-empowered-development-course
   ```

   **Option B: Fork and clone your fork (recommended)**
   ```bash
   # Fork the repository on GitHub first (click "Fork" on the repo page)
   git clone https://github.com/YOUR_USERNAME/ai-empowered-development-course
   cd ai-empowered-development-course
   ```

   **Why fork?** If you fork your own copy, you can push your exercise solutions and create pull requests; cloning directly gives you read-only access. For this bootcamp, we recommend forking so you can practice the full development workflow including commits, pushes, and PRs. If you just want to test without pushing anything you can go with Option A.

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open the app at the URL shown (typically `http://localhost:5173`)

5. Test: add a todo, mark it complete, delete it, try the filter buttons

**Exercise is complete when**: App loads without errors and all basic features (add, complete, delete, filter) work
