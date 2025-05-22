module.exports = {
  root: true,
  env: {
    node: true,
    es2021: true, // Or newer ES version
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Make sure this is last to override other formatting rules
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest', // Or the ES version you are targeting
    sourceType: 'module',
    project: './tsconfig.json', // Path to your tsconfig.json
  },
  plugins: ['@typescript-eslint', 'prettier', 'import'],
  rules: {
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
    '@typescript-eslint/no-explicit-any': 'warn', // Warn on 'any' type
    '@typescript-eslint/interface-name-prefix': 'off', // Or 'warn' if you prefer I-prefixed interfaces
    '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Warn on unused vars, ignore if prefixed with _
    'import/order': [ // Optional: Enforce a specific import order
      'warn',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [{ pattern: '@/**', group: 'internal' }],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    // Add any other specific rules or overrides
  },
  settings: {
    'import/resolver': {
      typescript: {}, // This helps eslint-plugin-import understand TypeScript paths
    },
  },
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'coverage', '*.sql'],
};
