import { LEGACY_TO_OPERATOR, LEGACY_LANDLINE_RANGES, COUNTRY_CODE, LENGTH_LEGACY, LENGTH_CURRENT, PREFIXES } from './plan.js';
import type { Operator } from './plan.js';

/**
 * Ce qu'on sait d'un numéro après analyse.
 * `valid: false` ne veut pas dire « faux » mais « pas reconnaissable comme
 * ivoirien » — on ne prétend pas trancher pour les autres pays.
 */
export interface ParsedNumber {
  valid: boolean;
  /** 10 chiffres, sans indicatif : « 0757223637 » */
  national: string | null;
  /** format international : « +2250757223637 » */
  international: string | null;
  /** les 8 derniers chiffres — voir `matchKey()` */
  matchKey: string | null;
  /** true si l'entrée était encore à l'ancien format 8 chiffres */
  legacyFormat: boolean;
  reason?: string;
}

/** Ne garde que les chiffres. Gère les tirets insécables et les espaces fines. */
export function digits(input: unknown): string {
  return String(input ?? '').replace(/[^\d]/g, '');
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
export function matchKey(input: unknown): string | null {
  let n = digits(input);
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith(COUNTRY_CODE)) n = n.slice(COUNTRY_CODE.length);
  // au-delà, ce n'est plus un numéro : identifiant de groupe, chaîne tronquée…
  if (n.length < LENGTH_LEGACY || n.length > 15) return null;
  return n.slice(-LENGTH_LEGACY);
}

/**
 * Analyse un numéro écrit sous n'importe quelle forme : avec ou sans indicatif,
 * avec espaces, points, tirets, parenthèses, à l'ancien ou au nouveau format.
 *
 * @param input      le numéro, tel qu'il a été saisi ou stocké
 * @param operator   opérateur connu par ailleurs. Sert à convertir un ancien
 *                    numéro à 8 chiffres, qui ne porte pas cette information.
 */
export function parse(
  input: unknown,
  operator?: Operator,
): ParsedNumber {
  const empty: ParsedNumber = {
    valid: false, national: null, international: null, matchKey: null, legacyFormat: false,
  };

  let n = digits(input);
  if (!n) return { ...empty, reason: 'aucun chiffre' };

  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith(COUNTRY_CODE)) n = n.slice(COUNTRY_CODE.length);

  // ancien format : 8 chiffres, sans préfixe opérateur
  if (n.length === LENGTH_LEGACY) {
    // Les deux premiers chiffres de l ancien numéro portent l opérateur
    // (01-03 Moov, 04-06 MTN, 07-09 Orange, plus les tranches MTN en 4x-9x).
    // On peut donc convertir sans que l appelant ait à le préciser.
    // Un fixe d'avant 2021 (20-25 Abidjan, 30-36 intérieur) était forcément
    // Côte d'Ivoire Télécom, devenu Orange : il prend « 27 ». On le traite avant
    // les mobiles, car la tranche « 21 » existe des deux côtés du plan.
    if (!operator && LEGACY_LANDLINE_RANGES.includes(n.slice(0, 2))) {
      const nationalFixe = '27' + n;
      return {
        valid: true,
        national: nationalFixe,
        international: `+${COUNTRY_CODE}${nationalFixe}`,
        matchKey: n,
        legacyFormat: true,
      };
    }

    operator = operator ?? LEGACY_TO_OPERATOR[n.slice(0, 2)];
    if (!operator) {
      return {
        ...empty,
        matchKey: n,
        legacyFormat: true,
        reason: "ancien format à 8 chiffres, et la tranche « " + n.slice(0, 2) +
          " » n est attribuée à aucun opérateur connu. Passez l opérateur en " +
          "second argument pour convertir malgré tout.",
      };
    }
    const prefixe = Object.entries(PREFIXES)
      .find(([, v]) => v.operator === operator && v.type === 'mobile')?.[0];
    if (!prefixe) return { ...empty, matchKey: n, legacyFormat: true, reason: `opérateur inconnu : ${operator}` };
    const national = prefixe + n;
    return {
      valid: true,
      national,
      international: `+${COUNTRY_CODE}${national}`,
      matchKey: n,
      legacyFormat: true,
    };
  }

  if (n.length !== LENGTH_CURRENT) {
    return { ...empty, matchKey: matchKey(n), reason: `${n.length} chiffres : ni 8 ni 10` };
  }

  const prefixe = n.slice(0, 2);
  if (!PREFIXES[prefixe]) {
    return {
      ...empty,
      matchKey: n.slice(-LENGTH_LEGACY),
      reason: `préfixe « ${prefixe} » hors du plan ivoirien`,
    };
  }

  return {
    valid: true,
    national: n,
    international: `+${COUNTRY_CODE}${n}`,
    matchKey: n.slice(-LENGTH_LEGACY),
    legacyFormat: false,
  };
}

/** Raccourci : le numéro est-il un numéro ivoirien reconnaissable ? */
export const isValid = (input: unknown): boolean => parse(input).valid;
