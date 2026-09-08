// 404 pour toute URL qui ne correspond à aucune route de l'app — pas un
// notFound() explicite dans une page existante (voir app/[lang]/not-found.tsx
// pour ce cas-là), mais une adresse qui ne matche rien du tout. Le layout
// racine du site vit dans un segment dynamique (app/[lang]/layout.tsx),
// donc ce cas précis a besoin de global-not-found.js — voir
// node_modules/next/dist/docs/.../file-conventions/not-found.md. Trouvé
// lors de l'audit pré-déploiement : sans ce fichier, une URL mal tapée
// tombait sur la page d'erreur par défaut de Next.js, non stylée et en
// anglais uniquement, sans aucun moyen de revenir sur le site.
//
// Rendu en dehors de app/[lang]/layout.tsx (voir la doc : "bypasses your
// app's normal rendering") — pas de IntlProvider ici, donc pas de langue
// détectée ; texte en français (langue par défaut du site, voir
// i18n/config.ts) plutôt que d'ajouter une détection de langue dédiée
// pour une page aussi rarement visitée. Polices système plutôt que
// next/font, comme suggéré par la doc pour cette page.
import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page introuvable – 237Logement",
  description: "La page que vous cherchez n'existe pas ou a été déplacée.",
};

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <body className="font-body bg-bg text-text min-h-screen flex items-center justify-center px-[5%]">
        <div className="text-center max-w-[440px] py-16">
          <span className="inline-flex items-center gap-[7px] bg-gold3 border border-[rgba(200,155,60,.3)] text-gold text-[13px] font-semibold px-[18px] py-2 rounded-full tracking-[.3px] mb-5">
            404
          </span>
          <h1 className="font-display text-[28px] font-bold text-text mb-3">Page introuvable</h1>
          <p className="text-[15px] text-muted leading-[1.7] mb-7">
            Le lien suivi est peut-être incorrect, ou la page a été déplacée.
            <br />
            Vérifiez l&apos;adresse, ou repartez de l&apos;accueil.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 font-semibold tracking-[.2px] px-[22px] py-[11px] text-sm rounded-[10px] bg-gradient-to-br from-[#C89B3C] via-[#E8C97A] to-[#C89B3C] text-[#07111E]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
