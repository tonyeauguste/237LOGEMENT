import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le layout racine vit dans un segment dynamique (app/[lang]/layout.tsx)
  // — exactement le cas documenté par Next.js où app/[lang]/not-found.tsx
  // seul ne suffit pas pour une URL qui ne correspond à aucune route du
  // tout (par opposition à un notFound() explicite dans une route
  // existante, que app/[lang]/not-found.tsx gère bien). Voir
  // node_modules/next/dist/docs/.../file-conventions/not-found.md,
  // section "global-not-found.js" — trouvé lors de l'audit pré-déploiement
  // (la 404 par défaut était non stylée, en anglais, sans navigation).
  experimental: {
    globalNotFound: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
