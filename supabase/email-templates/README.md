# Gabarits d'emails — 237Logement

Emails transactionnels envoyés par Supabase Auth (via Resend), habillés aux
couleurs du site : fond sombre `#07111e`, accents dorés `#c89b3c`, logo et
signature 237Logement.

## Où les coller

Ces fichiers ne sont **pas** lus automatiquement par l'application : Supabase
stocke les gabarits dans son propre tableau de bord. Ils sont versionnés ici
pour garder une trace, pouvoir les relire et les restaurer en cas de besoin.

Dashboard → **Authentication → Emails → Templates** :

| Onglet Supabase | Fichier à coller |
| --- | --- |
| Confirm signup | `confirmation.html` |
| Reset Password | `recovery.html` |
| Magic Link | `magic-link.html` |
| Change Email Address | `email-change.html` |

Pour chaque onglet : cochez *Custom email*, videz le champ, collez le contenu
**intégral** du fichier, puis *Save*.

### Objets (Subject) recommandés

| Onglet | Objet |
| --- | --- |
| Confirm signup | `Confirmez votre inscription sur 237Logement` |
| Reset Password | `Réinitialisez votre mot de passe 237Logement` |
| Magic Link | `Votre lien de connexion 237Logement` |
| Change Email Address | `Confirmez votre nouvelle adresse email` |

## Aperçu

`_apercu.html` rassemble les quatre gabarits avec des valeurs d'exemple à la
place des variables. Ouvrez-le dans un navigateur pour juger du rendu sans
avoir à déclencher de vrais envois. Ce fichier sert **uniquement** à la
prévisualisation : ne le collez pas dans Supabase.

Régénération après modification d'un gabarit :

```bash
cd supabase/email-templates
node -e "const fs=require('fs');const files=[['confirmation.html','Confirm signup'],['recovery.html','Reset Password'],['magic-link.html','Magic Link'],['email-change.html','Change Email']];let out='<html><head><meta charset=\"utf-8\"></head><body style=\"margin:0;background:#050b14\">';for(const [f,l] of files){let h=fs.readFileSync(f,'utf8').replace(/\{\{\s*\.ConfirmationURL\s*\}\}/g,'https://237logement.org/exemple').replace(/\{\{\s*\.Email\s*\}\}/g,'ancienne@exemple.com').replace(/\{\{\s*\.NewEmail\s*\}\}/g,'nouvelle@exemple.com');out+='<div style=\"padding:14px 20px;background:#c89b3c;color:#07111e;font-weight:bold\">'+l+'</div>'+h;}fs.writeFileSync('_apercu.html',out+'</body></html>');"
```

## Variables Supabase

Remplacées à l'envoi — à ne pas modifier :

- `{{ .ConfirmationURL }}` — lien d'action (confirmation, réinitialisation…)
- `{{ .Email }}` — adresse actuelle du compte
- `{{ .NewEmail }}` — nouvelle adresse (gabarit de changement d'email uniquement)

Autres variables disponibles si besoin : `{{ .Token }}` (code à 6 chiffres),
`{{ .SiteURL }}`, `{{ .RedirectTo }}`.

## Contraintes d'écriture

Le HTML d'un email n'est pas celui d'un site — les clients de messagerie
(Outlook surtout) ignorent une grande partie du CSS moderne :

- mise en page en `<table>`, jamais en flexbox ni grid ;
- styles **en ligne** uniquement, pas de `<style>` ni de classes ;
- pas de police web : `Georgia` remplace Playfair Display, `Arial` remplace Outfit ;
- boutons « bulletproof » (lien dans une cellule de tableau colorée), car
  Outlook n'applique pas `padding` à une balise `<a>` seule ;
- le logo est appelé depuis `https://237logement.org/apple-icon.png` : les
  images distantes sont souvent bloquées par défaut, d'où l'attribut `alt` et
  un rendu qui reste lisible sans elles ;
- lien affiché en clair sous chaque bouton, pour les clients qui neutralisent
  les liens cliquables.

## Après modification

Testez toujours un envoi réel avant de considérer le changement acquis :
inscription avec une adresse `+test` (par ex. `vous+test1@gmail.com`), puis
vérification dans Gmail **et** dans les logs Resend.
