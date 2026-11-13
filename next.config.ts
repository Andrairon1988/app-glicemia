import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components / Partial Prefetching desligados: todas as telas dependem do
  // usuário logado e são montadas na hora do acesso. Com eles ligados, a validação
  // do login pelo Supabase (que lê o relógio) gerava avisos de "Blocking Route".
  cacheComponents: false,
  // Tela do familiar (link de compartilhamento): fora de buscadores e sem
  // repassar o endereço (que contém o código de acesso) para outros sites.
  async headers() {
    return [
      // Todas as páginas: o app não pode ser exibido dentro de outro site (clickjacking)
      // e o navegador não deve "adivinhar" o tipo dos arquivos.
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/compartilhado/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
    ];
  },
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
