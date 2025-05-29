// This variable represents the current version of the JSON settings schema.
// It's used to migrate settings schema at app startup.
// If you need to alter the settings schema or change current settings values, this variable has to be incremented
// and the corresponding migration must be added to the getAllMigrations function!
export const CURRENT_SCHEMA_VERSION = 8;
