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
 * Anciens préfixes mobiles à 8 chiffres, publiés par MTN.
 *
 * Ils servent à reconnaître l'opérateur d'un numéro écrit AVANT 2021 — un cas
 * très courant dans les bases de contacts et les carnets WhatsApp, où les deux
 * époques cohabitent.
 *
 * Attention : seule MTN publie sa liste. Pour un ancien numéro qui n'y figure
 * pas, on ne DEVINE pas l'opérateur — on renvoie `null`. Un mauvais opérateur
 * envoie un paiement Mobile Money au mauvais endroit ; mieux vaut ne pas savoir
 * que de se tromper.
 */
export const ANCIENS_PREFIXES_MTN = [
  '04', '05', '06', '44', '45', '46', '54', '55', '56',
  '64', '65', '66', '74', '75', '76', '84', '85', '86', '95', '96',
];

/** Longueur d'un numéro national depuis 2021. */
export const LONGUEUR_NOUVEAU = 10;
/** Longueur d'un numéro national avant 2021. */
export const LONGUEUR_ANCIEN = 8;
