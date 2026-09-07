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
  icon: string;
  group: PropertyGroup;
  /** false = ce type de bien n'est proposé qu'à la location, jamais à la vente. */
  saleEligible: boolean;
}

/** Fonction de traduction générique — passer `useTranslations("PropertyKinds")` (ou "Transaction", etc.) côté client. */
type Translate = (key: string) => string;

// Chambre et Studio sont volontairement exclus de la vente : ce sont des
// logements meublés loués à la chambre/à l'unité, pas des biens qu'on cède.
// Le libellé affiché n'est plus ici (voir kindLabel ci-dessous) : il vit
// dans messages/fr.json et messages/en.json (namespace "PropertyKinds"),
// sous la même clé que `value` — ex. "chambre" -> "Chambre" / "Room".
export const PROPERTY_KINDS: PropertyKindDef[] = [
  { value: "chambre", icon: "🚪", group: "residentiel", saleEligible: false },
  { value: "studio", icon: "🛏", group: "residentiel", saleEligible: false },
  { value: "appartement", icon: "🏢", group: "residentiel", saleEligible: true },
  { value: "duplex", icon: "🏘", group: "residentiel", saleEligible: true },
  { value: "villa", icon: "🏡", group: "residentiel", saleEligible: true },
  { value: "maison", icon: "🏠", group: "residentiel", saleEligible: true },
  { value: "bureau", icon: "💼", group: "commercial", saleEligible: true },
  { value: "boutique", icon: "🏪", group: "commercial", saleEligible: true },
  { value: "magasin", icon: "📦", group: "commercial", saleEligible: true },
  { value: "terrain", icon: "🌍", group: "foncier", saleEligible: true },
];

/**
 * Libellé affichable d'un type de bien. `t` = `useTranslations("PropertyKinds")`
 * côté appelant ; retombe sur la valeur brute si la clé est introuvable
 * (comportement déjà géré par useTranslations lui-même).
 */
export function kindLabel(value: string, t: Translate): string {
  return t(value);
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
  /**
   * Clé de traduction du libellé du champ Surface (namespace "Transaction",
   * voir messages/fr.json et messages/en.json) — varie pour le foncier
   * (contenance). Appeler `t(rules.surfaceLabelKey)` côté composant.
   */
  surfaceLabelKey: "surfaceM2" | "surfaceFoncier";
  /** Affiche le sélecteur Longue/Courte durée — uniquement en location, résidentiel/commercial. */
  listingDuration: boolean;
}

export const FIELD_VISIBILITY_RULES: Record<TransactionType, Record<PropertyGroup, FieldVisibilityRule>> = {
  location: {
    residentiel: { rooms: true, baths: true, surfaceLabelKey: "surfaceM2", listingDuration: true },
    commercial: { rooms: false, baths: false, surfaceLabelKey: "surfaceM2", listingDuration: true },
    // Terrain en location = bail, sans durée courte/longue à proprement
    // parler (voir la note explicative affichée à la place dans le
    // formulaire) — surface devient "contenance".
    foncier: { rooms: false, baths: false, surfaceLabelKey: "surfaceFoncier", listingDuration: false },
  },
  vente: {
    // Une vente n'a pas de durée : listingDuration toujours false ici.
    residentiel: { rooms: true, baths: true, surfaceLabelKey: "surfaceM2", listingDuration: false },
    commercial: { rooms: false, baths: false, surfaceLabelKey: "surfaceM2", listingDuration: false },
    foncier: { rooms: false, baths: false, surfaceLabelKey: "surfaceFoncier", listingDuration: false },
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

/**
 * Résout les métadonnées d'affichage d'une annonce à partir de sa
 * transaction, sa durée (si location) et son groupe de type de bien.
 * Un terrain en location (bail) n'a pas de durée longue/courte : on lui
 * donne son propre badge plutôt que de retomber sur "Longue durée" par défaut.
 * `t` = `useTranslations("Transaction")` côté appelant.
 */
export function transactionMeta(
  transactionType: TransactionType,
  type: ListingKind | null,
  group: PropertyGroup,
  t: Translate
): TransactionMeta {
  if (transactionType === "vente") {
    return {
      badgeLabel: t("saleBadge"),
      tagColor: "blue",
      priceSuffix: "",
      priceFieldLabel: t("salePriceField"),
      shortLabel: t("saleShort"),
    };
  }
  if (group === "foncier") {
    return {
      badgeLabel: t("leaseBadge"),
      tagColor: "orange",
      priceSuffix: t("perMonth"),
      priceFieldLabel: t("leasePriceField"),
      shortLabel: t("leaseShort"),
    };
  }
  if (type === "courte") {
    return {
      badgeLabel: t("shortTermBadge"),
      tagColor: "gold",
      priceSuffix: t("perNight"),
      priceFieldLabel: t("shortTermPriceField"),
      shortLabel: t("shortTermShort"),
    };
  }
  return {
    badgeLabel: t("longTermBadge"),
    tagColor: "green",
    priceSuffix: t("perMonth"),
    priceFieldLabel: t("longTermPriceField"),
    shortLabel: t("longTermShort"),
  };
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
  /**
   * Clé de traduction (namespace "FaqItems", voir messages/fr.json et
   * messages/en.json) — la question et la réponse vivent dans les
   * dictionnaires, pas ici, pour pouvoir être traduites.
   */
  key: string;
}

export const FAQ_ITEMS: FaqItem[] = [
  { cat: "compte", key: "q1" },
  { cat: "locataire", key: "q2" },
  { cat: "proprietaire", key: "q3" },
  { cat: "locataire", key: "q4" },
  { cat: "securite", key: "q5" },
  { cat: "locataire", key: "q6" },
  { cat: "locataire", key: "q7" },
  { cat: "securite", key: "q8" },
  { cat: "proprietaire", key: "q9" },
  { cat: "compte", key: "q10" },
];

/**
 * Libellés des catégories — même principe que FAQ_ITEMS : la clé
 * correspond directement à la valeur, traduite via le namespace
 * "FaqCategories".
 */
export const FAQ_CATEGORIES: { value: FaqCategory | "all" }[] = [
  { value: "all" },
  { value: "locataire" },
  { value: "proprietaire" },
  { value: "compte" },
  { value: "securite" },
];

export const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%231C2E40'/%3E%3Ccircle cx='40' cy='30' r='16' fill='%23243548'/%3E%3Cellipse cx='40' cy='72' rx='26' ry='20' fill='%23243548'/%3E%3C/svg%3E";
