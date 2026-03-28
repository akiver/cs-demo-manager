import { rule as noReactReduxImport } from './linter/no-react-redux-import.js';
import { rule as linguiJsUsage } from './linter/lingui-js-usage.js';

const plugin = {
  meta: {
    name: 'csdm',
  },
  rules: {
    'no-react-redux-import': noReactReduxImport,
    'lingui-js-usage': linguiJsUsage,
  },
};

// oxlint-disable-next-line import/no-default-export
export default plugin;
