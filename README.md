# numero-ci

Les numéros de téléphone ivoiriens, sans surprise.

```bash
npm install numero-ci
```

```js
import { parse, operatorName, format, matchKey } from 'numero-ci';

parse('+225 07 57 22 36 37');
// { valid: true, national: '0757223637', international: '+2250757223637',
//   matchKey: '57223637', legacyFormat: false }

operatorName('0557223637');   // 'mtn'
format('+2250757223637');     // '07 57 22 36 37'
```

---

## Pourquoi ce paquet

Les bibliothèques généralistes valident un numéro. Elles ne règlent pas les trois
problèmes qu'on rencontre vraiment en Côte d'Ivoire.

### 1. Les deux époques cohabitent dans toutes les bases

Le 31 janvier 2021, la numérotation est passée de 8 à 10 chiffres : un préfixe de
deux chiffres a été ajouté devant l'ancien numéro. Résultat, une base de contacts
constituée sur plusieurs années contient **les deux écritures de la même ligne**.

Sur un carnet WhatsApp réel de 1 122 contacts, nous avons compté 531 numéros à
l'ancien format contre 60 au nouveau. Comparer les chaînes brutes ne rapproche
rien, et le même client compte deux fois.

`matchKey()` renvoie les 8 derniers chiffres — la partie que la renumérotation
n'a pas touchée :

```js
matchKey('22557223637')          // '57223637'  (ancien format)
matchKey('+225 07 57 22 36 37')  // '57223637'  (actuel)  → même ligne
```

C'est la clé à utiliser pour dédoublonner, pour rapprocher un CRM d'un export
WhatsApp, ou pour vérifier qu'on n'écrit pas deux fois à la même personne.

### 2. L'opérateur, quand il est connaissable

```js
import { operator } from 'numero-ci';

operator('0757223637');
// { operator: 'orange', type: 'mobile', source: 'prefix' }
```

Depuis 2021 le préfixe le dit sans ambiguïté : `01` Moov, `05` MTN, `07` Orange
pour le mobile ; `21`, `25`, `27` pour le fixe.

### 3. Il refuse de deviner

Un ancien numéro à 8 chiffres ne porte pas son opérateur dans le plan actuel. Les
tranches sont connues pour `01`–`03` (Moov), `04`–`06` (MTN), `07`–`09` (Orange),
plus les tranches en `4x`–`9x` que MTN publie. En dehors de celles-là :

```js
operator('57223637');
// { operator: null, type: null, source: 'unknown' }
```

`null`, et pas une supposition. Un opérateur faux envoie un paiement Mobile Money
au mauvais endroit, ou un SMS par la mauvaise passerelle. Une réponse « je ne sais
pas » se traite ; une réponse fausse, non.

Chaque résultat indique **d'où il vient** (`prefix`, `legacy-prefix`, `unknown`),
pour que vous décidiez si vous vous y fiez.

## API

| Fonction | Ce qu'elle fait |
|---|---|
| `parse(numero, operator?)` | analyse complète : validité, formes, clé de rapprochement |
| `isValid(numero)` | `true` / `false` |
| `matchKey(numero)` | les 8 chiffres de rapprochement, ou `null` |
| `operator(numero)` | opérateur, type de ligne, et source de la réponse |
| `operatorName(numero)` | `'orange' \| 'mtn' \| 'moov' \| null` |
| `isMobile(numero)` | `true \| false \| null` |
| `format(numero, style?, operator?)` | `'national'`, `'international'`, `'compact'`, `'wa'` |
| `whatsappLink(numero, message?)` | lien `wa.me`, message pré-rempli optionnel |

Toutes les fonctions acceptent n'importe quelle écriture : espaces, points,
tirets, parenthèses, indicatif `+225`, `00225`, ou rien. Les tirets insécables
(`U+2011`) sont gérés — on les trouve dans du texte produit par des modèles de
langage et dans certains exports de CRM.

### Convertir un ancien numéro

Il lui manque son préfixe, donc son opérateur. Les tranches couvrent la plupart
des cas ; sinon, donnez-le :

```js
parse('07223637');            // '0707223637' — 07 était Orange à l'époque
parse('57223637');            // valid: false, la raison est expliquée
parse('57223637', 'orange');  // '0757223637'
```

## Sources

Les préfixes viennent des opérateurs eux-mêmes, pas d'une mémoire :

- [MTN Côte d'Ivoire — passage à 10 chiffres](https://www.mtn.ci/helppersonal/nouvelle-numerotation-en-cote-divoire-passage-a-10-chiffres/)
- [Orange Côte d'Ivoire — plan de numérotation](https://www.orange.ci/fr/plan-national-de-numerotation-a-10-chiffres.html)

MTN publie ses anciens préfixes mobiles. Les tranches en `0x` viennent de la
connaissance du terrain (Zakaria Koné) et recoupent exactement la liste MTN sur
`04`–`06`, ce qui les corrobore. **Si vous avez une source officielle pour les
tranches d'Orange et de Moov, ouvrez une issue** — c'est la contribution la plus
utile qu'on puisse faire ici.

## Tests

```bash
npm test
```

22 tests, aucune dépendance.

## In English

Ivorian phone numbers. Solves three local problems that general-purpose libraries
ignore: matching a pre-2021 8-digit number with its current 10-digit form (so you
can deduplicate contact lists where both coexist), detecting the operator from the
prefix, and returning `null` instead of a guess when the operator cannot be known.
The API is in English; the documentation is in French because that is the language
of the developers who hit these problems.

## Licence

MIT
