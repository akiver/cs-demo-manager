const { rule: noReactReduxImport } = require('./linter/no-react-redux-import');
const { rule: linguiJsUsage } = require('./linter/lingui-js-usage');

module.exports = {
  'no-react-redux-import': noReactReduxImport,
  'lingui-js-usage': linguiJsUsage,
};
