/**
 * source-map-support is required to have sourcemaps pointing to the actual TS files path in production mode.
 * ! It works only for Node.js processes.
 *
 * We could use the Node.js flag "--enable-source-maps" but it's not supported by Electron and would slows down startup of the app.
 * For supported Node.js flags by Electron, see https://electronjs.org/docs/latest/api/command-line-switches#nodejs-flags
 * If we don't use the module "source-map-support", sourcemaps will point to minified JS files path that are hard to read.
 *
 * --enable-source-maps Node.js doc: https://nodejs.org/docs/latest-v18.x/api/cli.html#--enable-source-maps
 */
import 'source-map-support/register';
