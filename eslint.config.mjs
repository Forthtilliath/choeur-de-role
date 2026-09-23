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
    ignores: ['src/sw.ts', 'scripts/*.mjs'],
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
    // autoFocus is used deliberately throughout (MFA code input, rename
    // fields, form panels on open) — a recurring UX choice, not an oversight.
    rules: {
      'jsx-a11y/no-autofocus': 'warn',
    },
  },
  // Fichiers générés par la CLI Supabase locale (`npx supabase start`).
  globalIgnores(['supabase/.temp/**', 'supabase/.branches/**']),
]);

export default eslintConfig;
