module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'react-app',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      parser: 'jsonc-eslint-parser',
      rules: {
        'jsonc/no-comments': 'off'
      }
    }
  ]
};