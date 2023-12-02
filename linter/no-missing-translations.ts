import { ESLintUtils, ASTUtils, AST_NODE_TYPES, TSESTree } from '@typescript-eslint/utils';

function isTransComponentNode(node: TSESTree.Node) {
  const parent = node.parent;
  if (!ASTUtils.isNodeOfType(AST_NODE_TYPES.JSXElement)(parent)) {
    return;
  }

  const openingElement = parent.openingElement;
  if (!ASTUtils.isNodeOfType(AST_NODE_TYPES.JSXIdentifier)(openingElement.name)) {
    return;
  }

  return openingElement.name.name !== 'Trans';
}

type Options = [{ allowedTexts?: string[] }];
type MessagesIds = 'missingTranslationMessage';

/**
 * Ensure texts are translated inside components.
 */
export const rule = ESLintUtils.RuleCreator.withoutDocs<Options, MessagesIds>({
  meta: {
    messages: {
      missingTranslationMessage: `Texts must be translated using the Trans component.\nRaw text: "{{text}}"`,
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowedTexts: {
            type: 'array',
          },
        },
      },
    ],
    type: 'problem',
    fixable: 'code',
  },
  defaultOptions: [{ allowedTexts: [] }],
  create(context) {
    return {
      JSXText(node) {
        const value = node.value.trim();
        if (value === '') {
          return;
        }
        const allowedTexts = context.options[0]?.allowedTexts ?? [];
        if (allowedTexts.includes(value)) {
          return;
        }

        let shouldReport = isTransComponentNode(node);
        /**
         * Detect possible grand parent Trans components.
         * Example:
         * <Trans>My <strong>cool</strong> message.</Trans>
         */
        if (
          shouldReport &&
          node.parent &&
          (ASTUtils.isNodeOfType(AST_NODE_TYPES.JSXExpressionContainer)(node.parent.parent) ||
            ASTUtils.isNodeOfType(AST_NODE_TYPES.JSXElement)(node.parent.parent))
        ) {
          shouldReport = isTransComponentNode(node.parent);
        }

        if (shouldReport) {
          context.report({
            node,
            messageId: 'missingTranslationMessage',
            data: {
              text: value,
            },
          });
        }
      },
    };
  },
});
