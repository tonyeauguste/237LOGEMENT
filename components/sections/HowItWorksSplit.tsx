"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { useTranslations } from "@/i18n/IntlProvider";

export default function HowItWorksSplit() {
  const t = useTranslations("Home.howItWorks");
  const STEPS = [
    { icon: "🔍", num: t("step1Num"), title: t("step1Title"), desc: t("step1Desc") },
    { icon: "📋", num: t("step2Num"), title: t("step2Title"), desc: t("step2Desc") },
    {
      icon: "💬",
      num: t("step3Num"),
      title: t("step3Title"),
      desc: (
        <>
          {t("step3DescPart1")} <strong className="text-text">{t("step3DescStrong")}</strong>{" "}
          {t("step3DescPart2")}
        </>
      ),
    },
    { icon: "🏠", num: t("step4Num"), title: t("step4Title"), desc: t("step4Desc") },
  ];
  return (
    <section className="py-20 bg-bg2 border-y border-border">
      <div className="max-w-[1240px] mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div>
          <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
            {t("kicker")}
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2.5 leading-tight">
              {t("titleLine1")}
              <br />
              {t("titleLine2")} <span className="text-gold">{t("titleHighlight")}</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="gold-bar mt-3 mb-5" />
          </Reveal>
          <Stagger className="flex flex-col gap-7 mt-7">
            {STEPS.map((s) => (
              <StaggerItem key={s.num} className="flex gap-5 items-start">
                <div className="w-[52px] h-[52px] rounded-2xl bg-gold3 border border-[rgba(200,155,60,.25)] flex items-center justify-center text-[22px] shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="text-[11px] text-gold font-bold tracking-[1px] mb-1">
                    {s.num}
                  </div>
                  <div className="text-base font-semibold text-text mb-1">{s.title}</div>
                  <div className="text-sm text-muted leading-[1.65]">{s.desc}</div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link href="/recherche">
              <Button variant="gold">{t("exploreButton")}</Button>
            </Link>
            <Link href="/comment-ca-marche">
              <Button variant="outline">{t("learnMoreButton")}</Button>
            </Link>
          </div>
        </div>
        <Reveal delay={0.15} className="rounded-[20px] overflow-hidden border border-border shadow-[0_24px_64px_rgba(0,0,0,.4)] relative h-[320px] md:h-[480px]">
          <Image
            src="https://images.unsplash.com/photo-1560472355-536de3962603?w=700&q=80"
            alt="Maison au Cameroun"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
