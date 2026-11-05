// Garde la fonction serveur du site « éveillée ».
//
// Tout le site Next.js tourne dans une seule fonction Netlify. Quand elle
// reste inactive, Netlify la met en veille et le visiteur suivant attend 3 à
// 5 secondes le temps qu'elle redémarre (mesuré sur les journaux de requêtes :
// ~3 s même pour une URL qui n'existe pas). Une visite factice toutes les 5
// minutes l'empêche de s'endormir.
//
// La page visée doit être rendue côté serveur à chaque requête : les pages en
// cache (accueil, tarifs…) sont servies par le CDN et ne réveilleraient rien.
// Une fiche d'annonce l'est (cookies lus au rendu), et sans cookie `v_id` dans
// la requête elle n'enregistre aucune vue — les statistiques ne sont pas
// faussées. Le suivi marketing, lui, s'exécute dans le navigateur : aucun
// effet non plus.
//
// Horaire en UTC : 4 h → 22 h 55 UTC, soit environ 5 h → 23 h 55 au Cameroun
// (UTC+1). La nuit, personne n'attend, inutile de consommer des invocations.
// Ne s'exécute que sur le déploiement publié (production).

const TARGET = "https://237logement.org/fr/annonce/10";

async function keepWarm() {
  const started = Date.now();
  try {
    const res = await fetch(`${TARGET}?_w=${started}`, {
      headers: { "user-agent": "237logement-keep-warm" },
      signal: AbortSignal.timeout(25000),
    });
    // Corps lu jusqu'au bout : la requête doit aller à son terme côté serveur.
    await res.arrayBuffer();
    console.log(`keep-warm ${res.status} en ${Date.now() - started} ms`);
  } catch (error) {
    console.error("keep-warm : échec", error);
  }
}

export default keepWarm;

export const config = {
  schedule: "*/5 4-22 * * *",
};
