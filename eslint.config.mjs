import { defineConfig, globalIgnores } from 'eslint/config';

import { createNextJsConfig } from '@forthtilliath/eslint-config/nextjs';

const eslintConfig = defineConfig([
  // strict: false — this app previously ran eslint-config-next's looser
  // "recommended" preset; keep that baseline rather than jumping straight to
  // typescript-eslint's strictTypeChecked. turbo: false — standalone repo,
  // not a Turborepo. snakeCase: variables mirror Supabase's snake_case DB
  // columns verbatim (first_name, zip_code, voice_part_id...), a deliberate
  // convention throughout.
  ...createNextJsConfig({ strict: false, turbo: false, snakeCase: true }),
  {
    // Not part of the package's tsconfig (src/sw.ts is explicitly excluded,
    // and the tsconfig's `include` doesn't cover plain .mjs scripts), so
    // keep them out of type-aware linting rather than crashing on them.
    ignores: ['src/sw.ts', 'scripts/**/*.mjs'],
  },
  {
    // Deliberate co-location of a constant/hook/Tiptap node definition next
    // to the component that owns it (Context+useXxx hook, nav data next to
    // the component rendering it, a Tiptap NodeView file only ever exporting
    // its Node config) — not a bug, just breaks Fast Refresh's one-export
    // assumption.
    files: [
      'src/context/ConfirmContext.tsx',
      'src/context/CommandPaletteContext.tsx',
      'src/components/layout/AdminSidebar.tsx',
      'src/components/ui/DurationInput.tsx',
      'src/components/features/trombinoscope/MemberCell.tsx',
      'src/components/editor/Badge.tsx',
    ],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  {
    // autoFocus only on fields revealed by a user action (MFA code step,
    // link/image URL inputs, in-place renaming) — never on page load, so focus
    // follows the user's intent.
    rules: {
      'jsx-a11y/no-autofocus': 'off',
    },
  },
  {
    // Loading skeletons: static lists of placeholders, never reordered — the
    // index is the key.
    files: ['src/app/**/loading.tsx'],
    rules: {
      '@eslint-react/no-array-index-key': 'off',
    },
  },
  // Fichiers générés par la CLI Supabase locale (`npx supabase start`).
  globalIgnores(['supabase/.temp/**', 'supabase/.branches/**']),
]);

export default eslintConfig;
