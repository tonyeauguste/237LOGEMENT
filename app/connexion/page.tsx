"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Megaphone, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import AuthHero from "@/components/auth/AuthHero";
import GoalCard from "@/components/auth/GoalCard";
import PasswordField from "@/components/auth/PasswordField";
import PasswordStrength from "@/components/auth/PasswordStrength";
import { buildUserFromSession, useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_AVATAR } from "@/lib/data";

type AuthTab = "login" | "register";
/** Objectifs déclarés à l'inscription — sélection multiple. */
type Goal = "find" | "publish";

const REGISTER_STEPS = 4;
const STEP_LABELS = [
  "Vos informations",
  "Vos objectifs",
  "Sécurisez votre accès",
  "Confirmation",
];

function AuthPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const showToast = useAppStore((s) => s.showToast);

  const urlTab = params.get("tab") as AuthTab | null;
  const [tab, setTab] = useState<AuthTab>(urlTab || "login");
  const [loading, setLoading] = useState(false);

  // Si l'utilisateur est déjà sur /connexion et clique un lien
  // "Connexion"/"Inscription" ailleurs sur le site (navbar, footer, CTA…),
  // seul le paramètre ?tab= change — le composant n'est pas remonté, donc
  // sans cet ajustement l'onglet restait bloqué sur sa valeur initiale.
  // Fait pendant le rendu (pattern recommandé par React) plutôt que dans
  // un effet, pour éviter un rendu supplémentaire à chaque navigation.
  const [prevUrlTab, setPrevUrlTab] = useState(urlTab);
  if (urlTab !== prevUrlTab) {
    setPrevUrlTab(urlTab);
    if (urlTab && urlTab !== tab) setTab(urlTab);
  }

  // ── Connexion ────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // ── Inscription (parcours en 4 étapes) ───────────
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [regEmail, setRegEmail] = useState("");
  const [regPwd, setRegPwd] = useState("");
  const [regPwd2, setRegPwd2] = useState("");

  function toggleGoal(g: Goal) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  async function handleLogin() {
    if (!loginEmail.trim() || !loginPwd) {
      showToast("⚠️ Remplissez tous les champs.", "error");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPwd,
    });
    setLoading(false);
    if (error || !data.session) {
      showToast("❌ Email ou mot de passe incorrect.", "error");
      return;
    }
    const user = await buildUserFromSession(data.session);
    if (!user) {
      // Compte bloqué par un administrateur — buildUserFromSession a déjà
      // fermé la session ouverte par signInWithPassword ci-dessus.
      showToast("⛔ Ce compte a été bloqué. Contactez l'administrateur.", "error");
      return;
    }
    setCurrentUser(user);
    showToast(`✅ Bienvenue ${user.name} !`, "success");
    router.push("/compte");
  }

  /** Validation de l'étape courante avant de passer à la suivante. */
  function goNext() {
    if (step === 1) {
      if (!fname.trim()) {
        showToast("⚠️ Veuillez renseigner votre prénom.", "error");
        return;
      }
    }
    if (step === 2 && goals.length === 0) {
      showToast("⚠️ Sélectionnez au moins un objectif.", "error");
      return;
    }
    if (step === 3) {
      if (!regEmail.trim()) {
        showToast("⚠️ Veuillez renseigner votre adresse email.", "error");
        return;
      }
      if (regPwd.length < 8) {
        showToast("⚠️ Le mot de passe doit contenir au moins 8 caractères.", "error");
        return;
      }
      if (regPwd !== regPwd2) {
        showToast("⚠️ Les deux mots de passe ne correspondent pas.", "error");
        return;
      }
    }
    setDir(1);
    setStep((s) => Math.min(s + 1, REGISTER_STEPS));
  }

  function goPrev() {
    setDir(-1);
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleRegister() {
    setLoading(true);
    const supabase = createClient();
    const name = `${fname} ${lname}`.trim();
    // Les objectifs déterminent le rôle stocké : dès que l'utilisateur
    // souhaite publier, il est "owner" (seul rôle autorisé à créer des
    // annonces côté RLS). Le tableau de bord, lui, est le même pour tous.
    const role = goals.includes("publish") ? "owner" : "visitor";
    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPwd,
      options: {
        data: { role, name, phone: phone.trim() || null, avatar: DEFAULT_AVATAR },
      },
    });
    setLoading(false);
    if (error) {
      showToast(
        error.message.toLowerCase().includes("already registered")
          ? "❌ Un compte existe déjà avec cet email."
          : "❌ Une erreur est survenue. Réessayez.",
        "error"
      );
      return;
    }
    if (!data.session) {
      // La confirmation par email est activée sur ce projet : le compte
      // est créé mais pas encore utilisable tant que le lien reçu par
      // email n'a pas été cliqué.
      showToast("📧 Compte créé ! Vérifiez vos emails pour confirmer votre adresse.", "success");
      setTab("login");
      setStep(1);
      return;
    }
    const user = await buildUserFromSession(data.session);
    if (!user) {
      showToast("❌ Une erreur est survenue. Réessayez.", "error");
      return;
    }
    setCurrentUser(user);
    showToast(`🎉 Compte créé ! Bienvenue ${fname} !`, "success");
    router.push("/compte");
  }

  const stepVariants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <AuthHero />

      <div className="bg-bg2 flex items-center justify-center px-[8%] py-[60px] lg:min-h-screen pt-[100px] lg:pt-[90px]">
        <div className="w-full max-w-[440px]">
          <div className="flex bg-card rounded-xl p-1 mb-7">
            <button
              onClick={() => setTab("login")}
              className={`flex-1 py-2.5 rounded-[9px] text-sm font-medium transition-colors duration-200 cursor-pointer ${
                tab === "login" ? "bg-gold3 text-gold" : "text-muted"
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 rounded-[9px] text-sm font-medium transition-colors duration-200 cursor-pointer ${
                tab === "register" ? "bg-gold3 text-gold" : "text-muted"
              }`}
            >
              Inscription
            </button>
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="font-display text-[28px] font-bold text-text mb-1.5">Bon retour !</h1>
                <p className="text-muted text-sm mb-[26px]">
                  Connectez-vous pour accéder à votre espace personnel.
                </p>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Adresse email</label>
                  <input
                    className="form-control"
                    type="email"
                    autoComplete="email"
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Mot de passe</label>
                  <PasswordField
                    value={loginPwd}
                    onChange={setLoginPwd}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex justify-end mb-[18px]">
                  <button
                    className="bg-none border-none text-gold text-[13px] cursor-pointer"
                    onClick={async () => {
                      if (!loginEmail.trim()) {
                        showToast("⚠️ Renseignez d'abord votre adresse email ci-dessus.", "error");
                        return;
                      }
                      const supabase = createClient();
                      // redirectTo explicite : sans lui, le lien de l'email
                      // renvoie sur l'accueil, où rien ne permet de saisir un
                      // nouveau mot de passe — le parcours restait sans issue.
                      const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
                        redirectTo: `${window.location.origin}/mot-de-passe`,
                      });
                      showToast(
                        error
                          ? "❌ Une erreur est survenue. Réessayez."
                          : "📧 Email de réinitialisation envoyé (si ce compte existe).",
                        error ? "error" : "success"
                      );
                    }}
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <Button variant="gold" full size="lg" loading={loading} onClick={handleLogin}>
                  Se connecter
                </Button>
                <p className="text-center text-[13px] text-muted mt-[18px]">
                  Pas encore de compte ?{" "}
                  <button className="text-gold font-semibold" onClick={() => setTab("register")}>
                    S&apos;inscrire gratuitement
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Indicateur d'avancement du parcours en 4 étapes */}
                <div className="mb-5">
                  <div className="flex justify-between items-center text-[12px] text-muted mb-2">
                    <span>
                      Étape {step} sur {REGISTER_STEPS}
                    </span>
                    {step > 1 && (
                      <button
                        onClick={goPrev}
                        className="flex items-center gap-1 text-gold hover:underline cursor-pointer"
                      >
                        <ArrowLeft size={12} /> Retour
                      </button>
                    )}
                  </div>
                  <div className="h-[3px] bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gold rounded-full"
                      initial={false}
                      animate={{ width: `${(step / REGISTER_STEPS) * 100}%` }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <h1 className="font-display text-[28px] font-bold text-text mb-1">Créer un compte</h1>
                <p className="text-muted text-sm mb-6">
                  Étape {step} sur {REGISTER_STEPS} — {STEP_LABELS[step - 1]}
                </p>

                <AnimatePresence mode="wait" custom={dir} initial={false}>
                  <motion.div
                    key={step}
                    custom={dir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    {step === 1 && (
                      <>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">Prénom *</label>
                          <input
                            className="form-control"
                            placeholder="Votre prénom"
                            autoComplete="given-name"
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">Nom</label>
                          <input
                            className="form-control"
                            placeholder="Votre nom"
                            autoComplete="family-name"
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                          />
                        </div>
                        <div className="mb-1">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">
                            Téléphone <span className="text-dim font-normal">(optionnel)</span>
                          </label>
                          {/* Préfixe pays figé : la plateforme ne cible que le
                              Cameroun, autant éviter un sélecteur inutile. */}
                          <div className="flex">
                            <span className="flex items-center gap-1.5 px-3 rounded-l-[10px] border-[1.5px] border-r-0 border-border bg-bg3 text-sm text-muted shrink-0">
                              🇨🇲 +237
                            </span>
                            <input
                              className="form-control !rounded-l-none"
                              type="tel"
                              autoComplete="tel"
                              placeholder="6XX XXX XXX"
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          <p className="text-[11px] text-dim mt-1.5">
                            Utile pour être contacté au sujet de vos annonces.
                          </p>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <p className="text-[13px] font-semibold text-text mb-1">
                          Que voulez-vous faire sur 237Logement ?
                        </p>
                        <p className="text-[12px] text-muted mb-4">
                          Sélectionnez une ou plusieurs options qui vous correspondent.
                        </p>
                        <div className="flex flex-col gap-3">
                          <GoalCard
                            icon={<Search size={17} />}
                            title="Trouver un bien"
                            desc="Recherchez, sauvegardez des annonces et contactez directement les propriétaires."
                            checked={goals.includes("find")}
                            onToggle={() => toggleGoal("find")}
                          />
                          <GoalCard
                            icon={<Megaphone size={17} />}
                            title="Publier ou louer un bien"
                            desc="Publiez vos biens à louer, suivez les vues et gérez les demandes reçues."
                            checked={goals.includes("publish")}
                            onToggle={() => toggleGoal("publish")}
                          />
                        </div>
                      </>
                    )}

                    {step === 3 && (
                      <>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">
                            Email de connexion *
                          </label>
                          <input
                            className="form-control"
                            type="email"
                            autoComplete="email"
                            placeholder="votre@email.com"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">
                            Mot de passe *
                          </label>
                          <PasswordField
                            value={regPwd}
                            onChange={setRegPwd}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          <PasswordStrength password={regPwd} />
                        </div>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">
                            Confirmer le mot de passe *
                          </label>
                          <PasswordField
                            value={regPwd2}
                            onChange={setRegPwd2}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          {regPwd2.length > 0 && regPwd !== regPwd2 && (
                            <p className="text-[12px] text-red mt-1.5">
                              Les deux mots de passe ne correspondent pas.
                            </p>
                          )}
                        </div>
                        <div className="bg-card border border-border rounded-xl px-4 py-3 text-[12px] text-muted">
                          Votre mot de passe doit contenir au moins 8 caractères. Mélangez majuscules,
                          chiffres et symboles pour un compte mieux protégé.
                        </div>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
                          <RecapRow k="Nom complet" v={`${fname} ${lname}`.trim() || "—"} />
                          <RecapRow k="Téléphone" v={phone.trim() ? `+237 ${phone.trim()}` : "Non renseigné"} />
                          <RecapRow k="Email" v={regEmail.trim() || "—"} />
                          <RecapRow
                            k="Objectifs"
                            v={
                              goals.length === 0
                                ? "—"
                                : goals
                                    .map((g) => (g === "find" ? "Trouver un bien" : "Publier un bien"))
                                    .join(" · ")
                            }
                            last
                          />
                        </div>
                        <p className="text-[12px] text-muted mb-1">
                          En créant votre compte, vous acceptez nos conditions d&apos;utilisation.
                          Publication gratuite, sans commission.
                        </p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <Button variant="ghost" size="lg" onClick={goPrev} className="flex-1">
                      ← Retour
                    </Button>
                  )}
                  {step < REGISTER_STEPS ? (
                    <Button variant="gold" size="lg" onClick={goNext} className="flex-1">
                      Continuer →
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="lg"
                      loading={loading}
                      onClick={handleRegister}
                      className="flex-1"
                    >
                      Créer mon compte
                    </Button>
                  )}
                </div>

                <p className="text-center text-[13px] text-muted mt-[18px]">
                  Vous avez déjà un compte ?{" "}
                  <button className="text-gold font-semibold" onClick={() => setTab("login")}>
                    Se connecter
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[11px] text-dim mt-6">
            🔒 Connexion sécurisée · Vos données restent privées
          </p>
        </div>
      </div>
    </div>
  );
}

function RecapRow({ k, v, last }: { k: string; v: string; last?: boolean }) {
  return (
    <div className={`flex justify-between gap-4 py-2.5 text-sm ${last ? "" : "border-b border-border"}`}>
      <span className="text-muted text-xs uppercase tracking-wide shrink-0">{k}</span>
      <span className="font-medium text-text text-right break-words">{v}</span>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthPageInner />
    </Suspense>
  );
}
