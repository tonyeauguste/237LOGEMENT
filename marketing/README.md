# Visuels publicitaires 237Logement

Visuels prêts à publier (réseaux sociaux, WhatsApp Status) et le script
qui les génère.

**Ce dossier n'est pas servi par le site.** Il est volontairement placé à
la racine du dépôt et non dans `public/` : ces 7 Mo n'ont aucune raison
d'être téléchargeables depuis 237logement.org ni d'alourdir chaque
déploiement.

## Contenu

| Dossier | Rôle |
|---|---|
| `visuels/` | Les 14 PNG prêts à publier |
| `sources/` | Les photos d'origine, nécessaires à la régénération |
| `visuels.py` | Le script de génération |

Deux formats pour chaque message :

- **Carré 1080×1080** — fil Facebook et Instagram
- **Story 1080×1920** — WhatsApp Status, Stories Instagram et Facebook, TikTok

Quatre messages typographiques (locataires, propriétaires & agences,
lancement, confiance) et trois avec photo (locataires, propriétaires,
vue générale).

## Régénérer

```bash
python -m pip install pillow
python marketing/visuels.py
```

Le script s'exécute aussi bien depuis la racine du dépôt que depuis
`marketing/`. Il écrase le contenu de `visuels/`.

**Pour changer un texte**, tout est rassemblé dans le dictionnaire
`CONTENUS`, en haut du fichier — pas besoin de toucher au code de dessin.
Une première version éparpillait ces textes dans chaque fonction, ce qui
obligeait à réécrire le script entier à chaque ajustement de formulation.

## Le discours

Les textes suivent le positionnement du site depuis son ouverture aux
professionnels : **aucune formulation ne doit opposer la plateforme aux
agences.** La page Tarifs leur vend deux formules ; une accroche du type
« zéro frais d'agence » désignerait comme adversaires des clients qu'on
cherche à conquérir.

À éviter : « sans démarcheur », « sans intermédiaire », « frais
d'agence », « entre particuliers ».

À utiliser : « aucune commission prélevée », « contact direct avec le
propriétaire ou l'agence », « annonceurs vérifiés ».

La cible du discours est la commission cachée, pas l'agence.

## Photos

Issues d'Unsplash, **licence Unsplash** : usage commercial autorisé, sans
attribution obligatoire. Conservées dans `sources/` pour que la
régénération ne dépende pas d'un accès réseau ni de la disponibilité des
URL d'origine.

| Fichier | Sujet | Auteur |
|---|---|---|
| `homme.jpg` | Homme souriant devant son téléphone | Ali Mkumbwa |
| `femme.jpg` | Portrait de femme avec téléphone | Hassan Kibwana |
| `maison1.jpg` | Maison moderne — déjà utilisée sur la page d'accueil | Unsplash |

`femme.jpg` est en noir et blanc à l'origine ; le script lui applique une
bichromie bleu nuit / crème doré, après avoir relevé luminosité et
contraste — sans ce relèvement, le visage disparaît dans le fond.
