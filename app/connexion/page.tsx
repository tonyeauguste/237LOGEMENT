"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/components/ui/Button";
import RoleCard from "@/components/ui/RoleCard";
import { useAppStore } from "@/lib/store";
import { DEFAULT_AVATAR } from "@/lib/data";
import type { UserRole } from "@/lib/types";

type AuthTab = "login" | "register";

function AuthPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const showToast = useAppStore((s) => s.showToast);

  const initialTab = (params.get("tab") as AuthTab) || "login";
  const [tab, setTab] = useState<AuthTab>(initialTab);
  const [role, setRole] = useState<UserRole>("visitor");
  const [loading, setLoading] = useState(false);

  // Login fields
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPwd, setLoginPwd] = useState("");

  // Register fields
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [regPwd, setRegPwd] = useState("");

  function handleLogin() {
    if (!loginEmail.trim() || !loginPwd) {
      showToast("⚠️ Remplissez tous les champs.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isOwner = loginEmail.toLowerCase().includes("proprio") || loginEmail.toLowerCase().includes("owner");
      const name = loginEmail
        .split("@")[0]
        .replace(/[._]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
      login({
        name,
        email: loginEmail,
        role: isOwner ? "owner" : "visitor",
        avatar: DEFAULT_AVATAR,
      });
      showToast(`✅ Bienvenue ${name} !`, "success");
      router.push(isOwner ? "/compte/proprietaire" : "/compte/visiteur");
    }, 1200);
  }

  function handleRegister() {
    if (!fname.trim() || !regEmail.trim() || !regPwd) {
      showToast("⚠️ Remplissez tous les champs obligatoires.", "error");
      return;
    }
    if (regPwd.length < 6) {
      showToast("⚠️ Le mot de passe doit avoir au moins 6 caractères.", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login({
        name: `${fname} ${lname}`.trim(),
        email: regEmail,
        phone,
        role,
        avatar: DEFAULT_AVATAR,
      });
      showToast(`🎉 Compte créé ! Bienvenue ${fname} !`, "success");
      router.push(role === "owner" ? "/compte/proprietaire" : "/compte/visiteur");
    }, 1400);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden min-h-[500px]">
        <Image
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=80"
          alt="Belle maison"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute bottom-9 left-9">
          <Image
            src="/badge-237logement.jpg"
            alt="237Logement"
            width={128}
            height={85}
            className="rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,.6)] border border-[rgba(200,155,60,.3)]"
          />
        </div>
      </div>

      <div className="bg-bg2 flex items-center justify-center px-[8%] py-[60px] lg:min-h-screen pt-[100px] lg:pt-[60px]">
        <div className="w-full max-w-[420px]">
          <div className="flex bg-card rounded-xl p-1 mb-[30px]">
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
                    placeholder="votre@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Mot de passe</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="••••••••"
                    value={loginPwd}
                    onChange={(e) => setLoginPwd(e.target.value)}
                  />
                </div>
                <div className="flex justify-end mb-[18px]">
                  <button className="bg-none border-none text-gold text-[13px] cursor-pointer">
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
                <h1 className="font-display text-[28px] font-bold text-text mb-1.5">Créer un compte</h1>
                <p className="text-muted text-sm mb-[26px]">Rejoignez 237Logement gratuitement.</p>
                <p className="text-[13px] text-muted mb-3 font-medium">Je souhaite :</p>
                <div className="grid grid-cols-2 gap-3 mb-[22px]">
                  <RoleCard
                    icon="🏠"
                    title="Trouver un logement"
                    desc="Rechercher, comparer et sauvegarder des annonces"
                    active={role === "visitor"}
                    onClick={() => setRole("visitor")}
                  />
                  <RoleCard
                    icon="🔑"
                    title="Louer mon bien"
                    desc="Publier et gérer mes annonces de location"
                    active={role === "owner"}
                    onClick={() => setRole("owner")}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">Prénom</label>
                    <input
                      className="form-control"
                      placeholder="Votre prénom"
                      value={fname}
                      onChange={(e) => setFname(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">Nom</label>
                    <input
                      className="form-control"
                      placeholder="Votre nom"
                      value={lname}
                      onChange={(e) => setLname(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Adresse email</label>
                  <input
                    className="form-control"
                    type="email"
                    placeholder="votre@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Téléphone</label>
                  <input
                    className="form-control"
                    placeholder="+237 6XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Mot de passe</label>
                  <input
                    className="form-control"
                    type="password"
                    placeholder="Minimum 8 caractères"
                    value={regPwd}
                    onChange={(e) => setRegPwd(e.target.value)}
                  />
                </div>
                <Button variant="gold" full size="lg" loading={loading} onClick={handleRegister} className="mt-2">
                  Créer mon compte
                </Button>
                <p className="text-center text-[13px] text-muted mt-[18px]">
                  Déjà inscrit ?{" "}
                  <button className="text-gold font-semibold" onClick={() => setTab("login")}>
                    Se connecter
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
