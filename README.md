# numero-ci

Les numéros de téléphone ivoiriens, sans surprise.

```bash
npm install numero-ci
```

```js
import { analyser, nomOperateur, formater, cle } from 'numero-ci';

analyser('+225 07 57 22 36 37');
// { valide: true, national: '0757223637', international: '+2250757223637',
//   cle: '57223637', ancienFormat: false }

nomOperateur('0557223637');        // 'mtn'
formater('+2250757223637');        // '07 57 22 36 37'
```

## Pourquoi ce paquet

Les bibliothèques généralistes valident un numéro. Elles ne règlent pas les trois
problèmes qu'on rencontre vraiment en Côte d'Ivoire.

### 1. Les deux époques cohabitent

Le 31 janvier 2021, la numérotation est passée de 8 à 10 chiffres : un préfixe a
été ajouté devant l'ancien numéro. Résultat, une base de contacts constituée sur
plusieurs années contient les deux écritures **de la même ligne**.

Sur un carnet WhatsApp réel de 1 122 contacts, nous avons compté 531 numéros à
l'ancien format contre 60 au nouveau. Comparer les numéros bruts ne rapproche
rien, et le même client compte deux fois.

`cle()` renvoie les 8 derniers chiffres — la partie que la renumérotation n'a pas
touchée :

```js
cle('22557223637')            // '57223637'  (ancien format)
cle('+225 07 57 22 36 37')    // '57223637'  (nouveau)  → même ligne
```

C'est la clé à utiliser pour dédoublonner, rapprocher un CRM d'un carnet
WhatsApp, ou vérifier qu'on n'écrit pas deux fois à la même personne.

### 2. L'opérateur, quand il est connaissable

```js
import { operateur } from 'numero-ci';

operateur('0757223637');
// { operateur: 'orange', type: 'mobile', source: 'prefixe' }
```

Depuis 2021 le préfixe le dit sans ambiguïté : `01` Moov, `05` MTN, `07` Orange
pour le mobile ; `21`, `25`, `27` pour le fixe.

### 3. Il refuse de deviner

Un ancien numéro à 8 chiffres ne porte pas son opérateur. Seule MTN publie la
liste de ses anciens préfixes, ce qui permet de trancher pour elle. Ailleurs :

```js
operateur('57223637');
// { operateur: null, type: null, source: 'inconnu' }
```

`null`, et pas une supposition. Un opérateur faux envoie un paiement Mobile Money
au mauvais endroit, ou un SMS par la mauvaise passerelle. Une réponse « je ne sais
pas » se traite ; une réponse fausse, non.

Chaque résultat indique **d'où il vient** (`prefixe`, `ancien-prefixe-mtn`,
`inconnu`), pour que vous décidiez si vous vous y fiez.

## API

| Fonction | Ce qu'elle fait |
|---|---|
| `analyser(numero, operateur?)` | analyse complète : validité, formes, clé |
| `estValide(numero)` | `true` / `false` |
| `cle(numero)` | les 8 chiffres de rapprochement, ou `null` |
| `operateur(numero)` | opérateur, type de ligne, et source de la réponse |
| `nomOperateur(numero)` | `'orange' \| 'mtn' \| 'moov' \| null` |
| `estMobile(numero)` | `true \| false \| null` |
| `formater(numero, format?, operateur?)` | `'national'`, `'international'`, `'compact'`, `'wa'` |
| `lienWhatsApp(numero, message?)` | lien `wa.me`, message pré-rempli optionnel |

Toutes les fonctions acceptent n'importe quelle écriture : espaces, points,
tirets, parenthèses, indicatif `+225`, `00225`, ou rien. Les tirets insécables
(`U+2011`) sont gérés — on les trouve dans du texte produit par des modèles de
langage et dans certains exports de CRM.

## Convertir un ancien numéro

Il manque son préfixe, donc son opérateur. Donnez-le :

```js
analyser('57223637');              // valide: false, raison expliquée
analyser('57223637', 'orange');    // national: '0757223637'
```

## Sources

Les préfixes ne viennent pas de la mémoire de quelqu'un, mais des opérateurs :

- [MTN Côte d'Ivoire — passage à 10 chiffres](https://www.mtn.ci/helppersonal/nouvelle-numerotation-en-cote-divoire-passage-a-10-chiffres/)
- [Orange Côte d'Ivoire — plan de numérotation](https://www.orange.ci/fr/plan-national-de-numerotation-a-10-chiffres.html)

La liste des anciens préfixes mobiles MTN est publiée sur leur page. Orange et
Moov ne publient pas les leurs — c'est pourquoi ce paquet ne tranche pas pour eux
sur un ancien numéro. **Si vous avez une source officielle pour ces listes,
ouvrez une issue** : c'est la contribution la plus utile qu'on puisse faire ici.

## Tests

```bash
npm test
```

20 tests, aucune dépendance.

## Licence

MIT
