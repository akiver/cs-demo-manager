/** @type {import("prettier").Options} */
module.exports = {
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
