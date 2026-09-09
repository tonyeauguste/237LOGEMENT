"use client";

import { useTranslations } from "@/i18n/IntlProvider";

/**
 * Glyphe WhatsApp en SVG inline — lucide-react (seule librairie d'icônes du
 * projet) ne fournit volontairement aucun logo de marque, seulement des
 * icônes génériques. Tracé officiel simplifié, couleur héritée (currentColor).
 */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.42a9.86 9.86 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14.02c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.13.11-1.82-.11-.42-.13-.96-.31-1.65-.6-2.91-1.26-4.8-4.19-4.94-4.38-.14-.19-1.19-1.58-1.19-3.02 0-1.43.75-2.14 1.02-2.43.27-.29.58-.36.78-.36l.55.01c.18.01.42-.07.66.5.24.58.83 2 .9 2.14.07.15.12.32.02.51-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.75 1.23 1.6 2 1.11.99 2.04 1.29 2.33 1.44.29.15.46.13.63-.05.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.65.78 1.93.92.29.14.48.22.55.34.07.13.07.72-.17 1.4Z" />
    </svg>
  );
}

/**
 * Remplace l'ancien système de chat interne (property_messages) : un simple
 * lien wa.me vers le propriétaire, message pré-rempli. Aucune donnée n'est
 * écrite en base — le contact se fait entièrement sur WhatsApp.
 */
export default function ContactOwnerButton({
  phone,
  propertyTitle,
}: {
  phone?: string | null;
  propertyTitle: string;
}) {
  const t = useTranslations("PropertyDetail");
  // wa.me n'accepte que des chiffres (indicatif pays inclus, sans "+" ni
  // espaces) — même nettoyage que l'ancien lien tel:, poussé plus loin
  // puisque wa.me refuse même le "+".
  const digits = (phone ?? "").replace(/\D/g, "");

  if (!digits) {
    return <p className="text-center text-xs text-dim italic">{t("contactNotAvailable")}</p>;
  }

  const message = t("whatsappMessageTemplate", { title: propertyTitle });
  const href = `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 font-semibold tracking-[.2px] transition-colors duration-300 w-full px-[22px] py-[14px] text-[15px] rounded-xl bg-[#25D366] border border-[#25D366] text-[#07120A] hover:bg-[#1FBD5A] hover:border-[#1FBD5A]"
    >
      <WhatsAppIcon size={19} />
      {t("contactOwnerWhatsapp")}
    </a>
  );
}
