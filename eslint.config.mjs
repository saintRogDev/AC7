import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  { files: ["components/ui/carousel.tsx", "components/ui/use-mobile.tsx", "hooks/use-mobile.ts"], rules: { "react-hooks/set-state-in-effect": "warn" } },
  { files: ["components/ui/sidebar.tsx"], rules: { "react-hooks/purity": "warn" } },
  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
])
