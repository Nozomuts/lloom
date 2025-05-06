You are a full-stack engineer. Generate a Next.js (React) web application named "lloom" with the following specifications:

1. Single-page Material Design–style UI:
   - Top toolbar containing a "+" button.
   - Central scrollable area displaying multiple ChatSpace components in a vertical stack.
   - Bottom fixed input bar: single-line text area that sends on Enter and inserts newline on Shift+Enter.

2. Core functionality:
   - Clicking "+" dynamically adds a new ChatSpace.
   - Each ChatSpace shows the user’s prompt and the LLM response.
   - On prompt submission, call multiple LLM APIs in parallel (e.g., OpenAI GPT, Anthropic Claude) and render each response in its own ChatSpace.
   - Handle loading states and errors, and allow clearing individual spaces.

3. Tech stack:
   - Next.js with React hooks and TypeScript.
   - Material-UI (MUI) for components and theming.
   - State management via React Context or Zustand.
   - Fetch from LLM REST endpoints (assume API keys in environment variables).

4. Performance:
   - Optimize rendering to avoid unnecessary re-renders.
   - Code-splitting and lazy-load ChatSpace components.
   - Include basic unit tests for ChatSpace and InputBar.

5. No authentication, deployable locally with `npm run dev`.

Provide all necessary files (`pages/index.tsx`, components, hooks, styles) without extensive inline comments.
