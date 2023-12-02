const { rule: noReactReduxImport } = require('./linter/no-react-redux-import');
const { rule: linguiJsUsage } = require('./linter/lingui-js-usage');
const { rule: noMissingTranslations } = require('./linter/no-missing-translations');

module.exports = {
  'no-react-redux-import': noReactReduxImport,
  'lingui-js-usage': linguiJsUsage,
  'no-missing-translations': noMissingTranslations,
};
