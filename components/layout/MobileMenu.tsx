"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import { useTranslations } from "@/i18n/IntlProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useTranslations("Nav");
  const LINKS = [
    { href: "/", label: `🏠 ${t("home")}` },
    { href: "/recherche", label: `🔍 ${t("search")}` },
    { href: "/comment-ca-marche", label: `📋 ${t("howItWorks")}` },
    { href: "/a-propos", label: `ℹ️ ${t("about")}` },
    { href: "/faq", label: `❓ ${t("faq")}` },
    { href: "/contact", label: `✉️ ${t("contact")}` },
  ];
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const showToast = useAppStore((s) => s.showToast);
  // Espace unique pour tous les comptes depuis la fusion visiteur/propriétaire.
  const dashHref = "/compte";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          // lg: pour rester cohérent avec le seuil du menu desktop dans
          // Navbar.tsx (voir son commentaire) — sinon ce menu se cacherait
          // dès 768px alors que le bouton "Menu" resterait visible jusqu'à
          // 1024px, rendant le menu inatteignable entre les deux.
          className="fixed top-[70px] left-0 right-0 bottom-0 z-[998] bg-[rgba(7,17,30,.98)] backdrop-blur-xl border-b border-border px-[5%] pt-4 pb-10 overflow-y-auto lg:hidden"
        >
          {LINKS.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={l.href}
                onClick={onClose}
                className="block py-[13px] text-[15px] font-medium text-muted hover:text-gold transition-colors border-b border-border"
              >
                {l.label}
              </Link>
            </motion.div>
          ))}
          <div className="flex gap-2.5 mt-5 pt-1">
            {currentUser ? (
              <>
                <Link href={dashHref} className="flex-1" onClick={onClose}>
                  <Button variant="ghost" size="sm" full>
                    {t("dashboard")}
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  className="flex-1"
                  onClick={async () => {
                    await createClient().auth.signOut();
                    setCurrentUser(null);
                    showToast("👋 Déconnexion réussie. À bientôt !", "info");
                    onClose();
                  }}
                >
                  {t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href="/connexion?tab=login" className="flex-1" onClick={onClose}>
                  <Button variant="outline" size="sm" full>
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/connexion?tab=register" className="flex-1" onClick={onClose}>
                  <Button variant="gold" size="sm" full>
                    {t("register")}
                  </Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex justify-center mt-5">
            <LanguageSwitcher />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
