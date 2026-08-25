"use client";

// ═══════════════════════════════════════════════
// PhotoUploader — zone d'ajout de photos du formulaire /publier, pensée
// pour marcher de façon identique sur ordinateur, tablette et smartphone
// (Android comme iOS). Le site ne gère volontairement que les photos, pas
// de vidéo.
//
// Points clés :
// - Déclenchement du sélecteur de fichiers via un vrai <label htmlFor=...>
//   natif plutôt qu'un <div onClick={() => inputRef.click()}> : un clic JS
//   simulé sur un input caché est connu pour être moins fiable sur certains
//   navigateurs Android (le sélecteur système s'ouvre, mais la sélection
//   ne remonte pas toujours) — <label> fonctionne nativement au clic ET au
//   tap, sans indirection JS.
// - `accept="image/*"` (large) + revalidation JS tolérante : certains
//   Android renvoient un type MIME non standard ("image/jpg") ou aucun
//   type du tout — on se rabat alors sur l'extension du fichier plutôt
//   que de rejeter une photo valide à tort.
// - Aperçus via URL.createObjectURL, révoqués individuellement à la
//   suppression ET tous ensemble au démontage de la page (voir le
//   commentaire dans app/publier/page.tsx) — évite d'accumuler des blobs
//   en mémoire, sensible sur les téléphones d'entrée de gamme.
// - Grille à seuils explicites (2 colonnes mobile → 5+ desktop) et boutons
//   de suppression à zone tactile ≥44×44px.
// ═══════════════════════════════════════════════

import { useState, type Dispatch, type SetStateAction } from "react";
import { Upload, X } from "lucide-react";
import { useAppStore } from "@/lib/store";
import type { UploadedPhoto } from "@/lib/types";

const PHOTO_MAX = 15;
const PHOTO_SIZE_MB = 10;

interface PhotoUploaderProps {
  photos: UploadedPhoto[];
  onPhotosChange: Dispatch<SetStateAction<UploadedPhoto[]>>;
}

export default function PhotoUploader({ photos, onPhotosChange }: PhotoUploaderProps) {
  const showToast = useAppStore((s) => s.showToast);
  const [photoDragOver, setPhotoDragOver] = useState(false);

  // Pas de nettoyage "au démontage" ici volontairement : ce composant peut
  // être masqué/affiché au fil des étapes du formulaire sans que ça
  // signifie que l'utilisateur abandonne — le revoke final de tous les
  // blobs restants incombe à la page parente (voir app/publier/page.tsx),
  // qui elle sait quand l'utilisateur quitte vraiment /publier. Ici, on ne
  // révoque qu'au moment précis d'une suppression individuelle.
  function removePhoto(index: number) {
    onPhotosChange((prev) => {
      const target = prev[index];
      if (target && target.url.startsWith("blob:")) URL.revokeObjectURL(target.url);
      return prev.filter((_, idx) => idx !== index);
    });
  }

  // `accept="image/*"` sur l'input laisse passer plus de fichiers au niveau
  // du sélecteur système que ce qu'on supporte réellement — voulu, car
  // certains Android renvoient un type MIME non standard ("image/jpg" au
  // lieu de "image/jpeg") qu'un accept strict aurait pu filtrer à tort. On
  // revalide donc ici, en étant tolérant : si le type MIME est absent
  // (arrive aussi sur certains Android selon la source du fichier), on
  // retombe sur l'extension plutôt que de rejeter la photo.
  function isSupportedPhoto(file: File): boolean {
    const type = file.type.toLowerCase();
    if (["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(type)) return true;
    if (type) return false;
    const ext = file.name.split(".").pop()?.toLowerCase();
    return ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp";
  }

  function handlePhotoUpload(fileList: FileList | File[] | null) {
    const filesArray = Array.from(fileList || []);
    if (filesArray.length === 0) return;
    const remaining = PHOTO_MAX - photos.length;
    if (remaining <= 0) {
      showToast("⚠️ Limite atteinte : 15 photos maximum.", "error");
      return;
    }
    let error = "";
    let unsupported = 0;
    const added: UploadedPhoto[] = [];
    filesArray.slice(0, remaining).forEach((file) => {
      if (!isSupportedPhoto(file)) {
        unsupported += 1;
        return;
      }
      if (file.size > PHOTO_SIZE_MB * 1024 * 1024) {
        error = `${file.name} dépasse 10 Mo`;
        return;
      }
      added.push({ name: file.name, url: URL.createObjectURL(file), file });
    });
    if (added.length) onPhotosChange((prev) => [...prev, ...added]);
    if (filesArray.length > remaining) {
      showToast(`⚠️ Seules les ${remaining} premières photos ont été ajoutées (limite : 15).`, "info");
    }
    if (error) showToast(`❌ ${error} — max 10 Mo par photo.`, "error");
    if (unsupported > 0) {
      showToast(`❌ ${unsupported} fichier(s) ignoré(s) — formats acceptés : JPG, PNG, WEBP.`, "error");
    }
  }

  // Glisser-déposer (ordinateur) : contrairement à l'input, un dépôt n'est
  // pas filtré par `accept` — pas besoin de pré-filtrer ici, la validation
  // ci-dessus (isSupportedPhoto) s'en charge, y compris le cas d'un type
  // MIME vide.
  function handlePhotoDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setPhotoDragOver(false);
    handlePhotoUpload(Array.from(e.dataTransfer.files));
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2.5">
        <span className="font-semibold text-[15px] text-text">Photos du bien</span>
        <span className="text-[13px] font-bold text-gold bg-gold3 border border-[rgba(200,155,60,.3)] px-3 py-0.5 rounded-full">
          {photos.length} / {PHOTO_MAX}
        </span>
      </div>
      <label
        htmlFor="photo-upload-input"
        onDragOver={(e) => {
          e.preventDefault();
          setPhotoDragOver(true);
        }}
        onDragLeave={() => setPhotoDragOver(false)}
        onDrop={handlePhotoDrop}
        className={`block border-2 border-dashed rounded-2xl p-11 text-center cursor-pointer transition-colors mb-3 ${
          photos.length >= PHOTO_MAX
            ? "border-border opacity-50 pointer-events-none"
            : photoDragOver
              ? "border-gold bg-gold3/20"
              : "border-border2 hover:border-gold hover:bg-gold3/20"
        }`}
      >
        <input
          id="photo-upload-input"
          type="file"
          accept="image/*"
          multiple
          // `hidden`/display:none : sur Safari iOS et certains navigateurs
          // Android, un input file non réellement rendu peut ne pas
          // déclencher onChange de façon fiable après sélection. `sr-only`
          // le garde dans le rendu (juste invisible) sans ce problème.
          className="sr-only"
          onChange={(e) => {
            handlePhotoUpload(e.target.files);
            e.target.value = "";
          }}
        />
        <div className="flex justify-center mb-3 text-gold">
          <Upload size={36} />
        </div>
        <div className="font-semibold text-base text-text mb-1.5">Glissez-déposez vos photos ici</div>
        <div className="text-sm text-muted mb-2.5">ou touchez/cliquez pour sélectionner depuis votre appareil</div>
        <div className="flex gap-2 flex-wrap justify-center mt-2.5">
          <span className="tag-pill gold">JPG, PNG, WEBP</span>
          <span className="tag-pill blue">Max 10 Mo / photo</span>
          <span className="tag-pill green">15 photos maximum</span>
          <span className="tag-pill neutral">Minimum 3 photos</span>
        </div>
      </label>
      {photos.length > 0 && (
        // Seuils explicites plutôt qu'un auto-fill : 2 colonnes sur mobile,
        // 3 dès 640px, 4 dès 768px (tablette), 5 dès 1024px (desktop).
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-2">
          {photos.map((p, i) => (
            <div
              key={i}
              className="relative rounded-[10px] overflow-hidden border-[1.5px] border-border aspect-[4/3] bg-card2"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(i)}
                aria-label={`Supprimer la photo ${i + 1}`}
                // w-11 h-11 = 44×44px : zone tactile confortable au doigt,
                // pas seulement au clic de souris précis.
                className="absolute top-0 right-0 w-11 h-11 flex items-center justify-center"
              >
                <span className="w-6 h-6 rounded-full bg-[rgba(224,85,85,.9)] text-white flex items-center justify-center">
                  <X size={13} strokeWidth={2.5} />
                </span>
              </button>
              <span className="absolute bottom-[5px] left-[7px] text-[10px] font-bold text-white bg-black/55 px-1.5 rounded">
                {i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
