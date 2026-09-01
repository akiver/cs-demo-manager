// This file must be imported in `start-server.ts` before any other imports.
// In ES modules, all imports are hoisted and evaluated before the rest of the file's code runs, so importing this first
// guarantees that environment vars are set before anything.
// It's important for our logger: the daemon inherits the environment of the process that spawned it (possibly the CLI)
// and the logger reads PROCESS_NAME when it's created.
process.env.PROCESS_NAME = 'server';
