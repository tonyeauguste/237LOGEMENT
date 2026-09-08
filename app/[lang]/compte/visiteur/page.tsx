import { redirect } from "next/navigation";

// L'espace visiteur séparé n'existe plus : tout compte partage désormais le
// même tableau de bord (/compte), qui réunit favoris ET annonces. On garde
// cette route en simple redirection pour ne pas casser les liens et
// favoris de navigateur existants.
export default function VisiteurRedirect() {
  redirect("/compte");
}
