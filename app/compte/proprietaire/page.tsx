"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { List, PlusCircle, BarChart3, MessageSquare, Settings, LogOut } from "lucide-react";
import DashSidebar from "@/components/dashboard/DashSidebar";
import Tag from "@/components/ui/Tag";
import Button from "@/components/ui/Button";
import ToggleRow from "@/components/ui/ToggleRow";
import CitySelect from "@/components/ui/CitySelect";
import ComingSoon from "@/components/ui/ComingSoon";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppStore } from "@/lib/store";

type Section = "listings" | "stats" | "messages" | "settings";

const STATS = [
  { icon: "📊", val: "0", label: "Annonces actives", color: "text-gold" },
  { icon: "👁", val: "0", label: "Vues ce mois", color: "text-blue" },
  { icon: "💬", val: "0", label: "Messages reçus", color: "text-green2" },
  { icon: "❤️", val: "0", label: "Favoris totaux", color: "text-red" },
];

export default function OwnerDashboard() {
  const user = useAuthGuard();
  const logout = useAppStore((s) => s.logout);
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const [section, setSection] = useState<Section>("listings");

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
        roleBadge={<Tag color="gold">🔑 Propriétaire</Tag>}
        active={section}
        onSelect={(k) => setSection(k as Section)}
        items={[
          { key: "listings", label: "Mes annonces", icon: <List size={15} /> },
          { key: "stats", label: "Statistiques", icon: <BarChart3 size={15} /> },
          { key: "messages", label: "Messages", icon: <MessageSquare size={15} /> },
          { key: "settings", label: "Paramètres", icon: <Settings size={15} /> },
        ]}
        footer={
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-[11px] rounded-[10px] text-sm text-red hover:bg-bg3 transition-colors w-full text-left"
          >
            <LogOut size={15} /> Déconnexion
          </button>
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
            {section === "listings" && (
              <>
                <div className="flex justify-between items-end mb-[30px] flex-wrap gap-3">
                  <div>
                    <div className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">
                      Propriétaire
                    </div>
                    <h2 className="font-display text-[26px] font-bold text-text mt-1">Mes annonces</h2>
                    <p className="text-sm text-muted mt-1.5">Gérez vos biens mis en location.</p>
                  </div>
                  <Link href="/publier">
                    <Button variant="gold">
                      <PlusCircle size={14} /> Nouvelle annonce
                    </Button>
                  </Link>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                  {STATS.map((s) => (
                    <div key={s.label} className="bg-card border border-border rounded-2xl px-5 py-[18px]">
                      <div className="text-[22px] mb-2">{s.icon}</div>
                      <div className={`font-display text-[28px] font-bold mb-1 ${s.color}`}>{s.val}</div>
                      <div className="text-[13px] text-muted">{s.label}</div>
                    </div>
                  ))}
                </div>
                <ComingSoon
                  title="Aucune annonce publiée pour le moment"
                  text="La plateforme sera bientôt opérationnelle. Vous pourrez publier vos biens et les gérer depuis ce tableau de bord."
                  action={
                    <Link href="/publier">
                      <Button variant="gold">+ Publier une annonce</Button>
                    </Link>
                  }
                  className="mx-0"
                />
              </>
            )}

            {section === "stats" && (
              <>
                <Header label="Analytique" title="Statistiques" />
                <div className="text-center py-[60px] px-5">
                  <div className="text-[48px] mb-3.5">📊</div>
                  <h3 className="text-lg font-semibold text-text mb-2">Aucune statistique disponible</h3>
                  <p className="text-sm text-muted mb-[22px]">
                    Vos statistiques de vues, contacts et favoris apparaîtront ici une fois vos
                    premières annonces publiées.
                  </p>
                  <Link href="/publier">
                    <Button variant="gold">Publier une annonce</Button>
                  </Link>
                </div>
              </>
            )}

            {section === "messages" && (
              <>
                <Header label="Communication" title="Messages reçus" />
                <div className="text-center py-[60px] px-5">
                  <div className="text-[48px] mb-3.5">💬</div>
                  <h3 className="text-lg font-semibold text-text mb-2">Aucun message pour le moment</h3>
                  <p className="text-sm text-muted">
                    Les messages envoyés par les locataires intéressés par vos biens apparaîtront ici.
                  </p>
                </div>
              </>
            )}

            {section === "settings" && (
              <>
                <Header label="Compte propriétaire" title="Paramètres" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[780px]">
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px]">Profil propriétaire</h4>
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
                    <div className="mb-4">
                      <label className="block text-[13px] text-muted mb-[7px] font-medium">Ville</label>
                      <CitySelect placeholder="Sélectionner une ville" />
                    </div>
                    <Button
                      variant="gold"
                      size="sm"
                      onClick={() => showToast("✅ Profil mis à jour", "success")}
                    >
                      Mettre à jour
                    </Button>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-5">
                    <h4 className="text-[15px] font-semibold text-text mb-[18px]">Notifications propriétaire</h4>
                    <ToggleRow label="Nouveau message reçu" defaultOn />
                    <ToggleRow label="Annonce approuvée" defaultOn />
                    <ToggleRow label="Alerte ajouté aux favoris" />
                    <ToggleRow label="Newsletter mensuelle" last />
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
