/**
 * How long a background task is given to finish once the database is being released.
 *
 * ! One value for every caller. A per-caller deadline means two of them can disagree about the same
 * drain, and whoever gives up first destroys the connection under the other one.
 */
export const BACKGROUND_TASK_DRAIN_TIMEOUT_MS = 5_000;
export const SHUTDOWN_MARGIN_MS = 10_000;
