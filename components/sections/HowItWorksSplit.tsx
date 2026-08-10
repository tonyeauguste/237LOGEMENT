import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";

const STEPS = [
  {
    icon: "🔍",
    num: "ÉTAPE 01",
    title: "Recherchez et filtrez",
    desc: "Utilisez nos filtres avancés : ville, quartier, budget, type de location, nombre de chambres. Trouvez exactement ce que vous cherchez en quelques secondes.",
  },
  {
    icon: "📋",
    num: "ÉTAPE 02",
    title: "Comparez les annonces",
    desc: "Consultez les photos en haute définition, lisez les descriptions détaillées et vérifiez le profil du propriétaire avant tout contact.",
  },
  {
    icon: "💬",
    num: "ÉTAPE 03",
    title: "Contactez directement",
    desc: (
      <>
        Envoyez un message ou appelez le propriétaire directement. Aucun intermédiaire. 🔥{" "}
        <strong className="text-text">Promo Exceptionnelle : Publication Gratuite !</strong>{" "}
        Déposez vos annonces à 0 FCFA au lieu des frais d&apos;agence habituels. Visitez le bien
        et négociez librement.
      </>
    ),
  },
  {
    icon: "🏠",
    num: "ÉTAPE 04",
    title: "Emménagez !",
    desc: "Signez votre bail et emménagez dans votre nouveau foyer. Notre équipe reste disponible pour vous accompagner à chaque étape.",
  },
];

export default function HowItWorksSplit() {
  return (
    <section className="py-20 bg-bg2 border-y border-border">
      <div className="max-w-[1240px] mx-auto px-[5%] grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div>
          <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
            Processus simple
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2.5 leading-tight">
              Trouver votre logement
              <br />
              n&apos;a jamais été <span className="text-gold">aussi simple</span>
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
              <Button variant="gold">Explorer les annonces</Button>
            </Link>
            <Link href="/comment-ca-marche">
              <Button variant="outline">En savoir plus</Button>
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
