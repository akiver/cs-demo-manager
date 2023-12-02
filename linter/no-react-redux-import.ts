import { ESLintUtils, ASTUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type Options = [];
type MessagesIds = 'forbiddenHook';

// Ensure that we use internal typed react-redux hooks instead of the ones from the react-redux module.
export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessagesIds>({
  meta: {
    messages: {
      forbiddenHook: 'Using {{hook}} from the react-redux module is forbidden.\n{{message}}',
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    let reactReduxImported = false;

    const forbiddenHooks = [
      { name: 'useDispatch', location: 'csdm/ui/store/use-dispatch' },
      { name: 'useSelector', location: 'csdm/ui/store/use-selector' },
      { name: 'useStore', location: 'csdm/ui/store/use-store' },
    ];

    return {
      ImportDeclaration(node): void {
        if (node.source.value !== 'react-redux') {
          return;
        }

        reactReduxImported = true;

        for (const specifier of node.specifiers) {
          if (!ASTUtils.isNodeOfType(AST_NODE_TYPES.ImportSpecifier)(specifier)) {
            continue;
          }

          const hook = forbiddenHooks.find((hook) => hook.name === specifier.imported.name);
          if (hook) {
            context.report({
              node,
              messageId: 'forbiddenHook',
              data: {
                hook: hook.name,
                message: `Please use the internal typed ${hook.name} hook instead (${hook.location})`,
              },
              fix: (fixer) => {
                return fixer.replaceText(node.source, `'${hook.location}'`);
              },
            });
          }
        }
      },
      MemberExpression: function (node) {
        if (!reactReduxImported) {
          return;
        }

        const property = node.property;
        if (!ASTUtils.isNodeOfType(AST_NODE_TYPES.Identifier)(property)) {
          return;
        }

        const hook = forbiddenHooks.find((hook) => hook.name === property.name);
        if (hook) {
          context.report({
            node,
            messageId: 'forbiddenHook',
            data: {
              hook: hook.name,
              message: `Please use the internal typed ${hook.name} hook instead (${hook.location})`,
            },
          });
        }
      },
    };
  },
});
