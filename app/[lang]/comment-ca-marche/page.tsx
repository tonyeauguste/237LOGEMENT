import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

type HowItWorksMessages = {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  titlePrefix: string;
  titleHighlight: string;
  subtitle: string;
  findHomeButton: string;
  publishButton: string;
  labelTenants: string;
  labelTenantsOwners: string;
  labelOwners: string;
  step1Title: string;
  step1Text: string;
  step1Alt: string;
  step2Title: string;
  step2Text: string;
  step2Alt: string;
  step3Title: string;
  step3Text: string;
  step3Alt: string;
  step4Title: string;
  step4Text: string;
  step4Alt: string;
  rolesKicker: string;
  rolesTitle: string;
  rolesTitleHighlight: string;
  visitorTitle: string;
  visitorSub: string;
  visitorFeature1: string;
  visitorFeature2: string;
  visitorFeature3: string;
  visitorFeature4: string;
  visitorFeature5: string;
  visitorFeature6: string;
  ownerTitle: string;
  ownerSub: string;
  ownerFeature1: string;
  ownerFeature2: string;
  ownerFeature3: string;
  ownerFeature4: string;
  ownerFeature5: string;
  ownerFeature6: string;
  createAccountButton: string;
};

async function getHowItWorks(lang: string): Promise<HowItWorksMessages> {
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  return (messages as { HowItWorks: HowItWorksMessages }).HowItWorks;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getHowItWorks(lang);
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function HowItWorksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getHowItWorks(lang);

  const STEPS = [
    {
      num: "01",
      label: t.labelTenants,
      title: t.step1Title,
      text: t.step1Text,
      img: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=700&q=80",
      alt: t.step1Alt,
      reverse: false,
    },
    {
      num: "02",
      label: t.labelTenants,
      title: t.step2Title,
      text: t.step2Text,
      img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80",
      alt: t.step2Alt,
      reverse: true,
    },
    {
      num: "03",
      label: t.labelTenantsOwners,
      title: t.step3Title,
      text: t.step3Text,
      img: "https://images.unsplash.com/photo-1560472355-536de3962603?w=700&q=80",
      alt: t.step3Alt,
      reverse: false,
    },
    {
      num: "04",
      label: t.labelOwners,
      title: t.step4Title,
      text: t.step4Text,
      img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=80",
      alt: t.step4Alt,
      reverse: true,
    },
  ];

  const ROLES = [
    {
      icon: "🏠",
      title: t.visitorTitle,
      sub: t.visitorSub,
      highlight: false,
      features: [
        t.visitorFeature1,
        t.visitorFeature2,
        t.visitorFeature3,
        t.visitorFeature4,
        t.visitorFeature5,
        t.visitorFeature6,
      ],
    },
    {
      icon: "🔑",
      title: t.ownerTitle,
      sub: t.ownerSub,
      highlight: true,
      features: [
        t.ownerFeature1,
        t.ownerFeature2,
        t.ownerFeature3,
        t.ownerFeature4,
        t.ownerFeature5,
        t.ownerFeature6,
      ],
    },
  ];

  return (
    <div>
      <div className="bg-gradient-to-br from-bg to-bg2 px-[5%] pt-20 pb-[60px] text-center border-b border-border">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          {t.kicker}
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display text-[clamp(28px,4vw,52px)] font-bold text-text mt-2.5">
            {t.titlePrefix} <span className="text-gold">{t.titleHighlight}</span> ?
          </h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-base mt-3.5 mb-7 max-w-[560px] mx-auto">{t.subtitle}</p>
        </Reveal>
        <Reveal delay={0.2} className="flex gap-3.5 justify-center flex-wrap">
          <Link href="/recherche">
            <Button variant="gold" size="lg">{t.findHomeButton}</Button>
          </Link>
          <Link href="/connexion?tab=register">
            <Button variant="outline" size="lg">{t.publishButton}</Button>
          </Link>
        </Reveal>
      </div>

      <div className="max-w-[1060px] mx-auto px-[5%]">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-[60px] items-center py-12 lg:py-[60px] border-b border-border last:border-b-0 ${
              s.reverse ? "lg:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div>
              <div className="font-display text-[56px] lg:text-[72px] font-bold text-gold3 leading-none mb-2">
                <span className="text-gold">{s.num}</span>
              </div>
              <span className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{s.label}</span>
              <h2 className="font-display text-[clamp(20px,2.5vw,32px)] font-bold text-text my-2.5 mb-3.5">
                {s.title}
              </h2>
              <div className="gold-bar mb-4" />
              <p className="text-muted text-[15px] leading-[1.75]">{s.text}</p>
            </div>
            <Reveal className="rounded-[20px] overflow-hidden border border-border shadow-[0_24px_60px_rgba(0,0,0,.4)] relative h-[220px] lg:h-[280px]">
              <Image src={s.img} alt={s.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            </Reveal>
          </div>
        ))}
      </div>

      <div className="bg-bg2 border-t border-border max-w-[1100px] mx-auto px-[5%] py-[60px]">
        <div className="text-center mb-7">
          <span className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">
            {t.rolesKicker}
          </span>
          <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2">
            {t.rolesTitle.split("{highlight}")[0]}
            <span className="text-gold">{t.rolesTitleHighlight}</span>
            {t.rolesTitle.split("{highlight}")[1]}
          </h2>
          <div className="gold-bar mt-3 mx-auto" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 mt-9">
          {ROLES.map((r) => (
            <div
              key={r.title}
              className={`bg-card border rounded-[20px] overflow-hidden ${
                r.highlight ? "border-[rgba(200,155,60,.3)]" : "border-border"
              }`}
            >
              <div className={`px-7 pt-7 pb-5 border-b border-border ${r.highlight ? "bg-gold3" : ""}`}>
                <div className="text-[36px] mb-2.5">{r.icon}</div>
                <div className="font-display text-[22px] font-bold text-text mb-1.5">{r.title}</div>
                <div className="text-sm text-muted">{r.sub}</div>
              </div>
              <div className="px-7 pt-5 pb-7">
                {r.features.map((f) => (
                  <div key={f} className="flex items-center gap-3 py-2.5 border-b border-border last:border-b-0 text-sm text-muted">
                    <Check size={15} className="text-gold shrink-0" /> {f}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-9 pb-4">
          <Link href="/connexion?tab=register">
            <Button variant="gold" size="lg">{t.createAccountButton}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
