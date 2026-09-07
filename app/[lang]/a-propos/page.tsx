import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Button from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import TiltCard from "@/components/ui/TiltCard";
import { getMessages } from "@/i18n/dictionaries";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

type AboutMessages = {
  metaTitle: string;
  metaDescription: string;
  kicker1: string;
  titleLine1: string;
  titleLine2Prefix: string;
  titleHighlightWord: string;
  paragraph1: string;
  paragraph2: string;
  findHomeButton: string;
  number1Val: string;
  number1Label: string;
  number2Val: string;
  number2Label: string;
  number3Val: string;
  number3Label: string;
  number4Val: string;
  number4Label: string;
  kicker2: string;
  valuesTitle: string;
  valuesTitleHighlight: string;
  value1Title: string;
  value1Desc: string;
  value2Title: string;
  value2Desc: string;
  value3Title: string;
  value3Desc: string;
  value4Title: string;
  value4Desc: string;
  kicker3: string;
  missionTitleLine1: string;
  missionTitleLine2Prefix: string;
  missionTitleHighlightWord: string;
  missionParagraph1: string;
  missionParagraph2: string;
  contactButton: string;
};

async function getAbout(lang: string): Promise<AboutMessages> {
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);
  return (messages as { About: AboutMessages }).About;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const t = await getAbout(lang);
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getAbout(lang);

  const NUMBERS = [
    { val: t.number1Val, label: t.number1Label },
    { val: t.number2Val, label: t.number2Label },
    { val: t.number3Val, label: t.number3Label },
    { val: t.number4Val, label: t.number4Label },
  ];

  const VALUES = [
    { icon: "🛡", title: t.value1Title, desc: t.value1Desc },
    { icon: "🌍", title: t.value2Title, desc: t.value2Desc },
    { icon: "💡", title: t.value3Title, desc: t.value3Desc },
    { icon: "🚀", title: t.value4Title, desc: t.value4Desc },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-bg to-bg2 border-b border-border px-[5%] pt-20 pb-[60px]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
              {t.kicker1}
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="font-display text-[clamp(26px,3.5vw,48px)] font-bold text-text mt-2.5 leading-tight">
                {t.titleLine1}
                <br />
                {t.titleLine2Prefix} <span className="text-gold">{t.titleHighlightWord}</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="gold-bar mt-3 mb-5" />
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-muted text-[15px] leading-[1.8] mb-4">{t.paragraph1}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-muted text-[15px] leading-[1.8] mb-7">{t.paragraph2}</p>
            </Reveal>
            <Reveal delay={0.22}>
              <Link href="/recherche">
                <Button variant="gold">{t.findHomeButton}</Button>
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="hidden lg:block rounded-[20px] overflow-hidden border border-border relative h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1560472355-536de3962603?w=700&q=80"
              alt={t.kicker1}
              fill
              sizes="50vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </div>

      {/* Numbers */}
      <div className="bg-bg2 border-y border-border px-[5%] py-[60px]">
        <div className="max-w-[900px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-y-7 text-center">
          {NUMBERS.map((n, i) => (
            <Reveal key={n.label} delay={i * 0.06} className="px-5 lg:border-r lg:border-border lg:last:border-r-0">
              <div className="font-display text-[40px] font-bold text-gold">
                <CountUp value={n.val} />
              </div>
              <div className="text-[13px] text-muted mt-1.5">{n.label}</div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="py-[70px] px-[5%]">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-7">
            <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
              {t.kicker2}
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2">
                {t.valuesTitle.split("{highlight}")[0]}
                <span className="text-gold">{t.valuesTitleHighlight}</span>
                {t.valuesTitle.split("{highlight}")[1]}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="gold-bar mt-3 mx-auto" />
            </Reveal>
          </div>
          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-9">
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <TiltCard className="bg-card border border-border rounded-2xl px-5 py-6 text-center h-full" strength={6}>
                  <div className="text-[32px] mb-3.5">{v.icon}</div>
                  <div className="font-semibold text-[15px] text-text mb-2">{v.title}</div>
                  <div className="text-[13px] text-muted leading-[1.65]">{v.desc}</div>
                </TiltCard>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>

      {/* Mission split */}
      <div className="py-[70px] px-[5%]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
              {t.kicker3}
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2 mb-4 leading-tight">
                {t.missionTitleLine1}
                <br />
                {t.missionTitleLine2Prefix} <span className="text-gold">{t.missionTitleHighlightWord}</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="gold-bar mb-5" />
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-muted text-[15px] leading-[1.8] mb-4">{t.missionParagraph1}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-muted text-[15px] leading-[1.8] mb-7">{t.missionParagraph2}</p>
            </Reveal>
            <Reveal delay={0.22}>
              <Link href="/contact">
                <Button variant="gold">{t.contactButton}</Button>
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="rounded-[20px] overflow-hidden border border-border relative h-[280px] lg:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=700&q=80"
              alt={t.missionTitleHighlightWord}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
