"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { CONTACT } from "@/lib/data";

const DETAILS = [
  {
    icon: "📍",
    title: "Siège social",
    text: (
      <>
        Quartier Ebomé, Avant l&apos;hôpital
        <br />
        Kribi, Sud, Cameroun
      </>
    ),
  },
  {
    icon: "📞",
    title: "Téléphone / WhatsApp",
    text: (
      <>
        <a href={`tel:${CONTACT.phoneRaw}`} className="hover:text-gold transition-colors">
          {CONTACT.phone}
        </a>
        <br />
        {CONTACT.hoursShort}
      </>
    ),
  },
  {
    icon: "✉️",
    title: "Email",
    text: (
      <>
        <a href={`mailto:${CONTACT.email}`} className="hover:text-gold transition-colors break-all">
          {CONTACT.email}
        </a>
        <br />
        Réponse sous 24h ouvrées.
      </>
    ),
  },
  {
    icon: "🕐",
    title: "Horaires d'ouverture",
    text: (
      <>
        {CONTACT.hoursLong}
        <br />
        <span className="text-dim">Fermé le week-end</span>
      </>
    ),
  },
];

const SUBJECTS = [
  "Problème avec une annonce",
  "Question sur mon compte",
  "Signaler une fraude",
  "Partenariat professionnel",
  "Presse & Média",
  "Autre",
];

export default function ContactPage() {
  const showToast = useAppStore((s) => s.showToast);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!fname.trim() || !email.trim() || !subject || !message.trim()) {
      showToast("⚠️ Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("contact_messages").insert({
      first_name: fname.trim(),
      last_name: lname.trim() || null,
      email: email.trim(),
      phone: phone.trim() || null,
      subject,
      message: message.trim(),
    });
    setLoading(false);
    if (error) {
      showToast("❌ Une erreur est survenue. Veuillez réessayer.", "error");
      return;
    }
    setSent(true);
    showToast("✅ Message envoyé ! Réponse sous 24h.", "success");
  }

  return (
    <div className="max-w-[1100px] mx-auto px-[5%] pt-[90px] pb-20">
      <div className="text-center mb-14">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          Parlons-nous
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="font-display text-[clamp(26px,3.5vw,46px)] font-bold text-text mt-2">
            Contactez <span className="text-gold">notre équipe</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="gold-bar mt-3.5 mx-auto" />
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-[15px] mt-3.5 max-w-[500px] mx-auto">
            Une question, un problème, une suggestion ? Nous sommes là pour vous aider. Notre
            équipe camerounaise vous répond rapidement.
          </p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12">
        <Reveal>
          <h3 className="font-display text-[22px] font-bold text-text mb-4">
            Plusieurs façons de nous joindre
          </h3>
          <p className="text-muted text-sm leading-[1.75] mb-7">
            Choisissez le canal qui vous convient le mieux. Nous traitons toutes les demandes
            sérieusement et dans les meilleurs délais.
          </p>
          {DETAILS.map((d) => (
            <div key={d.title} className="flex gap-3.5 mb-5 p-4 bg-card border border-border rounded-xl">
              <div className="w-[42px] h-[42px] rounded-[10px] bg-gold3 border border-[rgba(200,155,60,.25)] flex items-center justify-center text-lg shrink-0">
                {d.icon}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-text mb-0.5">{d.title}</h4>
                <p className="text-[13px] text-muted leading-relaxed">{d.text}</p>
              </div>
            </div>
          ))}
          <div className="mt-6 p-[18px] bg-gold3 border border-[rgba(200,155,60,.25)] rounded-xl">
            <p className="text-sm text-gold font-semibold mb-1">🔒 Signalement de fraude</p>
            <p className="text-[13px] text-muted">
              Pour signaler une annonce suspecte, utilisez le formulaire ci-contre avec l&apos;objet{" "}
              <strong className="text-text">« Signaler une fraude »</strong>, ou appelez-nous
              directement.
              <br />
              Traitement prioritaire sous 24h.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="bg-card border border-border rounded-[20px] p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-10 px-5"
              >
                <div className="text-[48px] mb-3.5">✅</div>
                <h3 className="text-xl font-semibold text-text mb-2">
                  Message envoyé avec succès !
                </h3>
                <p className="text-muted text-sm">
                  Merci {fname}, nous avons bien reçu votre message.
                  <br />
                  Notre équipe vous répondra sous 24 heures ouvrées.
                  <br />
                  <br />
                  <strong className="text-gold">237Logement vous remercie de votre confiance.</strong>
                </p>
                <Link href="/">
                  <Button variant="gold" className="mt-[22px]">
                    Retour à l&apos;accueil
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-display text-[22px] font-bold text-text mb-1.5">
                  Envoyez-nous un message
                </h3>
                <p className="text-sm text-muted mb-6">
                  Décrivez votre demande en détail pour une réponse plus rapide et personnalisée.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">Prénom *</label>
                    <input className="form-control" placeholder="Votre prénom" value={fname} onChange={(e) => setFname(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">Nom *</label>
                    <input className="form-control" placeholder="Votre nom" value={lname} onChange={(e) => setLname(e.target.value)} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Email *</label>
                  <input className="form-control" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Téléphone</label>
                  <input className="form-control" placeholder="+237 6XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Objet *</label>
                  <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">Sélectionner un objet</option>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Message *</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: 130 }}
                    placeholder="Décrivez votre demande ici…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button variant="gold" full size="lg" loading={loading} onClick={handleSubmit}>
                  Envoyer le message
                </Button>
                <p className="text-xs text-dim text-center mt-3.5">
                  En soumettant ce formulaire, vous acceptez notre politique de confidentialité.
                  Vos données sont utilisées uniquement pour répondre à votre demande.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
}
