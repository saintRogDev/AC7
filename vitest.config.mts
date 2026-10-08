import { defineConfig } from "vitest/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
      // `server-only`'s default entry throws on import so a client bundle can
      // never pull in a server module. Under Node that guard fires during tests
      // too, which would leave every server-only module untestable. Point it at
      // the package's own empty server entry -- the exact file Next resolves
      // under the "react-server" condition -- so these modules can be tested
      // directly rather than split apart to dodge the guard.
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url)),
    },
  },
  test: {
    // Node by default: most suites assert on server rendering to a string, and
    // server modules need a real Node environment. Interaction tests opt into
    // jsdom per file with a `@vitest-environment jsdom` pragma.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", ".next/**"],
  },
})
