/**
 * Le plan de numérotation ivoirien.
 *
 * Le 31 janvier 2021 à 00h00, la Côte d'Ivoire est passée de 8 à 10 chiffres.
 * Le principe est simple : un préfixe de deux chiffres a été ajouté DEVANT
 * l'ancien numéro, et ce préfixe dépend de l'opérateur.
 *
 * Sources — les opérateurs eux-mêmes, consultées le 24/08/2026 :
 *  · MTN    https://www.mtn.ci/helppersonal/nouvelle-numerotation-en-cote-divoire-passage-a-10-chiffres/
 *  · Orange https://www.orange.ci/fr/plan-national-de-numerotation-a-10-chiffres.html
 */

export type Operator = 'orange' | 'mtn' | 'moov';
export type LineType = 'mobile' | 'landline';

export const COUNTRY_CODE = '225';

/** Préfixe à deux chiffres du nouveau plan → opérateur et type de ligne. */
export const PREFIXES: Record<string, { operator: Operator; type: LineType }> = {
  '01': { operator: 'moov', type: 'mobile' },
  '05': { operator: 'mtn', type: 'mobile' },
  '07': { operator: 'orange', type: 'mobile' },
  '21': { operator: 'moov', type: 'landline' },
  '25': { operator: 'mtn', type: 'landline' },
  '27': { operator: 'orange', type: 'landline' },
};

/**
 * Anciens préfixes mobiles, du temps des 8 chiffres.
 *
 * Ils servent à reconnaître l'opérateur d'un numéro écrit AVANT 2021 — cas très
 * courant dans les bases de contacts et les carnets WhatsApp, où les deux
 * époques cohabitent.
 *
 * Deux sources, et elles ne se contredisent pas :
 *
 *  · MTN publie la sienne sur sa page d'aide (04, 05, 06, puis 44, 45, 46, 54…) —
 *    les anciens numéros ne commençaient pas tous par zéro.
 *  · Les tranches en 0x viennent de Zakaria Koné, qui a utilisé ces numéros :
 *    01-02-03 Moov, 04-05-06 MTN, 07-08-09 Orange. Elles recoupent exactement
 *    la liste MTN sur 04-05-06, ce qui est un bon signe.
 *
 * Ni Orange ni Moov ne publient les leurs. Si vous avez une source officielle,
 * elle est la bienvenue en issue.
 */
export const LEGACY_PREFIXES: Record<Operator, string[]> = {
  moov: ['01', '02', '03'],
  mtn: [
    '04', '05', '06',                                    // page MTN + terrain
    '44', '45', '46', '54', '55', '56', '64', '65', '66', // page MTN
    '74', '75', '76', '84', '85', '86', '95', '96',
  ],
  orange: ['07', '08', '09'],
};

/** Conservé pour compatibilité : la liste publiée par MTN. */
export const LEGACY_PREFIXES_MTN = LEGACY_PREFIXES.mtn;

/** Préfixe ancien → opérateur, construit une fois. */
export const LEGACY_TO_OPERATOR: Record<string, Operator> = Object.fromEntries(
  Object.entries(LEGACY_PREFIXES).flatMap(([op, liste]) =>
    liste.map(p => [p, op as Operator]),
  ),
);

/** Longueur d'un numéro national depuis 2021. */
export const LENGTH_CURRENT = 10;
/** Longueur d'un numéro national avant 2021. */
export const LENGTH_LEGACY = 8;
