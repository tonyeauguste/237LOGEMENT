import ComingSoon from "@/components/ui/ComingSoon";
import { Reveal } from "@/components/ui/Reveal";

export default function FeaturedSection() {
  return (
    <section className="py-20">
      <div className="max-w-[1240px] mx-auto px-[5%]">
        <div className="text-center mb-11">
          <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
            Annonces à la une
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2.5 leading-tight">
              Propriétés <span className="text-gold">bientôt disponibles</span>
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <div className="gold-bar mt-3 mx-auto" />
          </Reveal>
        </div>
        <div className="flex justify-center mt-9">
          <ComingSoon
            title="Annonces bientôt disponibles"
            text={
              <>
                Nous préparons une sélection de biens vérifiés à travers tout le Cameroun.
                <br />
                Revenez très bientôt — la plateforme sera opérationnelle d&apos;ici quelques
                jours.
              </>
            }
          />
        </div>
      </div>
    </section>
  );
}
