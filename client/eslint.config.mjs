import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default [
  { ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'output/**', 'scripts/backups/**', 'next-env.d.ts'] },
  ...nextVitals,
  ...nextTs,
  { files: ['**/*.cjs', 'scripts/**/*.js', 'server.js', 'test-*.js', 'update-achievements.js'], rules: { '@typescript-eslint/no-require-imports': 'off' } },
  // React Compiler is not enabled. Keep its migration advice visible without blocking legacy code.
  { files: ['**/*.{js,jsx,mjs,ts,tsx,mts,cts}'], rules: { 'react-hooks/set-state-in-effect': 'warn' } },
];
