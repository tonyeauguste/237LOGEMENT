"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { CONTACT } from "@/lib/data";
import { useTranslations } from "@/i18n/IntlProvider";

export default function ContactPage() {
  const t = useTranslations("Contact");
  const showToast = useAppStore((s) => s.showToast);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const DETAILS = [
    {
      icon: "📞",
      title: t("phoneTitle"),
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
      title: t("emailTitle"),
      text: (
        <>
          <a href={`mailto:${CONTACT.email}`} className="hover:text-gold transition-colors break-all">
            {CONTACT.email}
          </a>
          <br />
          {t("emailReply")}
        </>
      ),
    },
    {
      icon: "🕐",
      title: t("hoursTitle"),
      text: (
        <>
          {CONTACT.hoursLong}
          <br />
          <span className="text-dim">{t("hoursClosed")}</span>
        </>
      ),
    },
  ];

  const SUBJECTS = [
    t("subject1"),
    t("subject2"),
    t("subject3"),
    t("subject4"),
    t("subject5"),
    t("subject6"),
  ];

  async function handleSubmit() {
    if (!fname.trim() || !email.trim() || !subject || !message.trim()) {
      showToast(t("toastMissingFields"), "error");
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
      showToast(t("toastError"), "error");
      return;
    }
    setSent(true);
    showToast(t("toastSuccess"), "success");
  }

  return (
    <div className="max-w-[1100px] mx-auto px-[5%] pt-[90px] pb-20">
      <div className="text-center mb-14">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          {t("kicker")}
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="font-display text-[clamp(26px,3.5vw,46px)] font-bold text-text mt-2">
            {t("titlePrefix")} <span className="text-gold">{t("titleHighlight")}</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="gold-bar mt-3.5 mx-auto" />
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-[15px] mt-3.5 max-w-[500px] mx-auto">{t("subtitle")}</p>
        </Reveal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-12">
        <Reveal>
          <h3 className="font-display text-[22px] font-bold text-text mb-4">{t("waysTitle")}</h3>
          <p className="text-muted text-sm leading-[1.75] mb-7">{t("waysText")}</p>
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
            <p className="text-sm text-gold font-semibold mb-1">{t("fraudTitle")}</p>
            <p className="text-[13px] text-muted">
              {t("fraudTextPart1")} <strong className="text-text">{t("fraudTextStrong")}</strong>
              {t("fraudTextPart2")}
              <br />
              {t("fraudPriority")}
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
                <h3 className="text-xl font-semibold text-text mb-2">{t("successTitle")}</h3>
                <p className="text-muted text-sm">
                  {t("successThanks", { name: fname })}
                  <br />
                  {t("successReply")}
                  <br />
                  <br />
                  <strong className="text-gold">{t("successFooter")}</strong>
                </p>
                <Link href="/">
                  <Button variant="gold" className="mt-[22px]">
                    {t("backHomeButton")}
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h3 className="font-display text-[22px] font-bold text-text mb-1.5">{t("formTitle")}</h3>
                <p className="text-sm text-muted mb-6">{t("formSubtitle")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("firstNameLabel")}</label>
                    <input className="form-control" placeholder={t("firstNamePlaceholder")} value={fname} onChange={(e) => setFname(e.target.value)} />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("lastNameLabel")}</label>
                    <input className="form-control" placeholder={t("lastNamePlaceholder")} value={lname} onChange={(e) => setLname(e.target.value)} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("emailLabel")}</label>
                  <input className="form-control" type="email" placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("phoneLabel")}</label>
                  <input className="form-control" placeholder={t("phonePlaceholder")} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("subjectLabel")}</label>
                  <select className="form-control" value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="">{t("subjectPlaceholder")}</option>
                    {SUBJECTS.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("messageLabel")}</label>
                  <textarea
                    className="form-control"
                    style={{ minHeight: 130 }}
                    placeholder={t("messagePlaceholder")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <Button variant="gold" full size="lg" loading={loading} onClick={handleSubmit}>
                  {t("sendButton")}
                </Button>
                <p className="text-xs text-dim text-center mt-3.5">{t("privacyNote")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </div>
  );
}
