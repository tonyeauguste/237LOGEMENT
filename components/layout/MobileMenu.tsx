"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

const LINKS = [
  { href: "/", label: "🏠 Accueil" },
  { href: "/recherche", label: "🔍 Rechercher" },
  { href: "/comment-ca-marche", label: "📋 Comment ça marche" },
  { href: "/a-propos", label: "ℹ️ À propos" },
  { href: "/faq", label: "❓ FAQ" },
  { href: "/contact", label: "✉️ Contact" },
];

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const showToast = useAppStore((s) => s.showToast);
  const dashHref = currentUser?.role === "owner" ? "/compte/proprietaire" : "/compte/visiteur";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-[70px] left-0 right-0 bottom-0 z-[998] bg-[rgba(7,17,30,.98)] backdrop-blur-xl border-b border-border px-[5%] pt-4 pb-10 overflow-y-auto md:hidden"
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
                    Mon espace
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
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/connexion?tab=login" className="flex-1" onClick={onClose}>
                  <Button variant="outline" size="sm" full>
                    Connexion
                  </Button>
                </Link>
                <Link href="/connexion?tab=register" className="flex-1" onClick={onClose}>
                  <Button variant="gold" size="sm" full>
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
