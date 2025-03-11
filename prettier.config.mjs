/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  printWidth: 120,
  overrides: [
    {
      files: '*.svg',
      options: {
        parser: 'html',
      },
    },
  ],
};

export default config;
