import { LEGACY_TO_OPERATOR, LEGACY_LANDLINE_RANGES, COUNTRY_CODE, LENGTH_LEGACY, PREFIXES } from './plan.js';
import type { Operator, LineType } from './plan.js';
import { digits } from './normaliser.js';

export interface LineInfo {
  operator: Operator | null;
  type: LineType | null;
  /** comment l'opérateur a été déterminé — utile pour décider si on s'y fie */
  source: 'prefix' | 'legacy-prefix' | 'unknown';
}

/**
 * Détermine l'opérateur et le type de ligne.
 *
 * Depuis 2021, le préfixe à deux chiffres le dit sans ambiguïté : 01 Moov,
 * 05 MTN, 07 Orange pour le mobile ; 21, 25, 27 pour le fixe.
 *
 * Pour un ancien numéro à 8 chiffres, l'opérateur se lit dans les deux premiers
 * chiffres : 01-02-03 Moov, 04-05-06 MTN, 07-08-09 Orange, plus les tranches en
 * 4x à 9x que MTN publie. Les tranches 20-25 et 30-36 sont des FIXES : elles
 * appartenaient toutes à Côte d'Ivoire Télécom, devenu Orange.
 * Voir LEGACY_PREFIXES et LEGACY_LANDLINE_RANGES dans plan.ts pour les sources.
 *
 * Une tranche qui ne figure nulle part renvoie `null`, délibérément : deviner
 * ferait passer un paiement Mobile Money chez le mauvais opérateur, ou envoyer
 * un SMS par la mauvaise passerelle. Une réponse « je ne sais pas » se traite ;
 * une réponse fausse, non.
 */
export function operator(input: unknown): LineInfo {
  let n = digits(input);
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith(COUNTRY_CODE)) n = n.slice(COUNTRY_CODE.length);

  if (n.length === 10) {
    const p = PREFIXES[n.slice(0, 2)];
    if (p) return { operator: p.operator, type: p.type, source: 'prefix' };
    return { operator: null, type: null, source: 'unknown' };
  }

  if (n.length === LENGTH_LEGACY) {
    // Le fixe d'avant 2021 appartenait à Côte d'Ivoire Télécom, devenu Orange.
    if (LEGACY_LANDLINE_RANGES.includes(n.slice(0, 2))) {
      return { operator: 'orange', type: 'landline', source: 'legacy-prefix' };
    }
    const op = LEGACY_TO_OPERATOR[n.slice(0, 2)];
    if (op) return { operator: op, type: 'mobile', source: 'legacy-prefix' };
    // tranche inconnue : on ne devine pas.
    return { operator: null, type: null, source: 'unknown' };
  }

  return { operator: null, type: null, source: 'unknown' };
}

/** Raccourci quand seul l'opérateur compte. */
export const operatorName = (input: unknown): Operator | null => operator(input).operator;

/** Le numéro est-il une ligne mobile ? `null` si on ne peut pas le dire. */
export function isMobile(input: unknown): boolean | null {
  const l = operator(input);
  return l.type === null ? null : l.type === 'mobile';
}
