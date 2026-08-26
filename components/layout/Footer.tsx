"use client";

import Link from "next/link";
import CameroonFlag from "@/components/ui/CameroonFlag";
import { CONTACT } from "@/lib/data";
import { useTranslations } from "@/i18n/IntlProvider";

export default function Footer() {
  const t = useTranslations("Footer");

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
          <p className="text-muted text-sm leading-relaxed my-3.5 max-w-[260px]">{t("tagline")}</p>
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
          <h4 className="font-semibold text-sm text-text mb-4">{t("discoverTitle")}</h4>
          <ul className="space-y-2.5">
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">{t("allListings")}</Link></li>
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">{t("listingsYaounde")}</Link></li>
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">{t("listingsDouala")}</Link></li>
            <li><Link href="/recherche" className="text-muted text-[13px] hover:text-gold transition-colors">{t("shortStays")}</Link></li>
            <li><Link href="/comment-ca-marche" className="text-muted text-[13px] hover:text-gold transition-colors">{t("howItWorks")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-text mb-4">{t("ownersTitle")}</h4>
          <ul className="space-y-2.5">
            <li><Link href="/connexion?tab=register" className="text-muted text-[13px] hover:text-gold transition-colors">{t("publishListing")}</Link></li>
            <li><Link href="/comment-ca-marche" className="text-muted text-[13px] hover:text-gold transition-colors">{t("ownerGuide")}</Link></li>
            <li><Link href="/faq" className="text-muted text-[13px] hover:text-gold transition-colors">{t("ownerFaq")}</Link></li>
            <li><Link href="/compte" className="text-muted text-[13px] hover:text-gold transition-colors">{t("dashboard")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm text-text mb-4">{t("helpTitle")}</h4>
          <ul className="space-y-2.5">
            <li><Link href="/faq" className="text-muted text-[13px] hover:text-gold transition-colors">{t("helpCenter")}</Link></li>
            <li><Link href="/contact" className="text-muted text-[13px] hover:text-gold transition-colors">{t("contactUs")}</Link></li>
            <li><Link href="/a-propos" className="text-muted text-[13px] hover:text-gold transition-colors">{t("aboutUs")}</Link></li>
            <li><Link href="/confidentialite" className="text-muted text-[13px] hover:text-gold transition-colors">{t("privacyPolicy")}</Link></li>
            <li><Link href="/contact" className="text-muted text-[13px] hover:text-gold transition-colors">{t("reportFraud")}</Link></li>
          </ul>
          <div className="mt-[18px] pt-4 border-t border-border">
            <div className="text-xs text-muted leading-relaxed">
              <div className="mb-[5px]">📍 {CONTACT.addressLine1}<br />{CONTACT.addressLine2}</div>
              <div className="mb-[5px]">📞 <a href={`tel:${CONTACT.phoneRaw}`} className="text-gold">{CONTACT.phone}</a></div>
              <div className="mb-[5px]">✉️ <a href={`mailto:${CONTACT.email}`} className="text-gold break-all">{CONTACT.email}</a></div>
              <div className="text-dim">🕐 {CONTACT.hoursShort}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto pt-6 border-t border-border flex justify-between items-center flex-wrap gap-3">
        <p className="text-dim text-[13px] flex items-center gap-1.5">
          © {new Date().getFullYear()} {t("copyright")}
          <CameroonFlag width={16} height={12} />
          {t("madeIn")}
        </p>
        {/* CGU et page Cookies pas encore rédigées — affichées à titre
            indicatif, sans lien, pour ne pas promettre une page qui
            n'existe pas. La politique de confidentialité, elle, existe
            (voir app/[lang]/confidentialite/page.tsx) et couvre déjà les
            cookies. */}
        <div className="flex gap-5">
          <Link href="/confidentialite" className="text-dim text-[13px] hover:text-gold transition-colors">
            {t("privacy")}
          </Link>
          <span className="text-dim text-[13px]">{t("terms")}</span>
          <span className="text-dim text-[13px]">{t("cookies")}</span>
        </div>
      </div>
    </footer>
  );
}
