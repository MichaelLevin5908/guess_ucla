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
      files: ['**/*.json', '**/*.jsonc'],
      parser: 'jsonc-eslint-parser',
      plugins: ['jsonc'],
      rules: {
        'jsonc/no-comments': 'off',
        'jsonc/indent': ['error', 2],
        'jsonc/key-spacing': ['error', { beforeColon: false, afterColon: true }]
      }
    }
  ],
  ignorePatterns: [
    'build/',
    'public/',
    '.eslintrc.js'
  ]
}