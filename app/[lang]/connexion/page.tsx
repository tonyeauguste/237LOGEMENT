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
import { useTranslations } from "@/i18n/IntlProvider";

type AuthTab = "login" | "register";
/** Objectifs déclarés à l'inscription — sélection multiple. */
type Goal = "find" | "publish";

const REGISTER_STEPS = 4;

function AuthPageInner() {
  const t = useTranslations("Auth");
  const STEP_LABELS = [t("step1Label"), t("step2Label"), t("step3Label"), t("step4Label")];
  const params = useSearchParams();
  const router = useRouter();
  const setCurrentUser = useAppStore((s) => s.setCurrentUser);
  const showToast = useAppStore((s) => s.showToast);

  const urlTab = params.get("tab") as AuthTab | null;
  // Tâche 1 du prompt "publier-et-auth" — ?returnTo=/publier permet à un
  // CTA (ex: "Publier mon bien" sur l'accueil) de ramener l'utilisateur là
  // où il voulait aller plutôt que systématiquement vers /compte. On ne
  // fait confiance qu'à un chemin interne (commence par "/", jamais "//" —
  // qui serait interprété comme une URL protocole-relative vers un autre
  // domaine, donc une redirection ouverte).
  const rawReturnTo = params.get("returnTo");
  const returnTo = rawReturnTo && rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//") ? rawReturnTo : "/compte";
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
      showToast(t("toastFillFields"), "error");
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
      // "Invalid login credentials" couvre à la fois un mauvais mot de
      // passe ET un email qui n'existe pas (Supabase ne distingue pas les
      // deux, pour ne pas révéler quels emails sont enregistrés) — mais
      // "Email not confirmed" est un cas différent et actionnable qu'on
      // doit signaler correctement plutôt que de le noyer dans le même
      // message générique.
      showToast(
        error?.message.toLowerCase().includes("email not confirmed")
          ? t("toastEmailNotConfirmed")
          : t("toastInvalidCredentials"),
        "error"
      );
      return;
    }
    const user = await buildUserFromSession(data.session);
    if (!user) {
      // Compte bloqué par un administrateur — buildUserFromSession a déjà
      // fermé la session ouverte par signInWithPassword ci-dessus.
      showToast(t("toastAccountBlocked"), "error");
      return;
    }
    setCurrentUser(user);
    showToast(t("toastWelcome", { name: user.name }), "success");
    router.push(returnTo);
  }

  /** Validation de l'étape courante avant de passer à la suivante. */
  function goNext() {
    if (step === 1) {
      if (!fname.trim()) {
        showToast(t("toastEnterFirstName"), "error");
        return;
      }
    }
    if (step === 2 && goals.length === 0) {
      showToast(t("toastSelectGoal"), "error");
      return;
    }
    if (step === 3) {
      if (!regEmail.trim()) {
        showToast(t("toastEnterEmail"), "error");
        return;
      }
      if (regPwd.length < 8) {
        showToast(t("toastPasswordTooShort"), "error");
        return;
      }
      if (regPwd !== regPwd2) {
        showToast(t("toastPasswordMismatch"), "error");
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
          ? t("toastAccountExists")
          : t("toastGenericError"),
        "error"
      );
      return;
    }
    if (!data.session) {
      // Par protection anti-énumération, Supabase répond 200 sans erreur
      // même quand l'email existe déjà — sans cette vérification sur
      // `identities` (vide pour un email déjà enregistré, cf. doc Supabase
      // "Existing accounts"), on annonçait à tort "Compte créé !" à un
      // utilisateur qui a juste retapé son email existant, qui tentait
      // ensuite de se connecter avec un mot de passe qui n'était jamais
      // le bon → cascade de "Email ou mot de passe incorrect" (bug réel
      // observé dans les logs Supabase du projet).
      if (data.user && data.user.identities?.length === 0) {
        showToast(t("toastAccountExists"), "error");
        setTab("login");
        setLoginEmail(regEmail.trim());
        setStep(1);
        return;
      }
      // Cas normal : la confirmation par email est activée sur ce projet,
      // le compte est créé mais pas encore utilisable tant que le lien
      // reçu par email n'a pas été cliqué.
      showToast(t("toastAccountCreatedConfirm"), "success");
      setTab("login");
      setLoginEmail(regEmail.trim());
      setStep(1);
      return;
    }
    const user = await buildUserFromSession(data.session);
    if (!user) {
      showToast(t("toastGenericError"), "error");
      return;
    }
    setCurrentUser(user);
    showToast(t("toastAccountCreatedWelcome", { name: fname }), "success");
    router.push(returnTo);
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
              {t("loginTab")}
            </button>
            <button
              onClick={() => setTab("register")}
              className={`flex-1 py-2.5 rounded-[9px] text-sm font-medium transition-colors duration-200 cursor-pointer ${
                tab === "register" ? "bg-gold3 text-gold" : "text-muted"
              }`}
            >
              {t("registerTab")}
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
                <h1 className="font-display text-[28px] font-bold text-text mb-1.5">{t("loginTitle")}</h1>
                <p className="text-muted text-sm mb-[26px]">{t("loginSubtitle")}</p>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("emailLabel")}</label>
                  <input
                    className="form-control"
                    type="email"
                    autoComplete="email"
                    placeholder={t("emailPlaceholder")}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("passwordLabel")}</label>
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
                        showToast(t("toastEnterEmailFirst"), "error");
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
                        error ? t("toastResetEmailError") : t("toastResetEmailSent"),
                        error ? "error" : "success"
                      );
                    }}
                  >
                    {t("forgotPassword")}
                  </button>
                </div>
                <Button variant="gold" full size="lg" loading={loading} onClick={handleLogin}>
                  {t("loginButton")}
                </Button>
                <p className="text-center text-[13px] text-muted mt-[18px]">
                  {t("noAccount")}{" "}
                  <button className="text-gold font-semibold" onClick={() => setTab("register")}>
                    {t("signUpLink")}
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
                    <span>{t("stepOf", { step, total: REGISTER_STEPS })}</span>
                    {step > 1 && (
                      <button
                        onClick={goPrev}
                        className="flex items-center gap-1 text-gold hover:underline cursor-pointer"
                      >
                        <ArrowLeft size={12} /> {t("back")}
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

                <h1 className="font-display text-[28px] font-bold text-text mb-1">{t("registerTitle")}</h1>
                <p className="text-muted text-sm mb-6">
                  {t("stepOf", { step, total: REGISTER_STEPS })} — {STEP_LABELS[step - 1]}
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
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("firstNameLabel")}</label>
                          <input
                            className="form-control"
                            placeholder={t("firstNamePlaceholder")}
                            autoComplete="given-name"
                            value={fname}
                            onChange={(e) => setFname(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("lastNameLabel")}</label>
                          <input
                            className="form-control"
                            placeholder={t("lastNamePlaceholder")}
                            autoComplete="family-name"
                            value={lname}
                            onChange={(e) => setLname(e.target.value)}
                          />
                        </div>
                        <div className="mb-1">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">
                            {t("phoneLabel")} <span className="text-dim font-normal">{t("phoneOptional")}</span>
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
                              placeholder={t("phonePlaceholder")}
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                            />
                          </div>
                          <p className="text-[11px] text-dim mt-1.5">{t("phoneHint")}</p>
                        </div>
                      </>
                    )}

                    {step === 2 && (
                      <>
                        <p className="text-[13px] font-semibold text-text mb-1">{t("goalsTitle")}</p>
                        <p className="text-[12px] text-muted mb-4">{t("goalsSubtitle")}</p>
                        <div className="flex flex-col gap-3">
                          <GoalCard
                            icon={<Search size={17} />}
                            title={t("goalFindTitle")}
                            desc={t("goalFindDesc")}
                            checked={goals.includes("find")}
                            onToggle={() => toggleGoal("find")}
                          />
                          <GoalCard
                            icon={<Megaphone size={17} />}
                            title={t("goalPublishTitle")}
                            desc={t("goalPublishDesc")}
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
                            {t("loginEmailLabel")}
                          </label>
                          <input
                            className="form-control"
                            type="email"
                            autoComplete="email"
                            placeholder={t("emailPlaceholder")}
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-[13px] text-muted mb-[7px] font-medium">
                            {t("passwordCreateLabel")}
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
                            {t("confirmPasswordLabel")}
                          </label>
                          <PasswordField
                            value={regPwd2}
                            onChange={setRegPwd2}
                            placeholder="••••••••"
                            autoComplete="new-password"
                          />
                          {regPwd2.length > 0 && regPwd !== regPwd2 && (
                            <p className="text-[12px] text-red mt-1.5">{t("passwordMismatch")}</p>
                          )}
                        </div>
                        <div className="bg-card border border-border rounded-xl px-4 py-3 text-[12px] text-muted">
                          {t("passwordRules")}
                        </div>
                      </>
                    )}

                    {step === 4 && (
                      <>
                        <div className="bg-card border border-border rounded-2xl p-5 mb-4">
                          <RecapRow k={t("recapFullName")} v={`${fname} ${lname}`.trim() || t("recapEmpty")} />
                          <RecapRow
                            k={t("recapPhone")}
                            v={phone.trim() ? `+237 ${phone.trim()}` : t("recapNotProvided")}
                          />
                          <RecapRow k={t("recapEmail")} v={regEmail.trim() || t("recapEmpty")} />
                          <RecapRow
                            k={t("recapGoals")}
                            v={
                              goals.length === 0
                                ? t("recapEmpty")
                                : goals
                                    .map((g) => (g === "find" ? t("recapGoalFind") : t("recapGoalPublish")))
                                    .join(" · ")
                            }
                            last
                          />
                        </div>
                        <p className="text-[12px] text-muted mb-1">{t("termsText")}</p>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="flex gap-3 mt-6">
                  {step > 1 && (
                    <Button variant="ghost" size="lg" onClick={goPrev} className="flex-1">
                      ← {t("back")}
                    </Button>
                  )}
                  {step < REGISTER_STEPS ? (
                    <Button variant="gold" size="lg" onClick={goNext} className="flex-1">
                      {t("continueButton")}
                    </Button>
                  ) : (
                    <Button
                      variant="gold"
                      size="lg"
                      loading={loading}
                      onClick={handleRegister}
                      className="flex-1"
                    >
                      {t("createAccountButton")}
                    </Button>
                  )}
                </div>

                <p className="text-center text-[13px] text-muted mt-[18px]">
                  {t("alreadyAccount")}{" "}
                  <button className="text-gold font-semibold" onClick={() => setTab("login")}>
                    {t("loginLink")}
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-center text-[11px] text-dim mt-6">{t("secureFooter")}</p>
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
