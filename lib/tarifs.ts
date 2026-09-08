// Source unique pour la page /tarifs — montants, volumes et état de la
// promo de lancement. Rien de tarifaire ne doit être écrit en dur dans le
// JSX de app/[lang]/tarifs/page.tsx ou de components/tarifs/PricingCard.tsx :
// tout part d'ici, pour rester réutilisable plus tard par le futur système
// de notification de bascule (voir le prompt "page-tarifs", section
// "Pour plus tard").

/**
 * true tant que la période de lancement est en cours : toutes les formules
 * sont affichées gratuites (prix normal barré + "0 FCFA"). Passer à false
 * fait revenir la page en tarification normale (voir PricingCard) — bascule
 * manuelle décidée par l'équipe, jamais automatique/programmée.
 */
export const PROMO_LANCEMENT_ACTIVE = true;

export type Periodicite = "unique" | "mois";

export interface FormuleTarif {
  id: "annonce-simple" | "particulier" | "agent" | "agence";
  nom: string;
  volume: string;
  /** Prix normal en FCFA, hors promo. */
  prixNormal: number;
  periodicite: Periodicite;
  /** Fonctionnalités incluses, propres à cette formule (pas de comparaison inter-formules). */
  features: string[];
  /** Particulier uniquement — liseré doré + étiquette "Le plus choisi". */
  populaire?: boolean;
}

export const GRILLE_TARIFAIRE: FormuleTarif[] = [
  {
    id: "annonce-simple",
    nom: "Annonce simple",
    volume: "1 bien, 30 jours",
    prixNormal: 500,
    periodicite: "unique",
    features: ["1 annonce visible 30 jours", "Contact WhatsApp direct"],
  },
  {
    id: "particulier",
    nom: "Particulier",
    volume: "10 biens",
    prixNormal: 3000,
    periodicite: "mois",
    features: ["Jusqu'à 10 annonces", "Contact WhatsApp direct", "Tableau de bord"],
    populaire: true,
  },
  {
    id: "agent",
    nom: "Agent indépendant",
    volume: "25 biens",
    prixNormal: 7500,
    periodicite: "mois",
    features: [
      "Jusqu'à 25 annonces",
      "Badge « Vérifié »",
      "Page profil publique",
      "3 remontées en tête de liste par mois",
      "Tableau de bord",
    ],
  },
  {
    id: "agence",
    nom: "Agence",
    volume: "Annonces illimitées",
    prixNormal: 25000,
    periodicite: "mois",
    features: [
      "Annonces illimitées",
      "Badge « Vérifié »",
      "Page profil publique",
      "Logo affiché sur les annonces",
      "Remontées automatiques en tête de liste",
      "Support prioritaire",
    ],
  },
];
