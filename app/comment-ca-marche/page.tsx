import Link from "next/link";
import Image from "next/image";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export const metadata = {
  title: "Comment ça marche – Immo237",
  description:
    "Immo237 simplifie la location immobilière au Cameroun. Que vous soyez locataire ou propriétaire, découvrez comment profiter de notre plateforme.",
};

const STEPS = [
  {
    num: "01",
    label: "Locataires",
    title: "Recherchez et filtrez avec précision",
    text: "Notre moteur de recherche avancé vous permet de filtrer par ville, quartier, type de location (courte ou longue durée), budget, nombre de chambres et équipements. Affinez votre recherche jusqu'à trouver exactement ce dont vous avez besoin. Visualisez simultanément les résultats sur la carte interactive du Cameroun.",
    img: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=700&q=80",
    alt: "Recherche de logement",
    reverse: false,
  },
  {
    num: "02",
    label: "Locataires",
    title: "Explorez chaque annonce en détail",
    text: "Chaque annonce dispose d'une galerie photos haute définition, d'une description complète, d'un inventaire des équipements, d'une localisation sur carte et du profil vérifié du propriétaire avec ses avis. Sauvegardez vos préférées dans vos favoris pour les comparer tranquillement.",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80",
    alt: "Détail annonce",
    reverse: true,
  },
  {
    num: "03",
    label: "Locataires & Propriétaires",
    title: "Contactez directement, sans intermédiaire",
    text: "Envoyez un message ou appelez directement le propriétaire depuis la fiche de l'annonce. Pas de frais d'agence, pas d'intermédiaire caché. Les propriétaires reçoivent vos demandes dans leur tableau de bord et peuvent vous répondre rapidement. La négociation se fait entre vous, librement.",
    img: "https://images.unsplash.com/photo-1560472355-536de3962603?w=700&q=80",
    alt: "Contact direct",
    reverse: false,
  },
  {
    num: "04",
    label: "Propriétaires",
    title: "Gérez vos annonces comme un pro",
    text: "Les propriétaires disposent d'un tableau de bord complet : publication en 5 étapes, gestion des annonces, suivi des statistiques (vues, contacts, favoris), messagerie intégrée. Modifiez ou supprimez vos annonces à tout moment. Recevez des alertes à chaque nouveau message ou intérêt.",
    img: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=700&q=80",
    alt: "Tableau de bord propriétaire",
    reverse: true,
  },
];

const ROLES = [
  {
    icon: "🏠",
    title: "Compte Visiteur",
    sub: "Pour les personnes qui cherchent un logement à louer",
    highlight: false,
    features: [
      "Recherche avancée par ville, quartier, prix et type",
      "Consultation des photos et descriptions détaillées",
      "Sauvegarde de favoris personnalisés",
      "Contact direct avec les propriétaires",
      "Alertes email pour les nouvelles annonces",
      "Historique des recherches récentes",
    ],
  },
  {
    icon: "🔑",
    title: "Compte Propriétaire",
    sub: "Pour les propriétaires souhaitant louer leur bien",
    highlight: true,
    features: [
      "Publication gratuite et illimitée d'annonces",
      "Gestion complète des annonces (modifier, supprimer)",
      "Tableau de bord avec statistiques détaillées",
      "Messagerie intégrée avec les locataires",
      "Badge propriétaire vérifié",
      "Notifications en temps réel",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      <div className="bg-gradient-to-br from-bg to-bg2 px-[5%] pt-20 pb-[60px] text-center border-b border-border">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          Guide d&apos;utilisation
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display text-[clamp(28px,4vw,52px)] font-bold text-text mt-2.5">
            Comment <span className="text-gold">ça marche</span> ?
          </h1>
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-base mt-3.5 mb-7 max-w-[560px] mx-auto">
            Immo237 simplifie la location immobilière au Cameroun. Que vous soyez locataire ou
            propriétaire, voici comment profiter de notre plateforme.
          </p>
        </Reveal>
        <Reveal delay={0.2} className="flex gap-3.5 justify-center flex-wrap">
          <Link href="/recherche">
            <Button variant="gold" size="lg">Trouver un logement</Button>
          </Link>
          <Link href="/connexion?tab=register">
            <Button variant="outline" size="lg">Publier mon bien</Button>
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
            Deux types de comptes
          </span>
          <h2 className="font-display text-[clamp(24px,3vw,40px)] font-bold text-text mt-2">
            Choisissez votre <span className="text-gold">profil</span>
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
            <Button variant="gold" size="lg">Créer mon compte gratuitement</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
