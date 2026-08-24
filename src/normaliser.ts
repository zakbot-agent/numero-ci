import { ANCIEN_VERS_OPERATEUR, INDICATIF, LONGUEUR_ANCIEN, LONGUEUR_NOUVEAU, PREFIXES } from './plan.js';

/**
 * Ce qu'on sait d'un numéro après analyse.
 * `valide: false` ne veut pas dire « faux » mais « pas reconnaissable comme
 * ivoirien » — on ne prétend pas trancher pour les autres pays.
 */
export interface NumeroAnalyse {
  valide: boolean;
  /** 10 chiffres, sans indicatif : « 0757223637 » */
  national: string | null;
  /** format international : « +2250757223637 » */
  international: string | null;
  /** les 8 derniers chiffres — voir `cle()` */
  cle: string | null;
  /** true si l'entrée était encore à l'ancien format 8 chiffres */
  ancienFormat: boolean;
  raison?: string;
}

/** Ne garde que les chiffres. Gère les tirets insécables et les espaces fines. */
export function chiffres(entree: unknown): string {
  return String(entree ?? '').replace(/[^\d]/g, '');
}

/**
 * La clé de rapprochement : les 8 derniers chiffres.
 *
 * C'est la partie que la renumérotation de 2021 n'a pas touchée — elle a
 * seulement ajouté un préfixe devant. Deux écritures d'une même ligne, à des
 * époques différentes, partagent donc ces 8 chiffres.
 *
 * C'est ce qui permet de dédoublonner une base de contacts où les deux formats
 * cohabitent. Comparer les numéros bruts, lui, ne rapproche rien.
 */
export function cle(entree: unknown): string | null {
  let n = chiffres(entree);
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith(INDICATIF)) n = n.slice(INDICATIF.length);
  // au-delà, ce n'est plus un numéro : identifiant de groupe, chaîne tronquée…
  if (n.length < LONGUEUR_ANCIEN || n.length > 15) return null;
  return n.slice(-LONGUEUR_ANCIEN);
}

/**
 * Analyse un numéro écrit sous n'importe quelle forme : avec ou sans indicatif,
 * avec espaces, points, tirets, parenthèses, à l'ancien ou au nouveau format.
 *
 * @param entree      le numéro, tel qu'il a été saisi ou stocké
 * @param operateur   opérateur connu par ailleurs. Sert à convertir un ancien
 *                    numéro à 8 chiffres, qui ne porte pas cette information.
 */
export function analyser(
  entree: unknown,
  operateur?: 'orange' | 'mtn' | 'moov',
): NumeroAnalyse {
  const vide: NumeroAnalyse = {
    valide: false, national: null, international: null, cle: null, ancienFormat: false,
  };

  let n = chiffres(entree);
  if (!n) return { ...vide, raison: 'aucun chiffre' };

  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith(INDICATIF)) n = n.slice(INDICATIF.length);

  // ancien format : 8 chiffres, sans préfixe opérateur
  if (n.length === LONGUEUR_ANCIEN) {
    // Les deux premiers chiffres de l ancien numéro portent l opérateur
    // (01-03 Moov, 04-06 MTN, 07-09 Orange, plus les tranches MTN en 4x-9x).
    // On peut donc convertir sans que l appelant ait à le préciser.
    operateur = operateur ?? ANCIEN_VERS_OPERATEUR[n.slice(0, 2)];
    if (!operateur) {
      return {
        ...vide,
        cle: n,
        ancienFormat: true,
        raison: "ancien format à 8 chiffres, et la tranche « " + n.slice(0, 2) +
          " » n est attribuée à aucun opérateur connu. Passez l opérateur en " +
          "second argument pour convertir malgré tout.",
      };
    }
    const prefixe = Object.entries(PREFIXES)
      .find(([, v]) => v.operateur === operateur && v.type === 'mobile')?.[0];
    if (!prefixe) return { ...vide, cle: n, ancienFormat: true, raison: `opérateur inconnu : ${operateur}` };
    const national = prefixe + n;
    return {
      valide: true,
      national,
      international: `+${INDICATIF}${national}`,
      cle: n,
      ancienFormat: true,
    };
  }

  if (n.length !== LONGUEUR_NOUVEAU) {
    return { ...vide, cle: cle(n), raison: `${n.length} chiffres : ni 8 ni 10` };
  }

  const prefixe = n.slice(0, 2);
  if (!PREFIXES[prefixe]) {
    return {
      ...vide,
      cle: n.slice(-LONGUEUR_ANCIEN),
      raison: `préfixe « ${prefixe} » hors du plan ivoirien`,
    };
  }

  return {
    valide: true,
    national: n,
    international: `+${INDICATIF}${n}`,
    cle: n.slice(-LONGUEUR_ANCIEN),
    ancienFormat: false,
  };
}

/** Raccourci : le numéro est-il un numéro ivoirien reconnaissable ? */
export const estValide = (entree: unknown): boolean => analyser(entree).valide;
