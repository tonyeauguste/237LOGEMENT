import type { ListingKind, Property, TransactionType } from "./types";

// ═══════════════════════════════════════════════
// VILLES PAR RÉGION — source unique, utilisée dans
// tous les selects (hero, recherche, publication, paramètres)
// ═══════════════════════════════════════════════
export const CITIES_BY_REGION: Record<string, string[]> = {
  Centre: [
    "Yaoundé",
    "Mbalmayo",
    "Obala",
    "Bafia",
    "Mfou",
    "Sa'a",
    "Nanga Eboko",
    "Akonolinga",
    "Ayos",
    "Minta",
    "Ndikinimeki",
    "Eseka",
  ],
  Littoral: ["Douala", "Edéa", "Nkongsamba", "Loum", "Mbanga", "Melong"],
  Ouest: [
    "Bafoussam",
    "Dschang",
    "Mbouda",
    "Bafang",
    "Foumban",
    "Foumbot",
    "Bangangté",
  ],
  "Nord-Ouest": ["Bamenda", "Wum", "Nkambe", "Kumbo", "Fundong", "Mbengwi", "Bali"],
  "Sud-Ouest": [
    "Buea",
    "Limbe",
    "Kumba",
    "Mamfe",
    "Mundemba",
    "Tiko",
    "Mutengene",
    "Muyuka",
  ],
  Sud: ["Ebolowa", "Kribi", "Sangmélima", "Ambam"],
  Est: ["Bertoua", "Batouri", "Yokadouma", "Abong-Mbang", "Garoua Boulaï", "Lomié"],
  Adamaoua: ["Ngaoundéré", "Tibati", "Meiganga", "Banyo", "Tignère"],
  Nord: ["Garoua", "Guider", "Figuil", "Poli", "Lagdo", "Tchollire", "Rey Bouba"],
  "Extrême-Nord": ["Maroua", "Kousséri", "Mora", "Yagoua", "Kaélé"],
};

export const ALL_CITIES: string[] = Object.values(CITIES_BY_REGION).flat();

// ═══════════════════════════════════════════════
// QUARTIERS (page recherche)
// ═══════════════════════════════════════════════
export const QUARTIERS = [
  "Bastos",
  "Bonapriso",
  "Bonanjo",
  "Nlongkak",
  "Mvan",
  "Banengo",
  "Akwa",
];

// ═══════════════════════════════════════════════
// COORDONNÉES — source unique, utilisée par la page Contact, le pied de
// page et la FAQ. Ces informations étaient auparavant recopiées à quatre
// endroits, ce qui les faisait diverger à chaque changement.
// ═══════════════════════════════════════════════
export const CONTACT = {
  email: "237logement@gmail.com",
  /** Affichage lisible, espacé. */
  phone: "+237 681 240 210",
  /** Même numéro sans espaces, pour les liens tel: et WhatsApp. */
  phoneRaw: "+237681240210",
  whatsapp: "237681240210",
  /** Version courte, pour le pied de page et les listes. */
  hoursShort: "Lun – Ven, 9h00 – 17h00",
  /** Version détaillée, pour la page Contact. */
  hoursLong: "Lundi – Vendredi : 9h00 – 17h00",
  addressLine1: "Quartier Ebomé, Avant l'hôpital",
  addressLine2: "Kribi, Sud, Cameroun",
} as const;

// ═══════════════════════════════════════════════
// TYPES DE BIEN — nature du logement, à ne pas confondre avec la durée
// de location ("longue"/"courte"). Source unique utilisée par le filtre
// de la page d'accueil, celui de la recherche et le formulaire /publier.
// ═══════════════════════════════════════════════
/**
 * Groupe auquel appartient un type de bien — détermine quels champs du
 * formulaire /publier ont du sens (ex : une salle de bain n'existe pas
 * pour un terrain). Voir FIELD_VISIBILITY_RULES ci-dessous.
 */
export type PropertyGroup = "residentiel" | "commercial" | "foncier";

export interface PropertyKindDef {
  value: string;
  label: string;
  icon: string;
  group: PropertyGroup;
  /** false = ce type de bien n'est proposé qu'à la location, jamais à la vente. */
  saleEligible: boolean;
}

// Chambre et Studio sont volontairement exclus de la vente : ce sont des
// logements meublés loués à la chambre/à l'unité, pas des biens qu'on cède.
export const PROPERTY_KINDS: PropertyKindDef[] = [
  { value: "chambre", label: "Chambre", icon: "🚪", group: "residentiel", saleEligible: false },
  { value: "studio", label: "Studio", icon: "🛏", group: "residentiel", saleEligible: false },
  { value: "appartement", label: "Appartement", icon: "🏢", group: "residentiel", saleEligible: true },
  { value: "duplex", label: "Duplex", icon: "🏘", group: "residentiel", saleEligible: true },
  { value: "villa", label: "Villa", icon: "🏡", group: "residentiel", saleEligible: true },
  { value: "maison", label: "Maison", icon: "🏠", group: "residentiel", saleEligible: true },
  { value: "bureau", label: "Bureau", icon: "💼", group: "commercial", saleEligible: true },
  { value: "boutique", label: "Boutique / Local commercial", icon: "🏪", group: "commercial", saleEligible: true },
  { value: "magasin", label: "Magasin / Entrepôt", icon: "📦", group: "commercial", saleEligible: true },
  { value: "terrain", label: "Terrain", icon: "🌍", group: "foncier", saleEligible: true },
];

/** Libellé affichable d'un type de bien (retombe sur la valeur brute si inconnue). */
export function kindLabel(value: string): string {
  return PROPERTY_KINDS.find((k) => k.value === value)?.label ?? value;
}

/** Groupe d'un type de bien (retombe sur "residentiel" si la valeur est inconnue). */
export function propertyGroup(kind: string): PropertyGroup {
  return PROPERTY_KINDS.find((k) => k.value === kind)?.group ?? "residentiel";
}

/** La vente est-elle proposée pour ce type de bien ? (false pour Chambre/Studio). */
export function isSaleEligible(kind: string): boolean {
  return PROPERTY_KINDS.find((k) => k.value === kind)?.saleEligible ?? true;
}

/**
 * Règles de visibilité des champs de l'étape "Détails du bien" du
 * formulaire /publier, selon le type de transaction (Vente/Location) ET le
 * groupe du type de bien sélectionné. Centralise le mapping à un seul
 * endroit : pour ajouter un nouveau type de bien, il suffit de le rattacher
 * à l'un des 3 groupes dans PROPERTY_KINDS ci-dessus, sans toucher au JSX
 * du formulaire ni des cartes d'annonce.
 */
export interface FieldVisibilityRule {
  /** Champ "Chambres" pertinent pour cette combinaison. */
  rooms: boolean;
  /** Champ "Salles de bain" pertinent pour cette combinaison. */
  baths: boolean;
  /** Libellé du champ Surface — varie pour le foncier (contenance). */
  surfaceLabel: string;
  /** Affiche le sélecteur Longue/Courte durée — uniquement en location, résidentiel/commercial. */
  listingDuration: boolean;
}

export const FIELD_VISIBILITY_RULES: Record<TransactionType, Record<PropertyGroup, FieldVisibilityRule>> = {
  location: {
    residentiel: { rooms: true, baths: true, surfaceLabel: "Surface (m²)", listingDuration: true },
    commercial: { rooms: false, baths: false, surfaceLabel: "Surface (m²)", listingDuration: true },
    // Terrain en location = bail, sans durée courte/longue à proprement
    // parler (voir la note explicative affichée à la place dans le
    // formulaire) — surface devient "contenance".
    foncier: { rooms: false, baths: false, surfaceLabel: "Surface / Contenance (m² ou Hectares)", listingDuration: false },
  },
  vente: {
    // Une vente n'a pas de durée : listingDuration toujours false ici.
    residentiel: { rooms: true, baths: true, surfaceLabel: "Surface (m²)", listingDuration: false },
    commercial: { rooms: false, baths: false, surfaceLabel: "Surface (m²)", listingDuration: false },
    foncier: { rooms: false, baths: false, surfaceLabel: "Surface / Contenance (m² ou Hectares)", listingDuration: false },
  },
};

/**
 * Métadonnées d'affichage d'une combinaison transaction/durée — un seul
 * endroit pour le badge (icône, couleur), le suffixe de prix et les
 * libellés utilisés dans le formulaire /publier et sur les cartes/fiches
 * d'annonce. Évite de dupliquer un `type === "courte" ? … : …` dans
 * chaque composant.
 */
export interface TransactionMeta {
  /** Texte + emoji du badge affiché sur les cartes/fiches d'annonce. */
  badgeLabel: string;
  /** Couleur du badge — mirroir du type TagColor de components/ui/Tag. */
  tagColor: "gold" | "green" | "blue" | "red" | "orange" | "neutral";
  /** Suffixe affiché après le prix (ex : "/mois") — vide pour une vente (montant global, non récurrent). */
  priceSuffix: string;
  /** Libellé du champ prix à l'étape Tarification du formulaire /publier. */
  priceFieldLabel: string;
  /** Libellé compact (fil d'ariane, encart prix de la fiche annonce). */
  shortLabel: string;
}

const SALE_META: TransactionMeta = {
  badgeLabel: "💰 À vendre",
  tagColor: "blue",
  priceSuffix: "",
  priceFieldLabel: "Prix de vente (FCFA) *",
  shortLabel: "Vente",
};
const LONG_TERM_META: TransactionMeta = {
  badgeLabel: "🏡 Long terme",
  tagColor: "green",
  priceSuffix: "/mois",
  priceFieldLabel: "Prix mensuel (FCFA) *",
  shortLabel: "Location",
};
const SHORT_TERM_META: TransactionMeta = {
  badgeLabel: "🌴 Court séjour",
  tagColor: "gold",
  priceSuffix: "/nuit",
  priceFieldLabel: "Prix par nuit (FCFA) *",
  shortLabel: "Court séjour",
};
const LEASE_META: TransactionMeta = {
  badgeLabel: "📜 Bail",
  tagColor: "orange",
  priceSuffix: "/mois",
  priceFieldLabel: "Loyer de bail (FCFA) *",
  shortLabel: "Bail",
};

/**
 * Résout les métadonnées d'affichage d'une annonce à partir de sa
 * transaction, sa durée (si location) et son groupe de type de bien.
 * Un terrain en location (bail) n'a pas de durée longue/courte : on lui
 * donne son propre badge plutôt que de retomber sur "Longue durée" par défaut.
 */
export function transactionMeta(
  transactionType: TransactionType,
  type: ListingKind | null,
  group: PropertyGroup
): TransactionMeta {
  if (transactionType === "vente") return SALE_META;
  if (group === "foncier") return LEASE_META;
  return type === "courte" ? SHORT_TERM_META : LONG_TERM_META;
}

// ═══════════════════════════════════════════════
// ÉQUIPEMENTS — chips sélectionnables
// ═══════════════════════════════════════════════
export interface AmenityDef {
  label: string;
  icon: string;
  defaultSelected: boolean;
}

export const AMENITIES: AmenityDef[] = [
  { label: "Piscine", icon: "🏊", defaultSelected: false },
  { label: "Jardin", icon: "🌿", defaultSelected: true },
  { label: "Garage", icon: "🚗", defaultSelected: true },
  { label: "Groupe électrogène", icon: "⚡", defaultSelected: true },
  { label: "Gardiennage 24h", icon: "🛡", defaultSelected: true },
  { label: "Cuisine équipée", icon: "🍳", defaultSelected: true },
  { label: "Climatisation", icon: "❄️", defaultSelected: true },
  { label: "Eau courante", icon: "💧", defaultSelected: true },
  { label: "WiFi fibre", icon: "📶", defaultSelected: true },
  { label: "Meublé", icon: "🛋", defaultSelected: false },
  { label: "Ascenseur", icon: "🏗", defaultSelected: false },
  { label: "Balcon/Terrasse", icon: "🌅", defaultSelected: false },
  { label: "Parking", icon: "🅿️", defaultSelected: false },
  { label: "Chauffe-eau", icon: "🔥", defaultSelected: false },
];

export function amenityFull(a: AmenityDef) {
  return `${a.icon} ${a.label}`;
}

// ═══════════════════════════════════════════════
// PROPRIÉTÉS — plateforme en pré-lancement.
// Volontairement vide : les blocs "coming soon" sont
// affichés partout tant qu'aucune annonce n'est publiée.
// ═══════════════════════════════════════════════
export const PROPERTIES: Property[] = [];

// ═══════════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════════
export type FaqCategory = "locataire" | "proprietaire" | "compte" | "securite";

export interface FaqItem {
  cat: FaqCategory;
  q: string;
  a: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  {
    cat: "compte",
    q: "La création d'un compte est-elle gratuite sur 237Logement ?",
    a: "Oui, la création d'un compte est entièrement gratuite, que vous soyez locataire ou propriétaire. Les locataires accèdent à toutes les fonctionnalités (recherche, favoris, alertes, contact des propriétaires) sans aucun frais. Les propriétaires peuvent publier leurs annonces et gérer leurs biens sans commission ni abonnement obligatoire.",
  },
  {
    cat: "locataire",
    q: "Comment rechercher un logement adapté à mes besoins ?",
    a: "Utilisez la barre de recherche principale et nos filtres avancés : sélectionnez votre ville (Yaoundé, Douala, Bafoussam…), votre quartier, le type de location (courte ou longue durée), votre budget maximum et le nombre de chambres souhaité. Chaque fiche logement affiche ensuite sa localisation précise pour identifier les biens dans votre zone préférée.",
  },
  {
    cat: "proprietaire",
    q: "Comment publier une annonce pour mon bien ?",
    a: "C'est simple ! Créez un compte Propriétaire, puis cliquez sur \"Publier une annonce\". Notre formulaire en 5 étapes vous guide : localisation, détails du bien (chambres, surface, équipements), photos, tarification et aperçu final. Votre annonce est vérifiée par notre équipe dans les 24 heures, puis publiée automatiquement. Vous pouvez modifier ou supprimer votre annonce à tout moment depuis votre tableau de bord.",
  },
  {
    cat: "locataire",
    q: "Y a-t-il des frais d'agence à payer ?",
    a: "Non, 237Logement ne prélève aucun frais d'agence sur les transactions entre locataires et propriétaires. Notre modèle est basé sur la mise en relation directe et transparente. Vous négociez directement avec le propriétaire les conditions de location : loyer, caution, charges, durée. Aucun intermédiaire ne se glisse entre vous.",
  },
  {
    cat: "securite",
    q: "Comment sont vérifiés les propriétaires sur la plateforme ?",
    a: "Notre équipe vérifie l'identité de chaque propriétaire avant de lui attribuer le badge \"Vérifié\" : vérification de la pièce d'identité nationale, confirmation du numéro de téléphone et validation de la propriété du bien (titre foncier ou contrat de bail). Les propriétaires vérifiés affichent un badge doré sur leurs annonces. Nous vous recommandons de privilégier ces annonces pour plus de sécurité.",
  },
  {
    cat: "locataire",
    q: "Puis-je louer un logement pour une courte durée (week-end, vacances) ?",
    a: "Absolument ! 237Logement propose deux types de location : la longue durée (location mensuelle classique) et la courte durée (à la nuit ou à la semaine). Utilisez le filtre \"Type de location\" dans la recherche pour n'afficher que les offres de court séjour. Ces logements sont souvent meublés et équipés, idéaux pour les voyageurs d'affaires ou les vacanciers.",
  },
  {
    cat: "locataire",
    q: "Comment sauvegarder des annonces qui m'intéressent ?",
    a: "Cliquez sur le cœur ❤️ présent sur chaque annonce (dans les résultats de recherche ou sur la fiche détaillée) pour l'ajouter à vos favoris. Vos favoris sont accessibles dans votre espace visiteur, dans la section \"Mes favoris\". Vous devez être connecté pour sauvegarder des annonces. Vos favoris sont conservés indéfiniment jusqu'à ce que vous les supprimiez vous-même.",
  },
  {
    cat: "securite",
    q: "Comment signaler une annonce frauduleuse ou suspecte ?",
    a: "Si vous suspectez une annonce frauduleuse (demande de virement avant visite, prix anormalement bas, photos qui semblent copiées d'un autre site…), contactez notre équipe via le formulaire de la page \"Contact\" (objet \"Signaler une fraude\") ou par téléphone/WhatsApp. Nous traitons chaque signalement sous 24h et supprimons immédiatement les annonces frauduleuses confirmées. Ne versez jamais d'argent sans avoir visité physiquement le logement.",
  },
  {
    cat: "proprietaire",
    q: "Combien d'annonces puis-je publier en tant que propriétaire ?",
    a: "Il n'y a pas de limite au nombre d'annonces que vous pouvez publier. Que vous ayez un appartement ou un portefeuille de plusieurs dizaines de biens, notre tableau de bord propriétaire s'adapte à vos besoins. Vous gérez toutes vos annonces depuis un espace unique, avec statistiques et messagerie centralisés.",
  },
  {
    cat: "compte",
    q: "Comment modifier ou supprimer mon compte ?",
    a: "Vous pouvez modifier vos informations personnelles depuis les \"Paramètres\" de votre tableau de bord. Pour supprimer définitivement votre compte, contactez notre support via la page \"Contact\" (ou par téléphone/WhatsApp) avec votre adresse email d'inscription. La suppression est traitée sous 72 heures et entraîne la suppression de toutes vos données et annonces.",
  },
];

export const FAQ_CATEGORIES: { value: FaqCategory | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "locataire", label: "Locataires" },
  { value: "proprietaire", label: "Propriétaires" },
  { value: "compte", label: "Comptes" },
  { value: "securite", label: "Sécurité" },
];

export const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%231C2E40'/%3E%3Ccircle cx='40' cy='30' r='16' fill='%23243548'/%3E%3Cellipse cx='40' cy='72' rx='26' ry='20' fill='%23243548'/%3E%3C/svg%3E";
