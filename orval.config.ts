import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: {
      target: "./src/http/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/http/api.ts",
      client: "fetch",
      baseUrl: "",
      override: {
        mutator: {
          path: "./src/lib/client.ts",
          name: "http",
        },
      },
    },
  },
});
