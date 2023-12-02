import { ESLintUtils, ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type Options = [];
type MessagesIds = 'useLinguiMessage' | 'transComponentMessage' | 'useI18nMessage';

/**
 * - Ensure we are using the internal useI18n hook instead of the useLingui hook from the @lingui/react module.
 * - Ensure that we use the macro version of the Trans component, not the one from the @lingui/react module.
 *   extracted. See https://lingui.dev/guides/message-extraction#non-macro-usages
 */
export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessagesIds>({
  meta: {
    messages: {
      useLinguiMessage: `Using useLingui from the @lingui/react module is forbidden.\nPlease use the internal hook 'useI18n' instead (csdm/ui/hooks/use-i18n).`,
      transComponentMessage: `Using the Trans component from the @lingui/react module is forbidden.\nPlease use the one from the '@lingui/macro' module instead.`,
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

          if (specifier.imported.name === 'useLingui') {
            context.report({
              node,
              messageId: 'useLinguiMessage',
              fix: (fixer) => {
                return fixer.replaceText(node, `import { useI18n } from 'csdm/ui/hooks/use-i18n';`);
              },
            });
          } else if (specifier.imported.name === 'Trans') {
            context.report({
              node,
              messageId: 'transComponentMessage',
              fix: (fixer) => {
                return fixer.replaceText(node.source, `'@lingui/macro'`);
              },
            });
          }
        }
      },
    };
  },
});
