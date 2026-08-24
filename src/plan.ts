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

export type Operateur = 'orange' | 'mtn' | 'moov';
export type TypeLigne = 'mobile' | 'fixe';

export const INDICATIF = '225';

/** Préfixe à deux chiffres du nouveau plan → opérateur et type de ligne. */
export const PREFIXES: Record<string, { operateur: Operateur; type: TypeLigne }> = {
  '01': { operateur: 'moov', type: 'mobile' },
  '05': { operateur: 'mtn', type: 'mobile' },
  '07': { operateur: 'orange', type: 'mobile' },
  '21': { operateur: 'moov', type: 'fixe' },
  '25': { operateur: 'mtn', type: 'fixe' },
  '27': { operateur: 'orange', type: 'fixe' },
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
export const ANCIENS_PREFIXES: Record<Operateur, string[]> = {
  moov: ['01', '02', '03'],
  mtn: [
    '04', '05', '06',                                    // page MTN + terrain
    '44', '45', '46', '54', '55', '56', '64', '65', '66', // page MTN
    '74', '75', '76', '84', '85', '86', '95', '96',
  ],
  orange: ['07', '08', '09'],
};

/** Conservé pour compatibilité : la liste publiée par MTN. */
export const ANCIENS_PREFIXES_MTN = ANCIENS_PREFIXES.mtn;

/** Préfixe ancien → opérateur, construit une fois. */
export const ANCIEN_VERS_OPERATEUR: Record<string, Operateur> = Object.fromEntries(
  Object.entries(ANCIENS_PREFIXES).flatMap(([op, liste]) =>
    liste.map(p => [p, op as Operateur]),
  ),
);

/** Longueur d'un numéro national depuis 2021. */
export const LONGUEUR_NOUVEAU = 10;
/** Longueur d'un numéro national avant 2021. */
export const LONGUEUR_ANCIEN = 8;
