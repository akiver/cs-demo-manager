import { rule as noReactReduxImport } from './linter/no-react-redux-import.js';
import { rule as linguiJsUsage } from './linter/lingui-js-usage.js';
import { rule as noTopLevelArrowFunctions } from './linter/no-top-level-arrow-functions.js';

const plugin = {
  meta: {
    name: 'csdm',
  },
  rules: {
    'no-react-redux-import': noReactReduxImport,
    'lingui-js-usage': linguiJsUsage,
    'no-top-level-arrow-functions': noTopLevelArrowFunctions,
  },
};

// oxlint-disable-next-line import/no-default-export
export default plugin;
