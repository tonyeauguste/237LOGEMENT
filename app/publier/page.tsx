"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Upload } from "lucide-react";
import StepIndicator from "@/components/publier/StepIndicator";
import RoleCard from "@/components/ui/RoleCard";
import AmenityChip from "@/components/ui/AmenityChip";
import CityInput from "@/components/ui/CityInput";
import Button from "@/components/ui/Button";
import {
  AMENITIES,
  amenityFull,
  DEFAULT_AVATAR,
  FIELD_VISIBILITY_RULES,
  isSaleEligible,
  kindLabel,
  PROPERTY_KINDS,
  propertyGroup,
  transactionMeta,
} from "@/lib/data";
import { useAuthGuard } from "@/lib/useAuthGuard";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { ListingKind, OccupancyStatus, TransactionType, UploadedPhoto, UploadedVideo } from "@/lib/types";

const PHOTO_MAX = 15;
const PHOTO_SIZE_MB = 10;
const VIDEO_MAX = 2;
const VIDEO_SIZE_MB = 100;

function PublierPageInner() {
  // Tout compte connecté peut publier depuis la fusion des espaces : les
  // objectifs choisis à l'inscription ne verrouillent plus rien (côté base,
  // la policy RLS d'insertion vérifie seulement owner_id = auth.uid()).
  const user = useAuthGuard();
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const searchParams = useSearchParams();

  // Présent uniquement quand on arrive depuis le bouton "Modifier" du
  // tableau de bord propriétaire (/publier?edit=123) — le même formulaire
  // sert alors à corriger une annonce existante plutôt qu'à en créer une
  // nouvelle : mêmes étapes, mais on pré-remplit les champs et on fait un
  // UPDATE (RLS "Owners can update their own properties") au lieu d'un
  // INSERT à l'étape finale.
  const editParam = searchParams.get("edit");
  const editId = editParam ? Number(editParam) : null;
  const isEditMode = editId !== null && Number.isFinite(editId);
  const [loadingExisting, setLoadingExisting] = useState(isEditMode);

  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);

  // Step 1
  const [city, setCity] = useState("");
  const [quartier, setQuartier] = useState("");
  const [address, setAddress] = useState("");
  const [precision, setPrecision] = useState("");

  // Step 2
  const [title, setTitle] = useState("");
  const [rooms, setRooms] = useState("1");
  const [baths, setBaths] = useState("1");
  const [surface, setSurface] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionType>("location");
  const [listingType, setListingType] = useState<ListingKind>("longue");
  const [kind, setKind] = useState("appartement");
  const [desc, setDesc] = useState("");
  // Statut d'occupation existant, conservé tel quel en mode édition (voir
  // le commentaire au-dessus de `occupancyStatus` dans le payload de
  // `publish`) — `null` pour une nouvelle annonce.
  const [initialOccupancyStatus, setInitialOccupancyStatus] = useState<OccupancyStatus | null>(null);

  // Groupe du type de bien sélectionné (résidentiel / commercial / foncier)
  // et champs à afficher pour cette combinaison transaction × groupe — voir
  // FIELD_VISIBILITY_RULES dans lib/data.ts, source unique du mapping.
  const group = propertyGroup(kind);
  const saleEligible = isSaleEligible(kind);
  const rules = FIELD_VISIBILITY_RULES[transactionType][group];

  // A.1 — Chambre et Studio n'autorisent que la Location : si l'utilisateur
  // avait choisi Vente puis bascule vers l'un de ces types, on repasse
  // automatiquement sur Location. Fait pendant le rendu (même pattern que
  // "prevUrlTab" dans app/connexion/page.tsx) plutôt que dans un effet,
  // pour éviter un rendu supplémentaire à chaque changement de catégorie.
  const [prevSaleEligible, setPrevSaleEligible] = useState(saleEligible);
  if (saleEligible !== prevSaleEligible) {
    setPrevSaleEligible(saleEligible);
    if (!saleEligible && transactionType === "vente") setTransactionType("location");
  }

  // Réinitialise Chambres/Salles de bain dès que la combinaison transaction
  // × groupe change (ex : Location+Appartement → Vente+Terrain) : sans ça,
  // des valeurs résiduelles d'un ancien choix pourraient être envoyées pour
  // un bien qui n'en a pas. La confirmation finale à la soumission (voir
  // `publish`) sert de filet de sécurité supplémentaire.
  const rulesKey = `${transactionType}:${group}`;
  const [prevRulesKey, setPrevRulesKey] = useState(rulesKey);
  if (rulesKey !== prevRulesKey) {
    setPrevRulesKey(rulesKey);
    if (!rules.rooms) setRooms("1");
    if (!rules.baths) setBaths("1");
  }

  // Réinitialise la durée (longue/courte) uniquement quand elle redevient
  // pertinente après avoir été masquée (ex : Vente → Location) — on ne
  // touche pas au choix de l'utilisateur tant qu'il reste visible (ex :
  // Villa → Bureau ne doit pas faire perdre un choix "Courte durée").
  const [prevListingDuration, setPrevListingDuration] = useState(rules.listingDuration);
  if (rules.listingDuration !== prevListingDuration) {
    setPrevListingDuration(rules.listingDuration);
    if (rules.listingDuration) setListingType("longue");
  }

  // Step 3
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [amenities, setAmenities] = useState<string[]>(
    AMENITIES.filter((a) => a.defaultSelected).map((a) => amenityFull(a))
  );
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  // Surbrillance pendant qu'un fichier est glissé au-dessus de la zone —
  // voir handlePhotoDrop/handleVideoDrop : le glisser-déposer annoncé par
  // le texte de la zone ("Glissez-déposez...") n'était pas implémenté du
  // tout, seul le clic ouvrant le sélecteur de fichiers fonctionnait.
  const [photoDragOver, setPhotoDragOver] = useState(false);
  const [videoDragOver, setVideoDragOver] = useState(false);

  // Step 4
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [charges, setCharges] = useState<"non" | "oui" | "partiel">("non");
  const [minDuration, setMinDuration] = useState("1 mois");

  const [publishing, setPublishing] = useState(false);

  // Les aperçus photo passent par URL.createObjectURL — sans révocation,
  // chaque photo ajoutée pendant la session laisse un blob en mémoire
  // jusqu'au rechargement de la page. On garde une ref à jour (l'effet de
  // nettoyage à deps [] ne verrait sinon que le tableau vide du montage).
  const photosRef = useRef<UploadedPhoto[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => {
      // Seuls les aperçus créés localement (blob:) doivent être révoqués —
      // les photos déjà en ligne (mode édition) sont de vraies URLs
      // Supabase Storage ; URL.revokeObjectURL() sur ces URLs-là ne ferait
      // rien de nuisible, mais autant ne l'appeler que là où c'est utile.
      photosRef.current.forEach((p) => {
        if (p.url.startsWith("blob:")) URL.revokeObjectURL(p.url);
      });
    };
  }, []);

  // Pré-remplissage du formulaire en mode édition : on va chercher
  // l'annonce existante et on vérifie côté client qu'elle appartient bien
  // à l'utilisateur connecté (la policy RLS "Owners can update their own
  // properties" l'empêcherait de toute façon à l'enregistrement, mais
  // autant ne pas le laisser remplir un formulaire pour rien).
  useEffect(() => {
    if (!isEditMode || !user) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("properties")
      .select("*")
      .eq("id", editId as number)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        // L'admin peut modifier n'importe quelle annonce (policy RLS
        // "Admins can update any property") — seul un propriétaire normal
        // est restreint à la sienne.
        const allowed = data && (data.owner_id === user.id || user.role === "admin");
        if (error || !data || !allowed) {
          showToast("⛔ Impossible de modifier cette annonce.", "error");
          router.replace("/compte");
          return;
        }
        setCity(data.city);
        setQuartier(data.quartier);
        setAddress(data.address || "");
        setPrecision(data.precision_desc || "");
        setTitle(data.title);
        setRooms(String(data.rooms));
        setBaths(String(data.baths));
        setSurface(data.surface != null ? String(data.surface) : "");
        setTransactionType((data.transaction_type as TransactionType) || "location");
        setListingType((data.type as ListingKind) || "longue");
        setInitialOccupancyStatus((data.occupancy_status as OccupancyStatus | null) ?? null);
        setKind(data.kind || "appartement");
        setDesc(data.description || "");
        setPhotos((data.images || []).map((url) => ({ name: url.split("/").pop() || "photo", url })));
        setVideos((data.videos || []).map((url) => ({ name: url.split("/").pop() || "vidéo", size: 0, url })));
        setAmenities(data.amenities || []);
        setPrice(data.price != null ? String(data.price) : "");
        setDeposit(data.deposit != null ? String(data.deposit) : "");
        setCharges((data.charges as "non" | "oui" | "partiel") || "non");
        setMinDuration(data.min_duration || "1 mois");
        setLoadingExisting(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, editId, user?.id]);

  // Voir le commentaire équivalent dans app/compte/proprietaire/page.tsx :
  // un message plutôt qu'un blanc total pendant la vérification de session.
  if (!user) {
    return (
      <div className="pt-[160px] pb-[100px] text-center text-muted text-sm">
        Chargement…
      </div>
    );
  }
  if (loadingExisting) {
    return <div className="pt-[160px] pb-[100px] text-center text-muted text-sm">Chargement de l&apos;annonce…</div>;
  }

  function removePhoto(index: number) {
    setPhotos((prev) => {
      const target = prev[index];
      if (target && target.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((_, idx) => idx !== index);
    });
  }

  function toggleAmenity(full: string) {
    setAmenities((prev) => (prev.includes(full) ? prev.filter((a) => a !== full) : [...prev, full]));
  }

  function handlePhotoUpload(files: FileList | File[] | null) {
    if (!files) return;
    const remaining = PHOTO_MAX - photos.length;
    if (remaining <= 0) {
      showToast("⚠️ Limite atteinte : 15 photos maximum.", "error");
      return;
    }
    const arr = Array.from(files);
    let error = "";
    const added: UploadedPhoto[] = [];
    arr.slice(0, remaining).forEach((file) => {
      if (file.size > PHOTO_SIZE_MB * 1024 * 1024) {
        error = `${file.name} dépasse 10 Mo`;
        return;
      }
      added.push({ name: file.name, url: URL.createObjectURL(file), file });
    });
    if (added.length) setPhotos((prev) => [...prev, ...added]);
    if (arr.length > remaining) {
      showToast(`⚠️ Seules les ${remaining} premières photos ont été ajoutées (limite : 15).`, "info");
    }
    if (error) showToast(`❌ ${error} — max 10 Mo par photo.`, "error");
  }

  function handleVideoUpload(files: FileList | File[] | null) {
    if (!files) return;
    const remaining = VIDEO_MAX - videos.length;
    if (remaining <= 0) {
      showToast("⚠️ Limite atteinte : 2 vidéos maximum.", "error");
      return;
    }
    const arr = Array.from(files);
    let error = "";
    const added: UploadedVideo[] = [];
    arr.slice(0, remaining).forEach((file) => {
      if (file.size > VIDEO_SIZE_MB * 1024 * 1024) {
        error = file.name;
        return;
      }
      added.push({ name: file.name, size: file.size, file });
    });
    if (added.length) setVideos((prev) => [...prev, ...added]);
    if (arr.length > remaining) {
      showToast(`⚠️ Seule(s) ${remaining} vidéo(s) supplémentaire(s) ont été ajoutée(s) (limite : 2).`, "info");
    }
    if (error) showToast(`❌ ${error} dépasse 100 Mo — vidéo refusée.`, "error");
  }

  // Glisser-déposer : contrairement au <input type="file" accept="…">, un
  // dépôt n'est pas filtré par le navigateur — on filtre donc nous-mêmes
  // par type MIME pour ne pas router une vidéo déposée sur la zone photo
  // (et inversement) vers le mauvais gestionnaire.
  function handlePhotoDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setPhotoDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    handlePhotoUpload(files);
  }

  function handleVideoDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setVideoDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("video/"));
    handleVideoUpload(files);
  }

  function goNext() {
    if (step === 1 && (!city || !quartier)) {
      showToast("⚠️ Veuillez renseigner la ville et le quartier.", "error");
      return;
    }
    if (step === 2 && !title) {
      showToast("⚠️ Veuillez donner un titre à votre annonce.", "error");
      return;
    }
    if (step === 3 && photos.length < 3) {
      showToast("📸 Ajoutez au minimum 3 photos pour continuer.", "error");
      return;
    }
    if (step < 5) {
      setDir(1);
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goPrev() {
    if (step === 1) {
      router.push("/compte");
      return;
    }
    setDir(-1);
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function publish() {
    setPublishing(true);
    const supabase = createClient();

    try {
      const slug = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const uploadOne = async (folder: "photos" | "videos", file: File, i: number) => {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${folder}/${slug}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(path, file, { contentType: file.type || undefined });
        if (uploadError) throw uploadError;
        return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
      };

      const imageUrls = await Promise.all(
        photos.map((p, i) => (p.file ? uploadOne("photos", p.file, i) : Promise.resolve(p.url)))
      );
      // Bug corrigé : une vidéo déjà en ligne (mode édition, pas de fichier
      // brut à ré-uploader) retombait sur "" au lieu de conserver son URL
      // existante — filtrée juste après par `.filter(Boolean)`, elle
      // disparaissait donc silencieusement de l'annonce à chaque
      // enregistrement. Même filet que pour les photos : `v.url` si connu.
      const videoUrls = await Promise.all(
        videos.map((v, i) => (v.file ? uploadOne("videos", v.file, i) : Promise.resolve(v.url ?? "")))
      );

      // Filet de sécurité : quel que soit l'état des champs masqués côté UI
      // (course entre effets lors d'un changement rapide de type de bien,
      // données pré-remplies en mode édition, etc.), on n'envoie jamais à
      // la base une valeur qui n'a pas de sens pour cette combinaison.
      const submittedTransaction: TransactionType = saleEligible && transactionType === "vente" ? "vente" : "location";
      const submittedType = rules.listingDuration
        ? listingType === "longue" || listingType === "courte"
          ? listingType
          : "longue"
        : null;
      // Le statut d'occupation ne se gère jamais depuis ce formulaire (voir
      // le tableau de bord propriétaire) — on ne fait ici que : (a) le
      // vider si la combinaison n'y donne plus droit (ex : bien repassé en
      // Vente), (b) l'initialiser à "disponible" quand il devient pertinent
      // pour la première fois. Dans tous les autres cas, on conserve la
      // valeur existante telle quelle pour ne jamais écraser un bien
      // marqué "occupé" par une simple modification du formulaire.
      const occupancyApplicable = submittedTransaction === "location" && submittedType !== null;
      const submittedOccupancy: OccupancyStatus | null = occupancyApplicable
        ? (initialOccupancyStatus ?? "disponible")
        : null;

      const payload = {
        title,
        // .trim() : la ville et le quartier sont saisis librement, un espace
        // parasite ferait échouer la correspondance avec les recherches.
        city: city.trim(),
        quartier: quartier.trim(),
        address: address || null,
        precision_desc: precision || null,
        description: desc,
        transaction_type: submittedTransaction,
        type: submittedType,
        kind,
        occupancy_status: submittedOccupancy,
        price: price ? Number(price) : 0,
        deposit: deposit ? Number(deposit) : null,
        charges,
        min_duration: minDuration,
        rooms: rules.rooms ? Number(rooms) : 0,
        baths: rules.baths ? Number(baths) : 0,
        surface: surface ? Number(surface) : null,
        images: imageUrls,
        videos: videoUrls.filter(Boolean),
        amenities,
      };

      if (isEditMode) {
        const { error: updateError } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editId as number);
        if (updateError) throw updateError;
        showToast("✅ Annonce mise à jour avec succès !", "success");
      } else {
        const { error: insertError } = await supabase.from("properties").insert({
          ...payload,
          owner_id: user?.id,
          owner_name: user?.name || "Propriétaire",
          owner_avatar: user?.avatar || DEFAULT_AVATAR,
          owner_phone: user?.phone || "",
        });
        if (insertError) throw insertError;
        showToast("🚀 Annonce publiée avec succès !", "success");
      }
      setTimeout(() => router.push("/compte"), 1500);
    } catch (err) {
      console.error(err);
      showToast(
        isEditMode
          ? "❌ Une erreur est survenue lors de la mise à jour. Réessayez."
          : "❌ Une erreur est survenue lors de la publication. Réessayez.",
        "error"
      );
      setPublishing(false);
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="pt-[90px] px-[5%] pb-[60px] max-w-[820px] mx-auto">
      <div className="mb-[30px]">
        <span className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">Propriétaire</span>
        <h1 className="font-display text-[clamp(22px,3vw,36px)] font-bold text-text mt-2.5 mb-1.5">
          {isEditMode ? "Modifier l'annonce" : "Publier une nouvelle annonce"}
        </h1>
        <p className="text-muted text-[15px]">
          {isEditMode
            ? "Corrigez les informations de votre bien ci-dessous, puis enregistrez."
            : "Remplissez les informations de votre bien en 5 étapes simples. Publication gratuite, sans commission."}
        </p>
      </div>

      <StepIndicator step={step} />

      <div className="bg-card border border-border rounded-[20px] p-5 sm:p-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={step}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {step === 1 && (
              <div>
                <StepTitle icon="📍" text="Localisation du bien" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <Field label="Ville *">
                    {/* Saisie libre : un propriétaire d'une localité absente
                        de nos suggestions doit pouvoir publier malgré tout. */}
                    <CityInput
                      placeholder="Saisir ou choisir une ville"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Field>
                  <Field label="Quartier *">
                    <input
                      className="form-control"
                      placeholder="Ex : Bastos, Bonapriso, Akwa…"
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Adresse précise">
                  <input
                    className="form-control"
                    placeholder="Rue, avenue, carrefour, point de repère…"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
                <Field label="Précision (description de l'emplacement)">
                  <textarea
                    className="form-control"
                    style={{ minHeight: 80 }}
                    placeholder="Décrivez l'accès : proche de quelle école, marché, axe principal, etc."
                    value={precision}
                    onChange={(e) => setPrecision(e.target.value)}
                  />
                </Field>
                <div className="px-4 py-3.5 bg-[rgba(61,153,112,.07)] border border-[rgba(61,153,112,.2)] rounded-[10px] text-[13px] text-green2 mt-3.5">
                  💡 Plus votre adresse est précise, plus les locataires potentiels vous trouveront
                  facilement. Un bon emplacement augmente de 40% les chances de location rapide.
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepTitle icon="🏠" text="Détails du bien" />
                <Field label="Titre de l'annonce *">
                  <input
                    className="form-control"
                    placeholder="Ex : Villa Contemporaine avec Piscine — Bastos"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field label="Type de bien *">
                  <select className="form-control" value={kind} onChange={(e) => setKind(e.target.value)}>
                    {PROPERTY_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.icon} {k.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {/* A.1 — Type de transaction : Vente n'est proposée que pour
                    les types de bien "saleEligible" (Chambre et Studio en
                    sont exclus, voir TYPES_ELIGIBLES_VENTE dans lib/data.ts).
                    L'option est retirée plutôt que désactivée pour ce type
                    de bien — plus net qu'une carte grisée. */}
                <div className="mb-4">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Type de transaction *</label>
                  <div className={`grid grid-cols-1 gap-3 mt-1.5 ${saleEligible ? "sm:grid-cols-2" : ""}`}>
                    <RoleCard
                      icon="🔑"
                      title="Location"
                      desc="Mettez votre bien en location, courte ou longue durée."
                      active={transactionType === "location"}
                      onClick={() => setTransactionType("location")}
                    />
                    {saleEligible && (
                      <RoleCard
                        icon="💰"
                        title="Vente"
                        desc="Cédez votre bien définitivement, en un seul paiement."
                        active={transactionType === "vente"}
                        onClick={() => setTransactionType("vente")}
                      />
                    )}
                  </div>
                  {!saleEligible && (
                    <p className="text-[11px] text-dim mt-1.5">
                      La vente n&apos;est pas proposée pour ce type de bien — {kindLabel(kind).toLowerCase()} se
                      loue uniquement.
                    </p>
                  )}
                </div>

                {/* Chambres / Salles de bain / Surface — les deux premiers
                    champs ne s'affichent que pour le groupe résidentiel
                    (voir FIELD_VISIBILITY_RULES) : ni un bureau, ni un
                    terrain n'ont de "chambres". */}
                <div
                  className={`grid grid-cols-1 gap-3.5 ${
                    rules.rooms || rules.baths ? "sm:grid-cols-3" : ""
                  }`}
                >
                  {rules.rooms && (
                    <Field label="Chambres *">
                      <select className="form-control" value={rooms} onChange={(e) => setRooms(e.target.value)}>
                        {["1", "2", "3", "4", "5", "6"].map((n) => (
                          <option key={n} value={n}>
                            {n === "6" ? "6+" : n}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  {rules.baths && (
                    <Field label="Salles de bain">
                      <select className="form-control" value={baths} onChange={(e) => setBaths(e.target.value)}>
                        {["1", "2", "3", "4"].map((n) => (
                          <option key={n} value={n}>
                            {n === "4" ? "4+" : n}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field label={rules.surfaceLabel}>
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Ex : 120"
                      value={surface}
                      onChange={(e) => setSurface(e.target.value)}
                    />
                  </Field>
                </div>

                {/* A.2 — Longue/Courte durée : uniquement en Location,
                    résidentiel ou commercial (rules.listingDuration). Un
                    terrain en location est proposé en bail — pas de durée
                    figée, on l'explique plutôt que d'inventer un champ. */}
                {rules.listingDuration ? (
                  <div className="mb-4">
                    <label className="block text-[13px] text-muted mb-[7px] font-medium">
                      {group === "commercial" ? "Type de location ou d'usage *" : "Type de location *"}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                      <RoleCard
                        icon="🏡"
                        title="Longue durée"
                        desc="Location mensuelle (maison, appartement, villa)"
                        active={listingType === "longue"}
                        onClick={() => setListingType("longue")}
                      />
                      <RoleCard
                        icon="🌴"
                        title="Courte durée"
                        desc="Location à la nuit ou à la semaine"
                        active={listingType === "courte"}
                        onClick={() => setListingType("courte")}
                      />
                    </div>
                  </div>
                ) : (
                  transactionType === "location" &&
                  group === "foncier" && (
                    <p className="text-[12px] text-muted -mt-1 mb-4">
                      📜 Terrain proposé en bail — durée et modalités à discuter directement avec le propriétaire.
                    </p>
                  )
                )}

                <Field label="Description détaillée *">
                  <textarea
                    className="form-control"
                    style={{ minHeight: 120 }}
                    placeholder="Décrivez votre bien : caractéristiques, environnement, points forts, règles de la maison…"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepTitle icon="📸" text="Photos & Vidéos du bien" />

                <div className="flex justify-between items-center mb-2.5">
                  <span className="font-semibold text-[15px] text-text">Photos du bien</span>
                  <span className="text-[13px] font-bold text-gold bg-gold3 border border-[rgba(200,155,60,.3)] px-3 py-0.5 rounded-full">
                    {photos.length} / {PHOTO_MAX}
                  </span>
                </div>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setPhotoDragOver(true);
                  }}
                  onDragLeave={() => setPhotoDragOver(false)}
                  onDrop={handlePhotoDrop}
                  className={`border-2 border-dashed rounded-2xl p-11 text-center cursor-pointer transition-colors mb-3 ${
                    photos.length >= PHOTO_MAX
                      ? "border-border opacity-50 pointer-events-none"
                      : photoDragOver
                        ? "border-gold bg-gold3/20"
                        : "border-border2 hover:border-gold hover:bg-gold3/20"
                  }`}
                >
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    // `hidden`/display:none : sur Safari iOS et certains
                    // navigateurs Android, le sélecteur système s'ouvre bien,
                    // mais l'événement onChange qui récupère les fichiers
                    // choisis ne se déclenche pas toujours de façon fiable
                    // pour un <input type="file"> qui n'est pas réellement
                    // rendu (display:none) — d'où le compteur bloqué à 0
                    // après sélection, uniquement sur mobile. `sr-only`
                    // garde l'élément techniquement dans le rendu (juste
                    // invisible et hors du flux visuel) sans ce problème.
                    className="sr-only"
                    onChange={(e) => {
                      handlePhotoUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <div className="flex justify-center mb-3 text-gold">
                    <Upload size={36} />
                  </div>
                  <div className="font-semibold text-base text-text mb-1.5">
                    Glissez-déposez vos photos ici
                  </div>
                  <div className="text-sm text-muted mb-2.5">
                    ou cliquez pour sélectionner depuis votre appareil
                  </div>
                  <div className="flex gap-2 flex-wrap justify-center mt-2.5">
                    <span className="tag-pill gold">JPG, PNG, WEBP</span>
                    <span className="tag-pill blue">Max 10 Mo / photo</span>
                    <span className="tag-pill green">15 photos maximum</span>
                    <span className="tag-pill neutral">Minimum 3 photos</span>
                  </div>
                </div>
                {photos.length > 0 && (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2.5 mb-2">
                    {photos.map((p, i) => (
                      <div
                        key={i}
                        className="relative rounded-[10px] overflow-hidden border-[1.5px] border-border aspect-[4/3] bg-card2"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removePhoto(i)}
                          className="absolute top-[5px] right-[5px] w-[22px] h-[22px] rounded-full bg-[rgba(224,85,85,.9)] text-white flex items-center justify-center leading-none"
                        >
                          ×
                        </button>
                        <span className="absolute bottom-[5px] left-[7px] text-[10px] font-bold text-white bg-black/55 px-1.5 rounded">
                          {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center mb-2.5 mt-7">
                  <span className="font-semibold text-[15px] text-text">
                    Vidéo de visite <span className="text-muted font-normal text-[13px]">(optionnel)</span>
                  </span>
                  <span className="text-[13px] font-bold text-gold bg-gold3 border border-[rgba(200,155,60,.3)] px-3 py-0.5 rounded-full">
                    {videos.length} / {VIDEO_MAX}
                  </span>
                </div>
                <div
                  onClick={() => videoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setVideoDragOver(true);
                  }}
                  onDragLeave={() => setVideoDragOver(false)}
                  onDrop={handleVideoDrop}
                  className={`border-2 border-dashed rounded-2xl py-7 px-11 text-center cursor-pointer transition-colors mb-3 ${
                    videos.length >= VIDEO_MAX
                      ? "border-border opacity-50 pointer-events-none"
                      : videoDragOver
                        ? "border-gold bg-gold3/20"
                        : "border-border2 hover:border-gold hover:bg-gold3/20"
                  }`}
                >
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
                    multiple
                    // Voir le commentaire équivalent sur l'input photo.
                    className="sr-only"
                    onChange={(e) => {
                      handleVideoUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <div className="text-[32px] mb-3">🎬</div>
                  <div className="font-semibold text-base text-text mb-1.5">Ajouter une vidéo de visite</div>
                  <div className="text-sm text-muted mb-2.5">Donnez une vue immersive de votre bien</div>
                  <div className="flex gap-2 flex-wrap justify-center mt-2.5">
                    <span className="tag-pill gold">MP4, MOV, AVI, WEBM</span>
                    <span className="tag-pill blue">Max 100 Mo / vidéo</span>
                    <span className="tag-pill green">2 vidéos maximum</span>
                  </div>
                </div>
                {videos.length > 0 && (
                  <div className="flex flex-col gap-2.5 mb-2">
                    {videos.map((v, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3.5 py-3 bg-card2 border-[1.5px] border-border rounded-[10px]"
                      >
                        <span className="text-[22px] shrink-0">🎬</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold text-text truncate">{v.name}</div>
                          <div className="text-[11px] text-muted mt-0.5">
                            {v.size > 0 ? `${(v.size / (1024 * 1024)).toFixed(1)} Mo · ` : ""}Vidéo {i + 1}
                          </div>
                        </div>
                        <button
                          onClick={() => setVideos((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-red text-lg leading-none shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-7">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">Équipements disponibles</label>
                  <p className="text-xs text-muted mb-2.5">
                    Sélectionnez tous les équipements présents dans votre bien.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((a) => {
                      const full = amenityFull(a);
                      return (
                        <AmenityChip
                          key={a.label}
                          icon={a.icon}
                          label={a.label}
                          selected={amenities.includes(full)}
                          onClick={() => toggleAmenity(full)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepTitle icon="💰" text="Tarification" />
                <Field label={transactionMeta(transactionType, rules.listingDuration ? listingType : null, group).priceFieldLabel}>
                  <input
                    className="form-control !text-xl !font-semibold !px-[18px] !py-[14px]"
                    type="number"
                    placeholder="Ex : 150 000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Field>
                <p className="text-xs text-muted -mt-2 mb-4">
                  💡 Prix moyen pour ce type de bien dans votre quartier : 150 000 – 400 000 FCFA/mois
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <Field label="Caution (FCFA)">
                    <input
                      className="form-control"
                      type="number"
                      placeholder="Ex : 2 mois de loyer"
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </Field>
                  <Field label="Charges incluses ?">
                    <select
                      className="form-control"
                      value={charges}
                      onChange={(e) => setCharges(e.target.value as typeof charges)}
                    >
                      <option value="non">Non</option>
                      <option value="oui">Oui</option>
                      <option value="partiel">Partiellement</option>
                    </select>
                  </Field>
                </div>
                <Field label="Durée minimale de location">
                  <select className="form-control" value={minDuration} onChange={(e) => setMinDuration(e.target.value)}>
                    <option>1 mois</option>
                    <option>3 mois</option>
                    <option>6 mois</option>
                    <option>1 an</option>
                  </select>
                </Field>
                <div className="px-4 py-3.5 bg-[rgba(61,153,112,.07)] border border-[rgba(61,153,112,.2)] rounded-[10px] text-[13px] text-green2">
                  ✅ Publication gratuite · Aucune commission sur les loyers · Modification de
                  l&apos;annonce gratuite à tout moment
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div className="text-center mb-7">
                  <div className="text-[52px] mb-3.5">🏠</div>
                  <h3 className="font-display text-2xl font-bold text-text mb-2">
                    {isEditMode ? "Vos modifications sont prêtes !" : "Votre annonce est prête !"}
                  </h3>
                  <p className="text-muted text-[15px] max-w-[380px] mx-auto">
                    {isEditMode
                      ? "Vérifiez les informations ci-dessous avant d'enregistrer."
                      : "Vérifiez les informations ci-dessous avant de publier. Notre équipe validera votre annonce dans les 24h."}
                  </p>
                </div>
                <div className="bg-bg3 rounded-2xl p-5 border border-border">
                  <PreviewRow k="Titre" v={title || "—"} />
                  <PreviewRow k="Type de bien" v={kindLabel(kind)} />
                  <PreviewRow k="Ville" v={city || "—"} />
                  <PreviewRow k="Quartier" v={quartier || "—"} />
                  <PreviewRow k="Transaction" v={transactionType === "vente" ? "Vente" : "Location"} />
                  {rules.listingDuration && (
                    <PreviewRow
                      k="Durée"
                      v={listingType === "courte" ? "Court séjour (nuit)" : "Longue durée (mois)"}
                    />
                  )}
                  {rules.rooms && <PreviewRow k="Chambres" v={`${rooms} chambre(s)`} />}
                  <PreviewRow
                    k={group === "foncier" ? "Contenance" : "Surface"}
                    v={surface ? `${surface} m²` : "—"}
                  />
                  <PreviewRow k="Photos" v={`${photos.length} photo${photos.length > 1 ? "s" : ""}`} />
                  <PreviewRow
                    k="Vidéos"
                    v={videos.length > 0 ? `${videos.length} vidéo${videos.length > 1 ? "s" : ""}` : "Aucune vidéo"}
                  />
                  <PreviewRow
                    k="Prix"
                    v={price ? `${parseInt(price, 10).toLocaleString("fr-FR")} FCFA` : "—"}
                    gold
                    last
                  />
                </div>
                <Button variant="gold" full size="lg" loading={publishing} onClick={publish} className="mt-6">
                  {isEditMode ? "💾 Enregistrer les modifications" : "🚀 Publier l'annonce"}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-7 pt-6 border-t border-border">
          <Button variant="ghost" onClick={goPrev}>
            ← {step === 1 ? "Annuler" : "Précédent"}
          </Button>
          {step < 5 && (
            <Button variant="gold" onClick={goNext}>
              Continuer →
            </Button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .tag-pill {
          font-size: 11px;
          padding: 3px 11px;
          border-radius: 20px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        .tag-pill.gold {
          background: var(--gold3);
          color: var(--gold);
          border: 1px solid rgba(200, 155, 60, 0.28);
        }
        .tag-pill.green {
          background: rgba(61, 153, 112, 0.1);
          color: #4fc38a;
          border: 1px solid rgba(61, 153, 112, 0.28);
        }
        .tag-pill.blue {
          background: rgba(99, 179, 237, 0.1);
          color: var(--blue);
          border: 1px solid rgba(99, 179, 237, 0.28);
        }
        .tag-pill.neutral {
          background: var(--card2);
          color: var(--muted);
          border: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}

export default function PublierPage() {
  return (
    <Suspense fallback={null}>
      <PublierPageInner />
    </Suspense>
  );
}

function StepTitle({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="font-semibold text-lg text-text mb-[22px] flex items-center gap-2.5">
      <span className="text-2xl">{icon}</span> {text}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] text-muted mb-[7px] font-medium">{label}</label>
      {children}
    </div>
  );
}

function PreviewRow({ k, v, gold, last }: { k: string; v: string; gold?: boolean; last?: boolean }) {
  return (
    <div className={`flex justify-between py-2.5 text-sm ${last ? "" : "border-b border-border"}`}>
      <span className="text-muted text-xs uppercase tracking-wide">{k}</span>
      <span className={`font-medium ${gold ? "text-gold font-bold" : "text-text"}`}>{v}</span>
    </div>
  );
}
