import js from '@eslint/js';
import ts from 'typescript-eslint';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import reactHooks from 'eslint-plugin-react-hooks';
import checkFile from 'eslint-plugin-check-file';
import localRules from 'eslint-plugin-local-rules';
import lingui from 'eslint-plugin-lingui';
import prettier from 'eslint-plugin-prettier/recommended';

export default [
  {
    ignores: [
      '.DS_Store',
      'node_modules',
      'LICENSE',
      'package-lock.json',
      '.npmrc',
      '**/*.config.{ts,mjs,mts,js}',
      'knip.ts',
      'eslint-local-rules.js',
      'cs2-server-plugin',
      'csgo-server-plugin',
      'linter',
      'scripts',
      'dist',
      'out',
      'static',
      '*.po',
      '*.png',
      '*.html',
      '*.md',
      '*.svg',
      '*.jpg',
      '*.sh',
      '*.yml',
      '*.dem',
      '*.vdm',
      '*.log',
      '*.json',
      '*.snap',
      '*.info',
      '*.icns',
      '*.ico',
      '*.css',
      '*.woff2',
      '*.cmd',
      '*.nsh',
      '*.data',
      '*.dll',
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  reactRecommended,
  prettier,
  {
    plugins: {
      'check-file': checkFile,
      lingui,
      'local-rules': localRules,
      'react-hooks': reactHooks,
    },

    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: true,
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'warn',
        {
          'ts-ignore': 'allow-with-description',
        },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],

          filter: {
            regex: '^_$',
            match: false,
          },
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
        },
        {
          selector: ['method', 'parameter', 'parameterProperty', 'accessor'],
          format: ['camelCase'],
        },
        {
          selector: ['class', 'interface', 'typeAlias', 'typeParameter'],
          format: ['PascalCase'],
        },
        {
          selector: 'objectLiteralMethod',
          format: ['camelCase', 'snake_case'],
        },
      ],
      '@typescript-eslint/no-deprecated': 'error',
      '@typescript-eslint/no-inferrable-types': 0,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/require-await': 'error',
      'check-file/filename-naming-convention': [
        'error',
        {
          '**/*.{ts,tsx,mjs,md}': '+([a-z0-9])*([a-z0-9])*(-+([a-z0-9]))', // KEBAB_CASE but allow numbers at the start
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      'check-file/folder-naming-convention': [
        'error',
        {
          'src/**/': '+([a-z0-9])*([a-z0-9])*(-+([a-z0-9]))', // KEBAB_CASE but allow numbers at the start
        },
      ],
      'check-file/no-index': 'error',
      eqeqeq: 'error',
      'lingui/no-unlocalized-strings': [
        'error',
        {
          ignore: [
            // Ignore strings which are a single "word" (no spaces)
            // and doesn't start with an uppercase letter
            '^(?![A-Z])\\S+$',
            '^[A-Z0-9_-]+$',
            '^#',
            '^HLAE$',
            '^HLAE.exe$',
            '^FFmpeg$',
            '^VirtualDub$',
            '^Valve$',
            '^FACEIT$',
            '^CS Demo Manager$',
            '^Counter-Strike$',
            'rgba',
            '^setpos ',
            '^Ctrl+',
            '^CTRL+',
            '^Cmd+',
            '^Shift+',
            '^Control+',
            '^Alt+',
            '^Enter$',
            '^translateX',
            '^ArrowLeft$',
            '^ArrowRight$',
            '^https://',
            '^Toggle Developer Tools$',
            '^GitHub$',
            'Inter var$',
            'CS:DM',
          ],
          ignoreNames: [
            // Ignore matching className (case-insensitive)
            { regex: { pattern: 'className', flags: 'i' } },
            'displayName',
            'Authorization',
            'Content-Type',
            'fontFamily',
            'd',
            'fillStyle',
            'class',
            'current',
            'not-current',
            'gridTemplateColumns',
            'accelerator',
          ],
          ignoreFunctions: [
            'Error',
            'TypeError',
            'console.*',
            '*.warn',
            '*.error',
            '*.log',
            '*.setAttribute',
            'assertNever',
            'spawn',
            '*.includes',
            '*.indexOf',
            '*.endsWith',
            '*.startsWith',
          ],
          useTsTypes: true,
          ignoreMethodsOnTypes: ['Map.get', 'Map.has', 'Set.has'],
        },
      ],
      'lingui/t-call-in-function': 'error',
      'lingui/no-single-variables-to-translate': 'error',
      'lingui/no-expression-in-message': 'error',
      'lingui/no-single-tag-to-translate': 'error',
      'lingui/no-trans-inside-trans': 'error',
      'local-rules/lingui-js-usage': 'error',
      'local-rules/no-react-redux-import': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportDefaultDeclaration',
          message: 'Prefer named exports',
        },
        {
          selector: 'TSEnumDeclaration',
          message:
            "Don't declare enums, use an object instead.\nSee https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums or status.ts as an example",
        },
      ],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'function-declaration',
        },
      ],
      'react/jsx-boolean-value': ['error', 'always'],
      'react/no-unescaped-entities': [
        'error',
        {
          forbid: ['>', '}'],
        },
      ],
      'react/prop-types': 0,
      'react-hooks/react-compiler': 'error',
    },
  },
  {
    files: [
      'src/**/*.test.ts',
      'src/node/**',
      'src/server/**',
      'src/cli/**',
      // Ignore main process files even though it's translated because for some reasons, calling i18n.t may be reported.
      'src/electron-main/**',
    ],
    rules: {
      'lingui/no-unlocalized-strings': 'off',
    },
  },
];
