import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components / Partial Prefetching desligados: todas as telas dependem do
  // usuário logado e são montadas na hora do acesso. Com eles ligados, a validação
  // do login pelo Supabase (que lê o relógio) gerava avisos de "Blocking Route".
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
