"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import CameroonFlag from "@/components/ui/CameroonFlag";
import Button from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { DEFAULT_AVATAR } from "@/lib/data";
import MobileMenu from "./MobileMenu";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/recherche", label: "Rechercher" },
  { href: "/comment-ca-marche", label: "Comment ça marche" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function handleLogout() {
    logout();
    showToast("👋 Déconnexion réussie. À bientôt !", "info");
    router.push("/");
  }

  const dashHref = currentUser?.role === "owner" ? "/compte/proprietaire" : "/compte/visiteur";

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
              Immo<span className="text-gold">237</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
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

          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
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
                  <span className="text-[13px] font-medium text-text">
                    {currentUser.name.split(" ")[0]}
                  </span>
                </Link>
                <Button variant="danger" size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Link href="/connexion?tab=login">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/connexion?tab=register">
                  <Button variant="gold" size="sm">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
            className="md:hidden text-text p-1.5 rounded-lg"
          >
            <Menu size={22} />
          </button>
        </div>
      </motion.nav>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
