"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import CameroonFlag from "@/components/ui/CameroonFlag";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { useAuthSession } from "@/lib/useAuthSession";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_AVATAR } from "@/lib/data";
import { useTranslations } from "@/i18n/IntlProvider";
import MobileMenu from "./MobileMenu";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("Nav");
  const NAV_LINKS = [
    { href: "/", label: t("home") },
    { href: "/recherche", label: t("search") },
    { href: "/comment-ca-marche", label: t("howItWorks") },
    { href: "/a-propos", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname.replace(/^\/(fr|en)(?=\/|$)/, "") || "/";
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const showToast = useAppStore((s) => s.showToast);
  // La navbar est montée sur toutes les pages (layout racine) : c'est
  // l'endroit le plus fiable pour démarrer l'écoute de la session
  // Supabase Auth. Sans cet appel ici, une session existante ne se
  // rechargeait que sur les pages protégées (via useAuthGuard) — sur
  // /connexion ou toute autre page publique, la navbar restait bloquée
  // en "déconnecté" même avec une session valide.
  const ready = useAuthSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile au changement de route. Ajusté pendant le rendu
  // plutôt que dans un effet (pattern recommandé par React) pour éviter
  // un rendu supplémentaire à chaque navigation.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    setCurrentUser(null);
    showToast("👋 Déconnexion réussie. À bientôt !", "info");
    router.push("/");
  }

  // Espace unique pour tous les comptes depuis la fusion visiteur/propriétaire.
  const dashHref = "/compte";

  return (
    <>
      <motion.nav
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(7,17,30,.96)" : "rgba(7,17,30,0)",
          borderColor: scrolled ? "#1C2E40" : "rgba(28,46,64,0)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
        }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-[999] h-[70px] flex items-center px-[5%] border-b"
      >
        <div className="max-w-[1240px] mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <CameroonFlag width={28} height={20} />
            <span
              className="font-logo text-[22px] font-black tracking-wide text-text"
            >
              <span className="text-gold">237</span>Logement
            </span>
          </Link>

          {/* lg: plutôt que md: — à 768px (tablette), les liens + le menu
              utilisateur (avatar, nom, déconnexion) n'ont structurellement
              pas la place de tenir sur une seule ligne (mesuré : ~233px
              needed pour seulement ~117px disponibles), le menu hamburger
              (déjà bien dimensionné pour cette largeur) prend le relais
              plus longtemps. */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              // pathname inclut le préfixe de langue (/fr/recherche) depuis
              // le passage à app/[lang]/ — on le retire avant de comparer
              // aux hrefs volontairement laissés sans préfixe (proxy.ts se
              // charge de rediriger vers la bonne langue).
              const localePath = pathnameWithoutLocale;
              const active = l.href === "/" ? localePath === "/" : localePath.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative text-sm font-medium px-3 py-[7px] rounded-lg transition-colors ${
                    active ? "text-gold" : "text-text/65 hover:text-text hover:bg-white/5"
                  }`}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-[2px] left-3 right-3 h-[2px] bg-gold rounded"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {!ready ? null : currentUser ? (
              <>
                <Link
                  href={dashHref}
                  className="flex items-center gap-2 px-2.5 py-[5px] rounded-[10px] border border-border bg-card2 hover:border-gold transition-colors"
                >
                  <img
                    src={currentUser.avatar || DEFAULT_AVATAR}
                    alt={currentUser.name}
                    className="w-[26px] h-[26px] rounded-full border-[1.5px] border-gold"
                  />
                  {/* .split(" ")[0] protège des noms à plusieurs mots, mais
                      pas d'un texte sans espace (nom long en un seul mot,
                      ou repli sur l'email) — d'où la troncature CSS en plus,
                      seule protection fiable contre un débordement de la
                      barre de navigation à largeur tablette. */}
                  <span className="text-[13px] font-medium text-text max-w-[80px] truncate">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </Link>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  {t("logout")}
                </Button>
              </>
            ) : (
              <>
                <Link href="/connexion?tab=login">
                  <Button variant="ghost" size="sm">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/connexion?tab=register">
                  <Button variant="gold" size="sm">
                    {t("register")}
                  </Button>
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("menu")}
            // p-2.5 plutôt que p-1.5 : ~42px de zone tactile au lieu de
            // ~34px, plus proche des ~44px recommandés pour un bouton tapé
            // au doigt.
            className="lg:hidden text-text p-2.5 -m-1 rounded-lg"
          >
            <Menu size={22} />
          </button>
        </div>
      </motion.nav>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
