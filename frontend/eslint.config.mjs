import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['.next/'], // Ignore the build directory
    rules: {
      // Add or override custom ESLint rules here
      'prettier/prettier': ['error'], // Use Prettier to enforce formatting
      'import/no-unresolved': 'error', // Example of additional rules
    },
    files: ['**/*.ts', '**/*.tsx'], // Target TypeScript files
    languageOptions: {
      parser: '@typescript-eslint/parser', // Use TypeScript parser
      ecmaVersion: 2021, // Target modern ECMAScript
      sourceType: 'module', // Use ES Modules
    },
    plugins: {
      import: eslint.pluginImport, // Optional: Ensure import order correctness
    },
  },
  prettier, // Prettier to disable conflicting rules
);
