module.exports = {
  env: {
    browser: false,
    es2021: true,
    jest: true
  },
  extends: ['standard-with-typescript', 'plugin:react/recommended', 'prettier'],
  plugins: ['react', 'unused-imports', '@stylistic/js'],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        project: ['./tsconfig.json', './demo/tsconfig.json']
      }
    }
  ],
  rules: {
    '@stylistic/js/no-multiple-empty-lines': ['error', { maxBOF: 0, maxEOF: 1, max: 2 }],
    'jsx-quotes': ['error', 'prefer-double'],
    'react/jsx-uses-vars': 'error',
    'react/jsx-uses-react': 'error',
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    '@typescript-eslint/array-type': ['error', { default: 'array' }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    '@typescript-eslint/consistent-type-assertions': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, args: 'none' }],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: false, fixStyle: 'inline-type-imports' }
    ]
  }
}
