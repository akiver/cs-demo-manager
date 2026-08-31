import fs from 'fs-extra';
import { getAppFolderPath } from 'csdm/node/filesystem/get-app-folder-path';

// Imported by the logger before it can create the logs folder. This snapshot is what lets settings
// recovery tell a truly fresh installation apart from an existing one whose settings were removed.
export const appFolderExistedAtProcessStart = fs.existsSync(getAppFolderPath());
