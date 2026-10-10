// ═══════════════════════════════════════════════
// Génération et téléchargement de fichiers CSV.
//
// Deux choix qui paraissent anodins mais décident si le fichier s'ouvre
// correctement ou pas chez l'utilisateur :
//
// 1. Séparateur point-virgule. Excel configuré en français (ou dans toute
//    locale où la virgule est le séparateur décimal) n'attend PAS la
//    virgule : avec elle, toutes les colonnes atterrissent dans la
//    première cellule. Le public visé étant francophone, le
//    point-virgule est le défaut raisonnable.
//
// 2. BOM UTF-8 en tête. Sans lui, Excel lit le fichier dans l'encodage
//    système et affiche « Propriétaire » au lieu de « Propriétaire ».
//    Les autres tableurs ignorent le BOM sans problème.
// ═══════════════════════════════════════════════

const SEPARATEUR = ";";
const BOM = "﻿";

/**
 * Échappe une valeur pour une cellule CSV : tout est entouré de
 * guillemets et les guillemets internes sont doublés, pour qu'un titre
 * d'annonce contenant un point-virgule, un guillemet ou un retour à la
 * ligne ne casse pas la structure du fichier.
 */
function cellule(valeur: string | number | null | undefined): string {
  const texte = valeur == null ? "" : String(valeur);
  return `"${texte.replace(/"/g, '""')}"`;
}

/** Assemble un tableau de lignes en texte CSV (en-têtes compris). */
export function toCsv(entetes: string[], lignes: (string | number | null | undefined)[][]): string {
  return [entetes, ...lignes].map((l) => l.map(cellule).join(SEPARATEUR)).join("\r\n");
}

/**
 * Déclenche le téléchargement d'un contenu CSV sous le nom donné.
 *
 * L'URL objet est révoquée après coup : sans ça, le contenu resterait en
 * mémoire tant que l'onglet est ouvert — sans gravité pour un fichier,
 * gênant si l'utilisateur enchaîne les exports.
 */
export function downloadCsv(nomFichier: string, contenu: string): void {
  const blob = new Blob([BOM + contenu], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}

/** Horodatage court pour un nom de fichier : 2026-10-11. */
export function dateDuJour(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
