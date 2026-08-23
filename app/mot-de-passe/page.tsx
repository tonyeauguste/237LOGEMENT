"use client";

// ═══════════════════════════════════════════════
// Définition d'un nouveau mot de passe
//
// Destination du lien envoyé par « Mot de passe oublié ? ». Sans cette
// page, l'email de réinitialisation arrivait bien mais renvoyait vers
// l'accueil : aucun moyen de saisir un nouveau mot de passe, le parcours
// était donc sans issue.
//
// Le jeton de récupération est présent dans l'URL ; le client Supabase
// l'échange automatiquement contre une session au chargement, ce qui rend
// `updateUser({ password })` possible sans connaître l'ancien mot de passe.
// ═══════════════════════════════════════════════

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import PasswordField from "@/components/auth/PasswordField";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { useAppStore } from "@/lib/store";
import { useAuthSession } from "@/lib/useAuthSession";
import { createClient } from "@/lib/supabase/client";

export default function NouveauMotDePassePage() {
  const ready = useAuthSession();
  const currentUser = useAppStore((s) => s.currentUser);
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (pwd.length < 8) {
      showToast("⚠️ Le mot de passe doit contenir au moins 8 caractères.", "error");
      return;
    }
    if (pwd !== pwd2) {
      showToast("⚠️ Les deux mots de passe ne correspondent pas.", "error");
      return;
    }

    setSaving(true);
    const { error } = await createClient().auth.updateUser({ password: pwd });
    setSaving(false);

    if (error) {
      showToast(
        error.message.toLowerCase().includes("should be different")
          ? "⚠️ Choisissez un mot de passe différent de l'actuel."
          : "❌ Impossible de changer le mot de passe. Le lien a peut-être expiré.",
        "error"
      );
      return;
    }

    showToast("✅ Mot de passe modifié. Vous êtes connecté.", "success");
    router.push("/compte");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-[5%] pt-[110px] pb-[80px]">
      <div className="w-full max-w-[440px]">
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-gold3 border border-[rgba(200,155,60,.3)] flex items-center justify-center mx-auto mb-4 text-gold">
            <ShieldCheck size={26} />
          </div>
          <h1 className="font-display text-[28px] font-bold text-text mb-1.5">
            Nouveau mot de passe
          </h1>
          <p className="text-muted text-sm">
            Choisissez un mot de passe pour sécuriser votre compte 237Logement.
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          {!ready ? (
            <p className="text-sm text-muted text-center py-6">Vérification du lien…</p>
          ) : !currentUser ? (
            // Pas de session : lien expiré, déjà utilisé, ou page ouverte
            // directement sans passer par l'email.
            <div className="text-center py-4">
              <div className="text-[40px] mb-3">⏳</div>
              <h2 className="text-base font-semibold text-text mb-2">Lien invalide ou expiré</h2>
              <p className="text-sm text-muted mb-5 leading-relaxed">
                Les liens de réinitialisation ne sont valables qu&apos;une heure et ne peuvent
                servir qu&apos;une fois. Demandez-en un nouveau depuis la page de connexion.
              </p>
              <Link href="/connexion?tab=login">
                <Button variant="gold" full>
                  Retour à la connexion
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <p className="text-[13px] text-muted mb-5">
                Compte : <span className="text-text font-medium">{currentUser.email}</span>
              </p>

              <div className="mb-4">
                <label className="block text-[13px] text-muted mb-[7px] font-medium">
                  Nouveau mot de passe
                </label>
                <PasswordField
                  value={pwd}
                  onChange={setPwd}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <PasswordStrength password={pwd} />
              </div>

              <div className="mb-5">
                <label className="block text-[13px] text-muted mb-[7px] font-medium">
                  Confirmer le mot de passe
                </label>
                <PasswordField
                  value={pwd2}
                  onChange={setPwd2}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {pwd2.length > 0 && pwd !== pwd2 && (
                  <p className="text-[12px] text-red mt-1.5">
                    Les deux mots de passe ne correspondent pas.
                  </p>
                )}
              </div>

              <Button variant="gold" full size="lg" loading={saving} onClick={submit}>
                Enregistrer le mot de passe
              </Button>

              <p className="text-[12px] text-dim mt-4 leading-relaxed">
                Au moins 8 caractères. Mélangez majuscules, chiffres et symboles pour un compte
                mieux protégé.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
