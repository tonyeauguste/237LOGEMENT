import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT } from "@/lib/data";
import { isLocale, DEFAULT_LOCALE, type Locale } from "@/i18n/config";

// Date affichée en bas de page et dans l'intro — à mettre à jour à la main
// si le contenu de cette page est modifié plus tard.
const LAST_UPDATED = "26 août 2026";
const LAST_UPDATED_EN = "August 26, 2026";

// ═══════════════════════════════════════════════
// Contenu légal directement ici (pas dans messages/*.json) : chaque
// section mélange texte brut et mise en forme en ligne (<strong>, <a>,
// <Link>) — plus simple à maintenir en JSX localisé qu'en clés de
// traduction avec des balises encodées dans des chaînes.
// ═══════════════════════════════════════════════
function getSections(locale: Locale): { title: string; body: ReactNode }[] {
  if (locale === "en") {
    return [
      {
        title: "Who we are",
        body: (
          <p>
            237Logement is a Cameroonian platform that connects owners directly with tenants and
            buyers, with no middleman and no agency fees. This policy applies to all visitors,
            tenants and owners using the 237logement.org website (&quot;the Site&quot;).
          </p>
        ),
      },
      {
        title: "What data we collect",
        body: (
          <>
            <p>We only collect the data needed to run the Site:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text">When you create an account:</strong> name, email
                address, password (stored encrypted, never in plain text), and your role (tenant
                or owner). Phone number and city are optional.
              </li>
              <li>
                <strong className="text-text">If you publish a listing:</strong> the property
                information (city, neighborhood, address, price, description, amenities) and the
                photos you choose to add. Your name and phone number are displayed publicly on
                your listings so potential tenants can contact you directly.
              </li>
              <li>
                <strong className="text-text">When you communicate with us:</strong> the
                information you voluntarily share via the contact form, email, or phone.
              </li>
            </ul>
            <p>
              We do not collect <strong className="text-text">any payment data</strong> —
              237Logement does not handle any financial transactions between users.
            </p>
          </>
        ),
      },
      {
        title: "Cookies and trackers",
        body: (
          <>
            <p>
              The Site uses only one essential technical cookie, set by our authentication
              provider, to keep you logged into your account across pages. It has no advertising
              purpose.
            </p>
            <p>
              We currently use no advertising or analytics cookies or trackers (no Google
              Analytics, no Facebook pixel, etc.). If this ever changes, this page will be updated
              beforehand.
            </p>
          </>
        ),
      },
      {
        title: "Why we use this data",
        body: (
          <>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Create and secure your account, and let you log in.</li>
              <li>Publish and display your real estate listings on the Site.</li>
              <li>Enable direct contact between tenants and owners.</li>
              <li>Respond to your requests via our support.</li>
              <li>Keep the Site secure and prevent fraud or fake accounts.</li>
            </ul>
            <p>We never sell your data to third parties.</p>
          </>
        ),
      },
      {
        title: "Who your data is shared with",
        body: (
          <>
            <p>Your data is never sold. It may only be shared:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong className="text-text">Publicly, with other users</strong>: if you publish
                a listing, your name and phone number are visible to anyone viewing that listing —
                this is necessary to enable direct, middleman-free contact.
              </li>
              <li>
                <strong className="text-text">With our technical providers</strong>, who host the
                Site and its database and are not allowed to use your data for any purpose other
                than running the Site.
              </li>
              <li>
                <strong className="text-text">If required by law</strong>, for example in response
                to a legal request from the competent Cameroonian authorities.
              </li>
            </ul>
          </>
        ),
      },
      {
        title: "How long we keep your data",
        body: (
          <p>
            Your data is kept as long as your account stays active. If you delete a listing, it
            disappears from the Site immediately. If you want your account and data fully deleted,
            contact us (details below) — we act on it within a reasonable timeframe, except where
            the law requires us to keep it longer.
          </p>
        ),
      },
      {
        title: "Your rights",
        body: (
          <>
            <p>You may ask us at any time to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the data we hold about you.</li>
              <li>Correct inaccurate or outdated information.</li>
              <li>Delete your account and personal data.</li>
              <li>Remove a published listing.</li>
            </ul>
            <p>
              To exercise any of these rights, write to us at{" "}
              <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">
                {CONTACT.email}
              </a>{" "}
              or call us at{" "}
              <a href={`tel:${CONTACT.phoneRaw}`} className="text-gold hover:underline">
                {CONTACT.phone}
              </a>
              .
            </p>
          </>
        ),
      },
      {
        title: "Security",
        body: (
          <p>
            We take reasonable measures to protect your data (encrypted passwords, restricted
            database access). No system being fully infallible, we recommend using a unique
            password and never sharing it with anyone — 237Logement will never ask for it by phone
            or email.
          </p>
        ),
      },
      {
        title: "Minors",
        body: (
          <p>
            The Site is intended for adults capable of entering into a rental or property sale
            agreement. It is not intended for minors, and we do not knowingly collect data about
            them.
          </p>
        ),
      },
      {
        title: "Changes to this policy",
        body: (
          <p>
            This policy may evolve, in particular as new features are added to the Site. Any
            significant change will be announced on this page, with the date at the top updated
            accordingly.
          </p>
        ),
      },
      {
        title: "Contact us",
        body: (
          <p>
            For any question about this policy or your personal data, contact us at{" "}
            <a href={`mailto:${CONTACT.email}`} className="text-gold hover:underline">
              {CONTACT.email}
            </a>
            ,{" "}
            <a href={`tel:${CONTACT.phoneRaw}`} className="text-gold hover:underline">
              {CONTACT.phone}
            </a>{" "}
            or via our{" "}
            <Link href="/contact" className="text-gold hover:underline">
              contact form
            </Link>
            .
          </p>
        ),
      },
    ];
  }

  return [
    {
      title: "Qui sommes-nous",
      body: (
        <p>
          237Logement est une plateforme camerounaise de mise en relation directe entre
          propriétaires et locataires/acheteurs, sans intermédiaire ni frais d&apos;agence. Cette
          politique s&apos;applique à tous les visiteurs, locataires et propriétaires utilisant le
          site 237logement.org (« le Site »).
        </p>
      ),
    },
    {
      title: "Quelles données nous collectons",
      body: (
        <>
          <p>Nous collectons uniquement les données nécessaires au fonctionnement du Site :</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-text">À la création de votre compte :</strong> nom, adresse
              email, mot de passe (stocké de façon chiffrée, jamais en clair), et votre rôle
              (locataire ou propriétaire). Le numéro de téléphone et la ville sont facultatifs.
            </li>
            <li>
              <strong className="text-text">Si vous publiez une annonce :</strong> les
              informations du bien (ville, quartier, adresse, prix, description, équipements) et
              les photos que vous choisissez d&apos;ajouter. Votre nom et votre numéro de téléphone
              sont affichés publiquement sur vos annonces pour permettre aux locataires potentiels
              de vous contacter directement.
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
        </>
      ),
    },
    {
      title: "Cookies et traceurs",
      body: (
        <>
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
        </>
      ),
    },
    {
      title: "Pourquoi nous utilisons ces données",
      body: (
        <>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Créer et sécuriser votre compte, et vous permettre de vous connecter.</li>
            <li>Publier et afficher vos annonces immobilières sur le Site.</li>
            <li>Permettre le contact direct entre locataires et propriétaires.</li>
            <li>Répondre à vos demandes via notre support.</li>
            <li>Assurer la sécurité du Site et prévenir les fraudes ou faux comptes.</li>
          </ul>
          <p>Nous ne vendons jamais vos données à des tiers.</p>
        </>
      ),
    },
    {
      title: "Avec qui vos données sont partagées",
      body: (
        <>
          <p>Vos données ne sont jamais vendues. Elles peuvent être partagées uniquement :</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong className="text-text">Publiquement, avec les autres utilisateurs</strong> :
              si vous publiez une annonce, votre nom et votre numéro de téléphone sont visibles par
              toute personne consultant cette annonce — c&apos;est nécessaire pour permettre le
              contact direct, sans intermédiaire.
            </li>
            <li>
              <strong className="text-text">Avec nos prestataires techniques</strong>, qui
              hébergent le Site et sa base de données et n&apos;ont pas le droit d&apos;utiliser vos
              données à d&apos;autres fins que le fonctionnement du Site.
            </li>
            <li>
              <strong className="text-text">Si la loi l&apos;exige</strong>, par exemple en réponse
              à une demande légale des autorités camerounaises compétentes.
            </li>
          </ul>
        </>
      ),
    },
    {
      title: "Combien de temps nous gardons vos données",
      body: (
        <p>
          Vos données sont conservées tant que votre compte reste actif. Si vous supprimez une
          annonce, elle disparaît immédiatement du Site. Si vous souhaitez la suppression complète
          de votre compte et de vos données, contactez-nous (coordonnées ci-dessous) — nous y
          donnons suite dans un délai raisonnable, sauf obligation légale de conservation.
        </p>
      ),
    },
    {
      title: "Vos droits",
      body: (
        <>
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
        </>
      ),
    },
    {
      title: "Sécurité",
      body: (
        <p>
          Nous prenons des mesures raisonnables pour protéger vos données (mots de passe chiffrés,
          accès restreint à la base de données). Aucun système n&apos;étant totalement
          infaillible, nous vous recommandons d&apos;utiliser un mot de passe unique et de ne
          jamais le communiquer à un tiers — 237Logement ne vous le demandera jamais par téléphone
          ou email.
        </p>
      ),
    },
    {
      title: "Utilisateurs mineurs",
      body: (
        <p>
          Le Site s&apos;adresse aux personnes majeures capables de conclure un contrat de
          location ou de vente immobilière. Il n&apos;est pas destiné aux mineurs, et nous ne
          collectons pas sciemment de données les concernant.
        </p>
      ),
    },
    {
      title: "Modifications de cette politique",
      body: (
        <p>
          Cette politique peut évoluer, notamment si de nouvelles fonctionnalités sont ajoutées au
          Site. Toute modification importante sera annoncée sur cette page, avec mise à jour de la
          date en haut de page.
        </p>
      ),
    },
    {
      title: "Nous contacter",
      body: (
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
      ),
    },
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  return locale === "en"
    ? {
        title: "Privacy Policy – 237Logement",
        description: "How 237Logement collects, uses and protects your personal data on the platform.",
      }
    : {
        title: "Politique de confidentialité – 237Logement",
        description:
          "Comment 237Logement collecte, utilise et protège vos données personnelles sur la plateforme.",
      };
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const sections = getSections(locale);
  const isEn = locale === "en";

  return (
    <div className="max-w-[760px] mx-auto px-[5%] pt-[90px] pb-20">
      <div className="text-center mb-[52px]">
        <Reveal as="span" className="text-[11px] tracking-[3px] uppercase text-gold font-semibold block">
          {isEn ? "Your data, in full transparency" : "Vos données, en toute transparence"}
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="font-display text-[clamp(26px,3.5vw,44px)] font-bold text-text mt-2">
            {isEn ? (
              <>
                Privacy <span className="text-gold">policy</span>
              </>
            ) : (
              <>
                Politique de <span className="text-gold">confidentialité</span>
              </>
            )}
          </h1>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="gold-bar mt-3.5 mx-auto" />
        </Reveal>
        <Reveal delay={0.14}>
          <p className="text-muted text-[15px] mt-3.5 max-w-[520px] mx-auto">
            {isEn ? (
              <>
                Last updated: {LAST_UPDATED_EN}. This page simply explains what data 237Logement
                collects, why, and how you can control it.
              </>
            ) : (
              <>
                Dernière mise à jour : {LAST_UPDATED}. Cette page explique simplement quelles
                données 237Logement collecte, pourquoi, et comment vous pouvez les contrôler.
              </>
            )}
          </p>
        </Reveal>
      </div>

      {sections.map((s, i) => (
        <section key={s.title} className="mb-10">
          <h2 className="font-display text-[20px] font-bold text-text mb-3 flex items-baseline gap-2.5">
            <span className="text-gold">{i + 1}.</span> {s.title}
          </h2>
          <div className="text-[15px] text-muted leading-[1.85] space-y-3">{s.body}</div>
        </section>
      ))}
    </div>
  );
}
