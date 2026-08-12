import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";
import TiltCard from "@/components/ui/TiltCard";

export const metadata = {
  title: "À propos – 237Logement",
  description:
    "237Logement est né d'un constat simple : trouver un logement fiable au Cameroun était un véritable parcours du combattant. Découvrez notre mission.",
};

const NUMBERS = [
  { val: "45+", label: "Villes couvertes" },
  { val: "10", label: "Régions du Cameroun" },
  { val: "0 FCFA", label: "Frais d'agence" },
  { val: "24h", label: "Validation des annonces" },
];

const VALUES = [
  {
    icon: "🛡",
    title: "Confiance",
    desc: "Tous nos propriétaires sont vérifiés. Chaque annonce est contrôlée avant publication pour garantir l'authenticité des informations.",
  },
  {
    icon: "🌍",
    title: "Accessibilité",
    desc: "Nous croyons que chaque Camerounais mérite un logement décent. Notre plateforme est gratuite pour les locataires et accessible partout au Cameroun.",
  },
  {
    icon: "💡",
    title: "Transparence",
    desc: "Aucun frais caché, aucune commission surprise. Les prix affichés sont exacts et les contacts se font directement entre les parties.",
  },
  {
    icon: "🚀",
    title: "Innovation",
    desc: "Nous investissons constamment dans la technologie pour offrir la meilleure expérience : recherche intelligente, carte interactive, notifications en temps réel.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-bg to-bg2 border-b border-border px-[5%] pt-20 pb-[60px]">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 items-center">
          <div>
            <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
              Notre histoire
            </Reveal>
            <Reveal delay={0.06}>
              <h1 className="font-display text-[clamp(26px,3.5vw,48px)] font-bold text-text mt-2.5 leading-tight">
                Nous simplifions la location
                <br />
                immobilière au <span className="text-gold">Cameroun</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="gold-bar mt-3 mb-5" />
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-muted text-[15px] leading-[1.8] mb-4">
                237Logement est né d&apos;un constat simple : trouver un logement fiable au Cameroun
                était un véritable parcours du combattant. Arnaques, intermédiaires abusifs,
                annonces obsolètes... Des millions de Camerounais perdaient du temps et de
                l&apos;argent dans cette jungle immobilière.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-muted text-[15px] leading-[1.8] mb-7">
                Notre mission : créer la première plateforme immobilière de confiance au Cameroun,
                où locataires et propriétaires peuvent se rencontrer directement, en toute
                transparence et sans frais excessifs.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <Link href="/recherche">
                <Button variant="gold">Trouver un logement</Button>
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="hidden lg:block rounded-[20px] overflow-hidden border border-border relative h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1560472355-536de3962603?w=700&q=80"
              alt="Notre mission"
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
              Ce qui nous guide
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2">
                Nos <span className="text-gold">valeurs fondamentales</span>
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
              Notre engagement
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2 mb-4 leading-tight">
                Construire l&apos;avenir de
                <br />
                l&apos;immobilier <span className="text-gold">camerounais</span>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="gold-bar mb-5" />
            </Reveal>
            <Reveal delay={0.14}>
              <p className="text-muted text-[15px] leading-[1.8] mb-4">
                Nous travaillons en étroite collaboration avec les autorités locales et les
                associations de propriétaires pour améliorer le marché locatif camerounais et le
                rendre plus équitable pour tous.
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="text-muted text-[15px] leading-[1.8] mb-7">
                Notre objectif pour 2026 : couvrir toutes les 10 régions du Cameroun et devenir la
                référence incontournable de l&apos;immobilier en Afrique centrale.
              </p>
            </Reveal>
            <Reveal delay={0.22}>
              <Link href="/contact">
                <Button variant="gold">Nous contacter</Button>
              </Link>
            </Reveal>
          </div>
          <Reveal delay={0.16} className="rounded-[20px] overflow-hidden border border-border relative h-[280px] lg:h-[420px]">
            <Image
              src="https://images.unsplash.com/photo-1544427920-c49ccfb85579?w=700&q=80"
              alt="Cameroun"
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
