// This file must be imported in `cli.ts` before any other imports.
// In ES modules, all imports are hoisted and evaluated before the rest of the file's code runs, so importing this first
// guarantees that environment vars are set before anything.
// It's important for our logger to know that it's running in the CLI context as early as possible.

process.env.PROCESS_NAME = 'cli';
