import { redirect } from "next/navigation";

// Le tableau de bord propriétaire a fusionné avec l'espace visiteur dans
// /compte (voir app/compte/page.tsx). Route conservée en redirection pour
// ne pas casser les liens et favoris de navigateur existants.
export default function ProprietaireRedirect() {
  redirect("/compte");
}
