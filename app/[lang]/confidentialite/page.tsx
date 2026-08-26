import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT } from "@/lib/data";

export const metadata = {
  title: "Politique de confidentialité – 237Logement",
  description:
    "Comment 237Logement collecte, utilise et protège vos données personnelles sur la plateforme.",
};

// Date affichée en bas de page et dans l'intro — à mettre à jour à la main
// si le contenu de cette page est modifié plus tard.
const LAST_UPDATED = "26 août 2026";

function Section({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-[20px] font-bold text-text mb-3 flex items-baseline gap-2.5">
        <span className="text-gold">{n}.</span> {title}
      </h2>
      <div className="text-[15px] text-muted leading-[1.85] space-y-3">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[760px] mx-auto px-[5%] pt-[90px] pb-20">
      <div className="text-center mb-[52px]">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          Vos données, en toute transparence
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="font-display text-[clamp(26px,3.5vw,44px)] font-bold text-text mt-2">
            Politique de <span className="text-gold">confidentialité</span>
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="gold-bar mt-3.5 mx-auto" />
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-[15px] mt-3.5 max-w-[520px] mx-auto">
            Dernière mise à jour : {LAST_UPDATED}. Cette page explique simplement quelles données
            237Logement collecte, pourquoi, et comment vous pouvez les contrôler.
          </p>
        </Reveal>
      </div>

      <Section n={1} title="Qui sommes-nous">
        <p>
          237Logement est une plateforme camerounaise de mise en relation directe entre
          propriétaires et locataires/acheteurs, sans intermédiaire ni frais d&apos;agence.
          Cette politique s&apos;applique à tous les visiteurs, locataires et propriétaires
          utilisant le site 237logement.org (« le Site »).
        </p>
      </Section>

      <Section n={2} title="Quelles données nous collectons">
        <p>Nous collectons uniquement les données nécessaires au fonctionnement du Site :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text">À la création de votre compte :</strong> nom, adresse
            email, mot de passe (stocké de façon chiffrée, jamais en clair), et votre rôle
            (locataire ou propriétaire). Le numéro de téléphone et la ville sont facultatifs.
          </li>
          <li>
            <strong className="text-text">Si vous publiez une annonce :</strong> les informations
            du bien (ville, quartier, adresse, prix, description, équipements) et les photos que
            vous choisissez d&apos;ajouter. Votre nom et votre numéro de téléphone sont affichés
            publiquement sur vos annonces pour permettre aux locataires potentiels de vous
            contacter directement.
          </li>
          <li>
            <strong className="text-text">Lors de vos échanges avec nous :</strong> les
            informations que vous nous transmettez volontairement via le formulaire de contact,
            par email ou par téléphone.
          </li>
        </ul>
        <p>
          Nous ne collectons <strong className="text-text">aucune donnée de paiement</strong> —
          237Logement ne gère aucune transaction financière entre utilisateurs.
        </p>
      </Section>

      <Section n={3} title="Cookies et traceurs">
        <p>
          Le Site utilise uniquement un cookie technique indispensable, déposé par notre
          hébergeur d&apos;authentification, pour vous garder connecté à votre compte d&apos;une
          page à l&apos;autre. Il n&apos;a pas de finalité publicitaire.
        </p>
        <p>
          Nous n&apos;utilisons aujourd&apos;hui aucun cookie ni traceur publicitaire ou
          statistique (pas de Google Analytics, pas de pixel Facebook, etc.). Si cela change un
          jour, cette page sera mise à jour au préalable.
        </p>
      </Section>

      <Section n={4} title="Pourquoi nous utilisons ces données">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Créer et sécuriser votre compte, et vous permettre de vous connecter.</li>
          <li>Publier et afficher vos annonces immobilières sur le Site.</li>
          <li>Permettre le contact direct entre locataires et propriétaires.</li>
          <li>Répondre à vos demandes via notre support.</li>
          <li>Assurer la sécurité du Site et prévenir les fraudes ou faux comptes.</li>
        </ul>
        <p>Nous ne vendons jamais vos données à des tiers.</p>
      </Section>

      <Section n={5} title="Avec qui vos données sont partagées">
        <p>Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong className="text-text">Publiquement, avec les autres utilisateurs</strong> :
            si vous publiez une annonce, votre nom et votre numéro de téléphone sont visibles par
            toute personne consultant cette annonce — c&apos;est nécessaire pour permettre le
            contact direct, sans intermédiaire.
          </li>
          <li>
            <strong className="text-text">Avec nos prestataires techniques</strong>, qui hébergent
            le Site et sa base de données et n&apos;ont pas le droit d&apos;utiliser vos données à
            d&apos;autres fins que le fonctionnement du Site.
          </li>
          <li>
            <strong className="text-text">Si la loi l&apos;exige</strong>, par exemple en réponse
            à une demande légale des autorités camerounaises compétentes.
          </li>
        </ul>
      </Section>

      <Section n={6} title="Combien de temps nous gardons vos données">
        <p>
          Vos données sont conservées tant que votre compte reste actif. Si vous supprimez une
          annonce, elle disparaît immédiatement du Site. Si vous souhaitez la suppression
          complète de votre compte et de vos données, contactez-nous (coordonnées ci-dessous) —
          nous y donnons suite dans un délai raisonnable, sauf obligation légale de conservation.
        </p>
      </Section>

      <Section n={7} title="Vos droits">
        <p>Vous pouvez à tout moment nous demander de :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Accéder aux données que nous détenons sur vous.</li>
          <li>Corriger une information inexacte ou obsolète.</li>
          <li>Supprimer votre compte et vos données personnelles.</li>
          <li>Retirer une annonce publiée.</li>
        </ul>
        <p>
          Pour exercer l&apos;un de ces droits, écrivez-nous à{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">
            {CONTACT.email}
          </a>{" "}
          ou appelez-nous au{" "}
          <a href={`tel:${CONTACT.phoneRaw}`} className="text-gold hover:underline">
            {CONTACT.phone}
          </a>
          .
        </p>
      </Section>

      <Section n={8} title="Sécurité">
        <p>
          Nous prenons des mesures raisonnables pour protéger vos données (mots de passe
          chiffrés, accès restreint à la base de données). Aucun système n&apos;étant
          totalement infaillible, nous vous recommandons d&apos;utiliser un mot de passe unique
          et de ne jamais le communiquer à un tiers — 237Logement ne vous le demandera jamais par
          téléphone ou email.
        </p>
      </Section>

      <Section n={9} title="Utilisateurs mineurs">
        <p>
          Le Site s&apos;adresse aux personnes majeures capables de conclure un contrat de
          location ou de vente immobilière. Il n&apos;est pas destiné aux mineurs, et nous ne
          collectons pas sciemment de données les concernant.
        </p>
      </Section>

      <Section n={10} title="Modifications de cette politique">
        <p>
          Cette politique peut évoluer, notamment si de nouvelles fonctionnalités sont ajoutées
          au Site. Toute modification importante sera annoncée sur cette page, avec mise à jour
          de la date en haut de page.
        </p>
      </Section>

      <Section n={11} title="Nous contacter">
        <p>
          Pour toute question sur cette politique ou sur vos données personnelles, contactez-nous
          à{" "}
          <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">
            {CONTACT.email}
          </a>{" "}
          ,{" "}
          <a href={`tel:${CONTACT.phoneRaw}`} className="text-gold hover:underline">
            {CONTACT.phone}
          </a>{" "}
          ou via notre{" "}
          <Link href="/contact" className="text-gold hover:underline">
            formulaire de contact
          </Link>
          .
        </p>
      </Section>
    </div>
  );
}
