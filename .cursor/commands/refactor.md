# refactor

For what is being refactored, gain context for any llm-context.md available in the given folder and that folder's parents up to (but not including) root.
These will have important information about the specifics of the feature as well as best practices. Pay special attention to any relevant best practices, as this is the focus for refactoring in particular.

For example, if you are tasked with refactoring the Outfitter UI contained within src/app/outfitter, you should read the following llm-context.md files:

- src/app/outfitter/llm-context.md
- src/app/llm-context.md
- src/llm-context.md

If the refactoring includes React Components in any way, ensure you also read .cursor/rules/refactoring-components.mdc for instructions on how to structure components.

Create a temporary REFACTOR_PLAN.md file in the relevant folder.
You are to then examine what you are to refactor for any violations. For each violation rate them by priority and determine a recommended refactoring method. List these in the plan. If there are any alternative ways to refactor to fit with best practices, list them as alternatives.

Present this document to the user and await their approval. They may adjust the plan directly or instruct you to do so. Once they approve the plan ensure you re-read the plan just in case there are changes then go ahead and get started.

Ensure that all changes are appropriately covered with tests, following any relevant testing llm-context.md best practices, including tests/llm-context.md

Wrap up refactoring by following these steps:

- Make any appropriate updates to llm-context files, if necessary.
- Delete the REFACTOR_PLAN.md file.
- Run the following scripts:
  - npm run type-check
  - npm run test:coverage
  - npm run lint:fix

Fix any remaining issues revealed by those scripts.
Report the changes to the user.
