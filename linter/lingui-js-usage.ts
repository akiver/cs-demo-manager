import { ESLintUtils, ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type Options = [];
type MessagesIds = 'reactModuleMessage';

/**
 * Ensure that we use the macro lingui modules instead of @lingui/react.
 * See https://lingui.dev/guides/message-extraction#supported-patterns for why we should use the macro modules.
 * Note: no need to detect the usage of @lingui/macro which is deprecated since v5 as it's detected by the "no-deprecated" linter rule.
 */
export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessagesIds>({
  meta: {
    messages: {
      reactModuleMessage: `Using the @lingui/react module is forbidden.\nPlease use '@lingui/react/macro' instead.`,
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node): void {
        if (node.source.value !== '@lingui/react') {
          return;
        }

        for (const specifier of node.specifiers) {
          if (!ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportSpecifier)(specifier)) {
            continue;
          }

          // Allow to import only I18nProvider as we have to wrap the application with it.
          if (specifier.imported.name !== 'I18nProvider') {
            context.report({
              node,
              messageId: 'reactModuleMessage',
              fix: (fixer) => {
                return fixer.replaceText(node.source, `'@lingui/react/macro'`);
              },
            });
          }
        }
      },
    };
  },
});
