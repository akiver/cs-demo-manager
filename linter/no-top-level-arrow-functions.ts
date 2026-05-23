import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

type Options = [];
type MessagesIds = 'noTopLevelArrowFunction';

export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessagesIds>({
  meta: {
    messages: {
      noTopLevelArrowFunction: 'Top-level arrow functions are not allowed. Use a function declaration instead.',
    },
    schema: [],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      VariableDeclarator(node) {
        if (
          node.init?.type !== AST_NODE_TYPES.ArrowFunctionExpression ||
          node.parent?.type !== AST_NODE_TYPES.VariableDeclaration ||
          node.parent?.parent?.type !== AST_NODE_TYPES.Program
        ) {
          return;
        }

        const declaration = node.parent;
        const arrowFn = node.init;

        context.report({
          node,
          messageId: 'noTopLevelArrowFunction',
          fix(fixer) {
            if (declaration.declarations.length !== 1) {
              return null;
            }

            const { sourceCode } = context;
            const name = sourceCode.getText(node.id);
            const paramsText = arrowFn.params.map((p) => sourceCode.getText(p)).join(', ');
            const typeParamsText = arrowFn.typeParameters ? sourceCode.getText(arrowFn.typeParameters) : '';
            const returnTypeText = arrowFn.returnType ? sourceCode.getText(arrowFn.returnType) : '';
            const asyncPrefix = arrowFn.async ? 'async ' : '';

            let bodyText: string;
            if (arrowFn.body.type === AST_NODE_TYPES.BlockStatement) {
              bodyText = sourceCode.getText(arrowFn.body);
            } else {
              bodyText = `{ return ${sourceCode.getText(arrowFn.body)}; }`;
            }

            return fixer.replaceText(
              declaration,
              `${asyncPrefix}function ${name}${typeParamsText}(${paramsText})${returnTypeText} ${bodyText}`,
            );
          },
        });
      },
    };
  },
});
