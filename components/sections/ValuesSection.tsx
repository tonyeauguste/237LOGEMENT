import CameroonFlag from "@/components/ui/CameroonFlag";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";

const VALUES = [
  {
    icon: "🛡",
    title: "Propriétaires vérifiés",
    desc: "Chaque propriétaire est contrôlé avant publication. Zéro arnaque, zéro intermédiaire abusif.",
  },
  {
    icon: "💰",
    title: "Zéro frais d'agence",
    desc: "Contact direct entre locataire et propriétaire. Aucune commission, aucun frais cachés.",
  },
  {
    icon: "flag",
    title: "100 % Camerounais",
    desc: "Conçu pour les Camerounais, par des Camerounais. Yaoundé, Douala, Bafoussam et bien plus.",
  },
];

export default function ValuesSection() {
  return (
    <section className="py-20">
      <div className="max-w-[1240px] mx-auto px-[5%]">
        <div className="text-center mb-11">
          <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
            Communauté
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2.5 leading-tight">
              Soyez parmi les <span className="text-gold">premiers</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="gold-bar mt-3 mx-auto" />
          </Reveal>
          <Reveal delay={0.16}>
            <p className="text-muted text-[15px] mt-3 max-w-[520px] mx-auto">
              237Logement sera bientôt opérationnel. Inscrivez-vous maintenant pour accéder en
              avant-première à toutes les annonces dès le lancement.
            </p>
          </Reveal>
        </div>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-9">
          {VALUES.map((v) => (
            <StaggerItem key={v.title}>
              <TiltCard className="bg-card border border-border rounded-2xl px-5 py-6 text-center h-full [transform-style:preserve-3d]" strength={6}>
                <div className="text-[32px] mb-3.5 flex justify-center">
                  {v.icon === "flag" ? <CameroonFlag width={36} height={26} /> : v.icon}
                </div>
                <div className="font-semibold text-[15px] text-text mb-2">{v.title}</div>
                <div className="text-[13px] text-muted leading-[1.65]">{v.desc}</div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
