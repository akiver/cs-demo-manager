// Version of the @embedded-postgres/* npm packages providing the PostgreSQL binaries bundled with the app.
/** @public */
export const EMBEDDED_POSTGRESQL_PACKAGE_VERSION = '18.6.0-beta.19';

// A data folder is tied to the major version of the binaries that created it, it can't be opened by another one.
// "18.6.0-beta.19" gives 18.
export const EMBEDDED_POSTGRESQL_MAJOR_VERSION = Number.parseInt(EMBEDDED_POSTGRESQL_PACKAGE_VERSION, 10);
