# numero-ci

Ivorian phone numbers, without surprises. — *Les numéros de téléphone ivoiriens, sans surprise.*

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

## Why this package

General-purpose libraries validate a number. They do not solve the three problems
you actually hit in Côte d'Ivoire.

### 1. Two eras coexist in every contact list

On 31 January 2021, Ivorian numbering went from 8 to 10 digits: a two-digit
prefix was added in front of the old number. A contact list built over several
years therefore holds **both spellings of the same line**.

On a real WhatsApp address book of 1 122 contacts, we counted 531 numbers in the
old format against 60 in the new one. Comparing raw strings matches nothing, and
the same customer is counted twice.

`matchKey()` returns the last 8 digits — the part the renumbering did not touch:

```js
matchKey('22557223637')          // '57223637'  (old format)
matchKey('+225 07 57 22 36 37')  // '57223637'  (current)  → same line
```

Use it to deduplicate, to reconcile a CRM with a WhatsApp export, or to make sure
you are not writing twice to the same person.

### 2. The operator, when it can be known

```js
import { operator } from 'numero-ci';

operator('0757223637');
// { operator: 'orange', type: 'mobile', source: 'prefix' }
```

Since 2021 the prefix says it unambiguously: `01` Moov, `05` MTN, `07` Orange for
mobile; `21`, `25`, `27` for landlines.

### 3. It refuses to guess

An old 8-digit number does not carry its operator in the current plan. Ranges are
known for `01`–`03` (Moov), `04`–`06` (MTN), `07`–`09` (Orange), plus the `4x`–`9x`
ranges MTN publishes. Anything outside those:

```js
operator('57223637');
// { operator: null, type: null, source: 'unknown' }
```

`null`, not a guess. A wrong operator sends a Mobile Money payment to the wrong
place, or an SMS through the wrong gateway. "I don't know" can be handled; a
confident wrong answer cannot.

Every result states **where it comes from** (`prefix`, `legacy-prefix`, `unknown`)
so you can decide whether to trust it.

## API

| Function | What it does |
|---|---|
| `parse(number, operator?)` | full analysis: validity, forms, match key |
| `isValid(number)` | `true` / `false` |
| `matchKey(number)` | the 8 matching digits, or `null` |
| `operator(number)` | operator, line type, and the source of the answer |
| `operatorName(number)` | `'orange' \| 'mtn' \| 'moov' \| null` |
| `isMobile(number)` | `true \| false \| null` |
| `format(number, style?, operator?)` | `'national'`, `'international'`, `'compact'`, `'wa'` |
| `whatsappLink(number, message?)` | `wa.me` link, optional prefilled message |

Every function accepts any spelling: spaces, dots, dashes, parentheses, `+225`,
`00225`, or nothing. Non-breaking hyphens (`U+2011`) are handled — they show up in
text produced by language models and in some CRM exports.

### Converting an old number

It lacks its prefix, so its operator. Ranges cover most cases; otherwise pass it:

```js
parse('07223637');            // '0707223637' — 07 was Orange back then
parse('57223637');            // valid: false, reason explains why
parse('57223637', 'orange');  // '0757223637'
```

## Sources

Prefixes come from the operators themselves, not from memory:

- [MTN Côte d'Ivoire — passage à 10 chiffres](https://www.mtn.ci/helppersonal/nouvelle-numerotation-en-cote-divoire-passage-a-10-chiffres/)
- [Orange Côte d'Ivoire — plan de numérotation](https://www.orange.ci/fr/plan-national-de-numerotation-a-10-chiffres.html)

MTN publishes its legacy mobile prefixes. The `0x` ranges come from field
knowledge (Zakaria Koné) and match MTN's published list exactly on `04`–`06`,
which corroborates them. **If you have an official source for Orange's and Moov's
legacy ranges, please open an issue** — it is the most useful contribution here.

## En français

Ce paquet règle trois problèmes propres à la Côte d'Ivoire que les bibliothèques
généralistes ignorent :

1. **Les deux époques cohabitent.** Depuis le passage de 8 à 10 chiffres en 2021,
   une base de contacts contient les deux écritures d'une même ligne.
   `matchKey()` les rapproche — indispensable pour dédoublonner.
2. **L'opérateur** se lit dans le préfixe : `01` Moov, `05` MTN, `07` Orange.
3. **Il ne devine pas.** Quand l'opérateur ne peut pas être déterminé, la réponse
   est `null` et jamais une supposition : un mauvais opérateur envoie un paiement
   Mobile Money au mauvais endroit.

Les noms de fonctions sont en anglais, comme le reste de l'écosystème npm, pour
que le paquet reste utilisable et contribuable par tout le monde.

## Tests

```bash
npm test
```

22 tests, no dependencies.

## License

MIT
