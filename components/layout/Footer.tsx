"use client";

import Link from "next/link";
import CameroonFlag from "@/components/ui/CameroonFlag";

export default function Footer() {
  return (
    <footer className="bg-bg2 border-t border-border px-[5%] pt-[60px] pb-[30px]">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 lg:gap-12 mb-12">
        <div>
          <div className="flex items-center gap-2.5">
            <CameroonFlag width={26} height={19} />
            <span className="font-logo text-xl font-black tracking-wide text-text">
              <span className="text-gold">237</span>Logement
            </span>
          </div>
          <p className="text-muted text-sm leading-relaxed my-3.5 max-w-[260px]">
            La première plateforme immobilière de confiance au Cameroun. Trouvez votre logement
            idéal ou louez votre bien en toute simplicité.
          </p>
          <div className="flex gap-2.5">
            {/* Pas encore de comptes réseaux sociaux : icônes affichées à
                titre indicatif seulement (pas de href) — volontairement
                sans effet cliquable pour ne pas laisser croire à des liens
                actifs qui ne mènent nulle part. */}
            {["📘", "📸", "🐦", "💬"].map((icon, i) => (
              <span
                key={i}
                className="w-9 h-9 rounded-lg bg-card border border-border flex items-center justify-center text-[15px] opacity-60"
              >
                {icon}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-text mb-4">Découvrir</h4>
          <ul className="space-y-2.5">
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">Toutes les annonces</Link></li>
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">Annonces à Yaoundé</Link></li>
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">Annonces à Douala</Link></li>
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">Courts séjours</Link></li>
            <li><Link href="/comment-ca-marche" className="text-muted text-[13px] hover:text-gold transition-colors">Comment ça marche</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-text mb-4">Propriétaires</h4>
          <ul className="space-y-2.5">
            <li><Link href="/connexion?tab=register" className="text-muted text-[13px] hover:text-gold transition-colors">Publier une annonce</Link></li>
            <li><Link href="/comment-ca-marche" className="text-muted text-[13px] hover:text-gold transition-colors">Guide propriétaire</Link></li>
            <li><Link href="/faq" className="text-muted text-[13px] hover:text-gold transition-colors">FAQ propriétaires</Link></li>
            <li><Link href="/compte" className="text-muted text-[13px] hover:text-gold transition-colors">Tableau de bord</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-text mb-4">Aide &amp; Support</h4>
          <ul className="space-y-2.5">
            <li><Link href="/faq" className="text-muted text-[13px] hover:text-gold transition-colors">Centre d&apos;aide (FAQ)</Link></li>
            <li><Link href="/contact" className="text-muted text-[13px] hover:text-gold transition-colors">Contactez-nous</Link></li>
            <li><Link href="/a-propos" className="text-muted text-[13px] hover:text-gold transition-colors">À propos de nous</Link></li>
            <li><span className="text-dim text-[13px]">CGU &amp; Politique de confidentialité (bientôt)</span></li>
            <li><Link href="/contact" className="text-muted text-[13px] hover:text-gold transition-colors">Signaler une fraude</Link></li>
          </ul>
          <div className="mt-[18px] pt-4 border-t border-border">
            <div className="text-xs text-muted leading-relaxed">
              <div className="mb-[5px]">📍 Quartier Ebomé, Avant l&apos;hôpital<br />Kribi, Sud, Cameroun</div>
              <div className="mb-[5px]">📞 <a href="tel:+237679312363" className="text-gold">+237 679 312 363</a></div>
              <div className="text-dim italic">✉️ Email indisponible pour le moment</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto pt-6 border-t border-border flex justify-between items-center flex-wrap gap-3">
        <p className="text-dim text-[13px] flex items-center gap-1.5">
          © {new Date().getFullYear()} 237Logement. Tous droits réservés.
          <CameroonFlag width={16} height={12} />
          Fait avec ❤️ au Cameroun
        </p>
        {/* Pages légales pas encore rédigées — affichées à titre indicatif,
            sans lien, pour ne pas promettre une page qui n'existe pas. */}
        <div className="flex gap-5">
          <span className="text-dim text-[13px]">Confidentialité (bientôt)</span>
          <span className="text-dim text-[13px]">CGU (bientôt)</span>
          <span className="text-dim text-[13px]">Cookies (bientôt)</span>
        </div>
      </div>
    </footer>
  );
}
