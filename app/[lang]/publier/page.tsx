"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import StepIndicator from "@/components/publier/StepIndicator";
import PhotoUploader from "@/components/publier/PhotoUploader";
import RoleCard from "@/components/ui/RoleCard";
import AmenityChip from "@/components/ui/AmenityChip";
import CityInput from "@/components/ui/CityInput";
import Button from "@/components/ui/Button";
import {
  AMENITIES,
  amenityLabel,
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
import type { ListingKind, OccupancyStatus, TransactionType, UploadedPhoto } from "@/lib/types";
import { useTranslations } from "@/i18n/IntlProvider";

function PublierPageInner() {
  const tKind = useTranslations("PropertyKinds");
  const tTx = useTranslations("Transaction");
  const tAmenities = useTranslations("Amenities");
  const t = useTranslations("Publish");
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
  // Toute la logique d'upload (validation, glisser-déposer, aperçus,
  // suppression) vit dans <PhotoUploader> (components/publier/) — la page
  // ne garde que l'état lui-même, dont publish() et goNext() ont besoin.
  // Pas de vidéo : le site ne gère que les photos.
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [amenities, setAmenities] = useState<string[]>(
    AMENITIES.filter((a) => a.defaultSelected).map((a) => a.value)
  );

  // Step 4
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [charges, setCharges] = useState<"non" | "oui" | "partiel">("non");
  const [minDuration, setMinDuration] = useState("1 mois");

  const [publishing, setPublishing] = useState(false);

  // Les aperçus photo (voir PhotoUploader) passent par URL.createObjectURL
  // — sans révocation, chaque photo ajoutée pendant la session laisse un
  // blob en mémoire jusqu'au rechargement de la page. Ce nettoyage final
  // vit ici (page) et pas dans <PhotoUploader> : ce composant est
  // masqué/affiché au fil des étapes du formulaire sans que ça signifie
  // que l'utilisateur abandonne — seul le démontage de la PAGE (vraie
  // sortie de /publier) doit déclencher la révocation. Ref à jour car
  // l'effet de nettoyage à deps [] ne verrait sinon que le tableau vide
  // du montage.
  const photosRef = useRef<UploadedPhoto[]>([]);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => {
      // Seules les photos déjà en ligne (mode édition) sont de vraies URLs
      // Supabase Storage ; URL.revokeObjectURL() dessus ne ferait rien de
      // nuisible, mais autant ne l'appeler que là où c'est utile — seuls
      // les aperçus créés localement (blob:) doivent être révoqués.
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
          showToast(t("toastCannotEdit"), "error");
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
        {t("loading")}
      </div>
    );
  }
  if (loadingExisting) {
    return <div className="pt-[160px] pb-[100px] text-center text-muted text-sm">{t("loadingListing")}</div>;
  }

  function toggleAmenity(value: string) {
    setAmenities((prev) => (prev.includes(value) ? prev.filter((a) => a !== value) : [...prev, value]));
  }

  function goNext() {
    if (step === 1 && (!city || !quartier)) {
      showToast(t("toastFillLocation"), "error");
      return;
    }
    if (step === 2 && !title) {
      showToast(t("toastFillTitle"), "error");
      return;
    }
    if (step === 3 && photos.length < 3) {
      showToast(t("toastMinPhotos"), "error");
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

      const uploadOne = async (file: File, i: number) => {
        const ext = file.name.split(".").pop() || "bin";
        const path = `photos/${slug}-${i}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("property-media")
          .upload(path, file, { contentType: file.type || undefined });
        if (uploadError) throw uploadError;
        return supabase.storage.from("property-media").getPublicUrl(path).data.publicUrl;
      };

      const imageUrls = await Promise.all(
        photos.map((p, i) => (p.file ? uploadOne(p.file, i) : Promise.resolve(p.url)))
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
        amenities,
      };

      if (isEditMode) {
        const { error: updateError } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", editId as number);
        if (updateError) throw updateError;
        showToast(t("toastUpdateSuccess"), "success");
      } else {
        const { error: insertError } = await supabase.from("properties").insert({
          ...payload,
          owner_id: user?.id,
          owner_name: user?.name || "Propriétaire",
          owner_avatar: user?.avatar || DEFAULT_AVATAR,
          owner_phone: user?.phone || "",
        });
        if (insertError) throw insertError;
        showToast(t("toastPublishSuccess"), "success");
      }
      setTimeout(() => router.push("/compte"), 1500);
    } catch (err) {
      console.error(err);
      showToast(isEditMode ? t("toastUpdateError") : t("toastPublishError"), "error");
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
        <span className="text-[11px] tracking-[3px] uppercase text-gold font-semibold">{t("kicker")}</span>
        <h1 className="font-display text-[clamp(22px,3vw,36px)] font-bold text-text mt-2.5 mb-1.5">
          {isEditMode ? t("editTitle") : t("newTitle")}
        </h1>
        <p className="text-muted text-[15px]">
          {isEditMode ? t("editSubtitle") : t("newSubtitle")}
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
                <StepTitle icon="📍" text={t("step1Title")} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <Field label={t("cityLabel")}>
                    {/* Saisie libre : un propriétaire d'une localité absente
                        de nos suggestions doit pouvoir publier malgré tout. */}
                    <CityInput
                      placeholder={t("cityPlaceholder")}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </Field>
                  <Field label={t("quartierLabel")}>
                    <input
                      className="form-control"
                      placeholder={t("quartierPlaceholder")}
                      value={quartier}
                      onChange={(e) => setQuartier(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label={t("addressLabel")}>
                  <input
                    className="form-control"
                    placeholder={t("addressPlaceholder")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
                <Field label={t("precisionLabel")}>
                  <textarea
                    className="form-control"
                    style={{ minHeight: 80 }}
                    placeholder={t("precisionPlaceholder")}
                    value={precision}
                    onChange={(e) => setPrecision(e.target.value)}
                  />
                </Field>
                <div className="px-4 py-3.5 bg-[rgba(61,153,112,.07)] border border-[rgba(61,153,112,.2)] rounded-[10px] text-[13px] text-green2 mt-3.5">
                  {t("locationTip")}
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepTitle icon="🏠" text={t("step2Title")} />
                <Field label={t("titleLabel")}>
                  <input
                    className="form-control"
                    placeholder={t("titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </Field>
                <Field label={t("kindLabel")}>
                  <select className="form-control" value={kind} onChange={(e) => setKind(e.target.value)}>
                    {PROPERTY_KINDS.map((k) => (
                      <option key={k.value} value={k.value}>
                        {k.icon} {kindLabel(k.value, tKind)}
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
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("transactionTypeLabel")}</label>
                  <div className={`grid grid-cols-1 gap-3 mt-1.5 ${saleEligible ? "sm:grid-cols-2" : ""}`}>
                    <RoleCard
                      icon="🔑"
                      title={t("rentalTitle")}
                      desc={t("rentalDesc")}
                      active={transactionType === "location"}
                      onClick={() => setTransactionType("location")}
                    />
                    {saleEligible && (
                      <RoleCard
                        icon="💰"
                        title={t("saleTitle")}
                        desc={t("saleDesc")}
                        active={transactionType === "vente"}
                        onClick={() => setTransactionType("vente")}
                      />
                    )}
                  </div>
                  {!saleEligible && (
                    <p className="text-[11px] text-dim mt-1.5">
                      {t("saleNotEligible", { kind: kindLabel(kind, tKind).toLowerCase() })}
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
                    <Field label={t("roomsLabel")}>
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
                    <Field label={t("bathsLabel")}>
                      <select className="form-control" value={baths} onChange={(e) => setBaths(e.target.value)}>
                        {["1", "2", "3", "4"].map((n) => (
                          <option key={n} value={n}>
                            {n === "4" ? "4+" : n}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}
                  <Field label={tTx(rules.surfaceLabelKey)}>
                    <input
                      className="form-control"
                      type="number"
                      placeholder={t("surfacePlaceholder")}
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
                      {group === "commercial" ? t("rentalOrUseTypeLabel") : t("rentalTypeLabel")}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1.5">
                      <RoleCard
                        icon="🏡"
                        title={t("longTermTitle")}
                        desc={t("longTermDesc")}
                        active={listingType === "longue"}
                        onClick={() => setListingType("longue")}
                      />
                      <RoleCard
                        icon="🌴"
                        title={t("shortTermTitle")}
                        desc={t("shortTermDesc")}
                        active={listingType === "courte"}
                        onClick={() => setListingType("courte")}
                      />
                    </div>
                  </div>
                ) : (
                  transactionType === "location" &&
                  group === "foncier" && (
                    <p className="text-[12px] text-muted -mt-1 mb-4">{t("landLeaseNote")}</p>
                  )
                )}

                <Field label={t("descriptionLabel")}>
                  <textarea
                    className="form-control"
                    style={{ minHeight: 120 }}
                    placeholder={t("descriptionPlaceholder")}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepTitle icon="📸" text={t("step3Title")} />

                <PhotoUploader photos={photos} onPhotosChange={setPhotos} />

                <div className="mt-7">
                  <label className="block text-[13px] text-muted mb-[7px] font-medium">{t("amenitiesLabel")}</label>
                  <p className="text-xs text-muted mb-2.5">{t("amenitiesHint")}</p>
                  <div className="flex flex-wrap gap-2">
                    {AMENITIES.map((a) => {
                      return (
                        <AmenityChip
                          key={a.value}
                          icon={a.icon}
                          label={amenityLabel(a.value, tAmenities)}
                          selected={amenities.includes(a.value)}
                          onClick={() => toggleAmenity(a.value)}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepTitle icon="💰" text={t("step4Title")} />
                <Field label={transactionMeta(transactionType, rules.listingDuration ? listingType : null, group, tTx).priceFieldLabel}>
                  <input
                    className="form-control !text-xl !font-semibold !px-[18px] !py-[14px]"
                    type="number"
                    placeholder={t("pricePlaceholder")}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </Field>
                <p className="text-xs text-muted -mt-2 mb-4">{t("priceTip")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <Field label={t("depositLabel")}>
                    <input
                      className="form-control"
                      type="number"
                      placeholder={t("depositPlaceholder")}
                      value={deposit}
                      onChange={(e) => setDeposit(e.target.value)}
                    />
                  </Field>
                  <Field label={t("chargesLabel")}>
                    <select
                      className="form-control"
                      value={charges}
                      onChange={(e) => setCharges(e.target.value as typeof charges)}
                    >
                      <option value="non">{t("chargesNo")}</option>
                      <option value="oui">{t("chargesYes")}</option>
                      <option value="partiel">{t("chargesPartial")}</option>
                    </select>
                  </Field>
                </div>
                <Field label={t("minDurationLabel")}>
                  <select className="form-control" value={minDuration} onChange={(e) => setMinDuration(e.target.value)}>
                    <option>{t("duration1Month")}</option>
                    <option>{t("duration3Months")}</option>
                    <option>{t("duration6Months")}</option>
                    <option>{t("duration1Year")}</option>
                  </select>
                </Field>
                <div className="px-4 py-3.5 bg-[rgba(61,153,112,.07)] border border-[rgba(61,153,112,.2)] rounded-[10px] text-[13px] text-green2">
                  {t("pricingTip")}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <div className="text-center mb-7">
                  <div className="text-[52px] mb-3.5">🏠</div>
                  <h3 className="font-display text-2xl font-bold text-text mb-2">
                    {isEditMode ? t("editReadyTitle") : t("newReadyTitle")}
                  </h3>
                  <p className="text-muted text-[15px] max-w-[380px] mx-auto">
                    {isEditMode ? t("editReadySubtitle") : t("newReadySubtitle")}
                  </p>
                </div>
                <div className="bg-bg3 rounded-2xl p-5 border border-border">
                  <PreviewRow k={t("previewTitle")} v={title || t("emptyValue")} />
                  <PreviewRow k={t("previewKind")} v={kindLabel(kind, tKind)} />
                  <PreviewRow k={t("previewCity")} v={city || t("emptyValue")} />
                  <PreviewRow k={t("previewQuartier")} v={quartier || t("emptyValue")} />
                  <PreviewRow
                    k={t("previewTransaction")}
                    v={transactionType === "vente" ? t("previewSale") : t("previewRental")}
                  />
                  {rules.listingDuration && (
                    <PreviewRow
                      k={t("previewDuration")}
                      v={listingType === "courte" ? t("previewShortStay") : t("previewLongTerm")}
                    />
                  )}
                  {rules.rooms && <PreviewRow k={t("previewRooms")} v={t("previewRoomsValue", { n: rooms })} />}
                  <PreviewRow
                    k={group === "foncier" ? t("previewSurfaceArea") : t("previewSurface")}
                    v={surface ? `${surface} m²` : t("emptyValue")}
                  />
                  <PreviewRow k={t("previewPhotos")} v={`${photos.length} photo${photos.length > 1 ? "s" : ""}`} />
                  <PreviewRow
                    k={t("previewPrice")}
                    v={price ? `${parseInt(price, 10).toLocaleString("fr-FR")} FCFA` : t("emptyValue")}
                    gold
                    last
                  />
                </div>
                <Button variant="gold" full size="lg" loading={publishing} onClick={publish} className="mt-6">
                  {isEditMode ? t("saveChangesButton") : t("publishButton")}
                </Button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-7 pt-6 border-t border-border">
          <Button variant="ghost" onClick={goPrev}>
            ← {step === 1 ? t("cancelButton") : t("previousButton")}
          </Button>
          {step < 5 && (
            <Button variant="gold" onClick={goNext}>
              {t("continueButton")}
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
