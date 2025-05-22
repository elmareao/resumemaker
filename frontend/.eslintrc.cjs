module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'prettier', // Make sure this is last to override other formatting rules
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'vite.config.ts', 'postcss.config.js', 'tailwind.config.js', 'eslint.config.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Or path to your tsconfig if different
  },
  plugins: ['react-refresh', 'react', '@typescript-eslint', 'prettier'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+ and Vite
    'prettier/prettier': 'warn', // Show Prettier issues as warnings
    '@typescript-eslint/no-explicit-any': 'warn',
    // Add any other specific rules or overrides
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
