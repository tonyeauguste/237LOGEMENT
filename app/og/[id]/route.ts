import sharp from "sharp";
import { createPublicClient } from "@/lib/supabase/public";
import { SITE_URL } from "@/lib/seo";

// Photo d'aperçu d'une annonce pour WhatsApp/Facebook : /og/<id>.jpg
//
// Pourquoi une route dédiée plutôt que /_next/image : le robot de WhatsApp
// n'annonce pas WebP dans son en-tête Accept, l'optimiseur de Next renvoie
// alors la photo d'origine (un PNG de 1,4 Mo mesuré en production), et
// WhatsApp n'affiche pas l'image d'un aperçu trop lourd. Ici la sortie est
// toujours un JPEG 1200×630 (ratio attendu par les aperçus) de moins de
// ~250 Ko.
//
// Sécurité : l'URL de la photo vient de la base (jamais de la requête), et
// seul un hébergeur connu est accepté — pas de SSRF possible. Les
// annonces masquées (bien occupé en court séjour, photos floutées sur la
// fiche) renvoient l'image générique du site, comme la fiche elle-même.
export const dynamic = "force-dynamic";

const MAX_BYTES = 250 * 1024;
const ALLOWED_HOST = /(^|\.)supabase\.co$|^images\.unsplash\.com$/;

function fallback(): Response {
  return Response.redirect(`${SITE_URL}/og-default-fr.jpg`, 302);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: raw } = await params;
  // "10.jpg" -> 10 : le suffixe .jpg sert aux robots et évite le proxy de langue.
  const id = Number.parseInt(raw, 10);
  if (!Number.isFinite(id)) return fallback();

  try {
    const { data: row } = await createPublicClient()
      .from("properties")
      .select("images, type, occupancy_status")
      .eq("id", id)
      .maybeSingle();

    const photo = row?.images?.[0];
    if (!row || !photo || (row.type === "courte" && row.occupancy_status === "occupe")) {
      return fallback();
    }

    const url = new URL(photo);
    if (url.protocol !== "https:" || !ALLOWED_HOST.test(url.hostname)) return fallback();

    // no-store : une photo de plusieurs centaines de Ko n'a rien à faire dans
    // le cache de données de Next (le résultat final est mis en cache par le
    // CDN grâce au Cache-Control ci-dessous).
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) });
    if (!res.ok) return fallback();
    const input = Buffer.from(await res.arrayBuffer());

    // Qualité décroissante jusqu'à passer sous le plafond de poids.
    let output: Buffer = Buffer.alloc(0);
    for (const quality of [78, 62, 48]) {
      output = await sharp(input)
        .rotate()
        .resize(1200, 630, { fit: "cover", position: "centre" })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();
      if (output.length <= MAX_BYTES) break;
    }

    return new Response(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/jpeg",
        // L'URL change quand la photo change (?v=…, voir lib/seo.ts), on peut
        // donc mettre en cache longtemps côté CDN.
        "Cache-Control": "public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch (err) {
    console.error(`[og] image d'aperçu indisponible pour l'annonce ${id} :`, err);
    return fallback();
  }
}
