"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Search, Bell, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import DashSidebar from "@/components/dashboard/DashSidebar";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ToggleRow from "@/components/ui/ToggleRow";
import PropertyCard from "@/components/property/PropertyCard";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { rowToProperty } from "@/lib/supabase/mappers";
import type { Property } from "@/lib/types";

type Section = "favoris" | "searches" | "alerts" | "settings";

export default function VisitorDashboard() {
  const user = useAuthGuard();
  const logout = useAppStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);
  const favorites = useAppStore((s) => s.favorites);
  const router = useRouter();
  const [section, setSection] = useState<Section>("favoris");

  // Les favoris sont stockés comme une simple liste d'IDs (localStorage) ;
  // il faut aller chercher les annonces correspondantes chez Supabase pour
  // les afficher réellement, plutôt que de toujours montrer l'état vide.
  const [favProperties, setFavProperties] = useState<Property[]>([]);
  const [favLoading, setFavLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Pas de setFavLoading(true) ici : la liste précédente reste affichée
    // le temps du refetch (déclenché quand `favorites` change), évitant un
    // flash à vide. `favLoading` ne sert qu'au tout premier chargement,
    // via sa valeur initiale ci-dessus.
    const supabase = createClient();
    const request =
      favorites.length === 0
        ? Promise.resolve<Property[]>([])
        : supabase
            .from("properties")
            .select("*")
            .in("id", favorites)
            .then(({ data }) => (data ?? []).map(rowToProperty));
    request.then((props) => {
      if (cancelled) return;
      setFavProperties(props);
      setFavLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [favorites]);

  if (!user) return null;

  function handleLogout() {
    logout();
    showToast("👋 Déconnexion réussie. À bientôt !", "info");
    router.push("/");
  }

  return (
    <div className="pt-[70px] grid grid-cols-1 lg:grid-cols-[250px_1fr] min-h-screen">
      <DashSidebar
        user={user}
        roleBadge={<Tag color="blue">🏠 Visiteur</Tag>}
        active={section}
        onSelect={(k) => setSection(k as Section)}
        items={[
          { key: "favoris", label: "Mes favoris", icon: <Heart size={15} />, badge: favorites.length },
          { key: "searches", label: "Recherches récentes", icon: <Search size={15} /> },
          { key: "alerts", label: "Alertes email", icon: <Bell size={15} /> },
          { key: "settings", label: "Paramètres", icon: <Settings size={15} /> },
        ]}
        footer={
          <>
            <Link
              href="/recherche"
              className="flex items-center gap-3 px-3 py-[11px] rounded-[10px] text-sm text-green hover:bg-bg3 transition-colors mb-0.5"
            >
              <Search size={15} /> Explorer les annonces
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-[11px] rounded-[10px] text-sm text-red hover:bg-bg3 transition-colors w-full text-left"
            >
              <LogOut size={15} /> Déconnexion
            </button>
          </>
        }
      />

      <div className="px-4 lg:px-[42px] py-6 lg:py-9 bg-bg">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {section === "favoris" && (
              <>
                <Header
                  label="Espace visiteur"
                  title="Mes favoris"
                  sub="Les logements que vous avez sauvegardés."
                />
                {favLoading ? null : favProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favProperties.map((p) => (
                      <PropertyCard key={p.id} p={p} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-[60px] px-5">
                    <div className="text-[48px] mb-3.5">💛</div>
                    <h3 className="text-lg font-semibold text-text mb-2">
                      Aucun favori pour l&apos;instant
                    </h3>
                    <p className="text-sm text-muted mb-[22px]">
                      Explorez les annonces et cliquez sur le cœur pour sauvegarder vos préférées.
                    </p>
                    <Link href="/recherche">
                      <Button variant="gold">Explorer les annonces</Button>
                    </Link>
                  </div>
                )}
              </>
            )}

            {section === "searches" && (
              <>
                <Header label="Historique" title="Recherches récentes" />
                <div className="text-center py-[60px] px-5">
                  <div className="text-[48px] mb-3.5">🔍</div>
                  <h3 className="text-lg font-semibold text-text mb-2">Aucune recherche récente</h3>
                  <p className="text-sm text-muted mb-[22px]">
                    Vos recherches s&apos;afficheront ici pour vous permettre de les relancer
                    facilement.
                  </p>
                  <Link href="/recherche">
                    <Button variant="gold">Lancer une recherche</Button>
                  </Link>
                </div>
              </>
            )}

            {section === "alerts" && (
              <>
                <Header label="Notifications" title="Alertes email" />
                <div className="bg-card border border-border rounded-2xl text-center p-9 max-w-[600px]">
                  <div className="text-[44px] mb-3.5">🔔</div>
                  <h3 className="font-display text-xl font-bold text-text mb-2.5">
                    Activez vos alertes personnalisées
                  </h3>
                  <p className="text-muted text-sm max-w-[380px] mx-auto mb-[22px]">
                    Recevez un email dès qu&apos;une nouvelle annonce correspond à vos critères :
                    ville, budget, nombre de chambres. Ne ratez plus jamais la bonne offre !
                  </p>
                  <Button
                    variant="gold"
                    onClick={() => showToast("🔔 Fonctionnalité disponible prochainement !", "info")}
                  >
                    Créer une alerte
                  </Button>
                </div>
              </>
            )}

            {section === "settings" && (
              <>
                <Header label="Compte" title="Paramètres" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[700px]">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px]">
                      Informations personnelles
                    </h4>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Nom complet</label>
                      <input className="form-control" defaultValue={user.name} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Email</label>
                      <input className="form-control" type="email" defaultValue={user.email} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Téléphone</label>
                      <input className="form-control" placeholder="+237 6XX XXX XXX" />
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => showToast("✅ Modifications sauvegardées", "success")}
                    >
                      Sauvegarder
                    </Button>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px]">Notifications</h4>
                    <ToggleRow label="Nouvelles annonces" defaultOn />
                    <ToggleRow label="Réponses aux messages" defaultOn />
                    <ToggleRow label="Newsletter hebdo" last />
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Header({ label, title, sub }: { label: string; title: string; sub?: string }) {
  return (
    <div className="flex justify-between items-end mb-[30px]">
      <div>
        <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{label}</div>
        <h2 className="font-display text-[26px] font-bold text-text mt-1">{title}</h2>
        {sub && <p className="text-sm text-muted mt-1.5">{sub}</p>}
      </div>
    </div>
  );
}
