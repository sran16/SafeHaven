import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import pluginOxlint from 'eslint-plugin-oxlint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
  },

  globalIgnores([
    '**/dist/**', 
    '**/dist-ssr/**', 
    '**/coverage/**',
    '**/ios/App/App/public/**',
    '**/android/app/src/main/assets/**',
    '**/capacitor.config.json'
  ]),

  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  ...pluginOxlint.configs['flat/recommended'],
  skipFormatting,
  
  // Règles personnalisées pour un code plus propre
  {
    rules: {
      // Désactiver la règle multi-word pour les composants (acceptable pour un PFE)
      'vue/multi-word-component-names': 'off',
      // Permettre les variables non utilisées avec underscore
      'no-unused-vars': ['error', { 'argsIgnorePattern': '^_', 'varsIgnorePattern': '^_' }],
    }
  },
])
