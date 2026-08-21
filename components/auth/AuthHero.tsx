"use client";

// ═══════════════════════════════════════════════
// Panneau visuel gauche de /connexion (masqué sur mobile) — inspiré de la
// disposition "split screen" vue sur Rent237 : photo pleine hauteur,
// logo, accroche et une liste de bénéfices clés par-dessus un dégradé.
// ═══════════════════════════════════════════════

import Image from "next/image";
import { Home, Megaphone, ShieldCheck, MessageCircle } from "lucide-react";

const FEATURES = [
  { icon: Home, text: "Trouvez un logement adapté à votre budget" },
  { icon: Megaphone, text: "Publiez et mettez en avant vos annonces" },
  { icon: ShieldCheck, text: "Propriétaires et annonces vérifiés" },
  { icon: MessageCircle, text: "Contact direct, sans intermédiaire" },
];

export default function AuthHero() {
  return (
    <div className="hidden lg:block relative overflow-hidden min-h-[500px]">
      <Image
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
        alt="Belle maison"
        fill
        sizes="50vw"
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07111e] via-[#07111e]/55 to-[#07111e]/20" />

      {/* Pas de logo ici : la navbar du site, fixée en haut de toutes les
          pages, en affiche déjà un — le doubler donnait deux logos
          superposés dans le coin supérieur gauche. */}
      <div className="relative h-full flex flex-col justify-end p-10 xl:p-12">
        <div>
          <p className="text-[11px] tracking-[3px] uppercase text-gold font-semibold mb-3">
            Louer · Publier · Gérer
          </p>
          <h2 className="font-display text-[clamp(26px,2.6vw,38px)] font-bold text-white leading-tight mb-3">
            Rejoignez le marché locatif camerounais
          </h2>
          <p className="text-white/75 text-[15px] leading-relaxed mb-7 max-w-[380px]">
            Créez un compte gratuit pour trouver un logement, publier vos biens ou gérer vos
            locations — sans commission, sans intermédiaire.
          </p>
          <ul className="flex flex-col gap-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gold" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
