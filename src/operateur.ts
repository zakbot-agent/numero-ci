import { ANCIEN_VERS_OPERATEUR, INDICATIF, LONGUEUR_ANCIEN, PREFIXES } from './plan.js';
import type { Operateur, TypeLigne } from './plan.js';
import { chiffres } from './normaliser.js';

export interface Ligne {
  operateur: Operateur | null;
  type: TypeLigne | null;
  /** comment l'opérateur a été déterminé — utile pour décider si on s'y fie */
  source: 'prefixe' | 'ancien-prefixe' | 'inconnu';
}

/**
 * Détermine l'opérateur et le type de ligne.
 *
 * Depuis 2021, le préfixe à deux chiffres le dit sans ambiguïté : 01 Moov,
 * 05 MTN, 07 Orange pour le mobile ; 21, 25, 27 pour le fixe.
 *
 * Pour un ancien numéro à 8 chiffres, l'opérateur se lit dans les deux premiers
 * chiffres : 01-02-03 Moov, 04-05-06 MTN, 07-08-09 Orange, plus les tranches en
 * 4x à 9x que MTN publie. Voir ANCIENS_PREFIXES dans plan.ts pour les sources.
 *
 * Une tranche qui ne figure nulle part renvoie `null`, délibérément : deviner
 * ferait passer un paiement Mobile Money chez le mauvais opérateur, ou envoyer
 * un SMS par la mauvaise passerelle. Une réponse « je ne sais pas » se traite ;
 * une réponse fausse, non.
 */
export function operateur(entree: unknown): Ligne {
  let n = chiffres(entree);
  if (n.startsWith('00')) n = n.slice(2);
  if (n.startsWith(INDICATIF)) n = n.slice(INDICATIF.length);

  if (n.length === 10) {
    const p = PREFIXES[n.slice(0, 2)];
    if (p) return { operateur: p.operateur, type: p.type, source: 'prefixe' };
    return { operateur: null, type: null, source: 'inconnu' };
  }

  if (n.length === LONGUEUR_ANCIEN) {
    const op = ANCIEN_VERS_OPERATEUR[n.slice(0, 2)];
    if (op) return { operateur: op, type: 'mobile', source: 'ancien-prefixe' };
    // tranche inconnue : on ne devine pas.
    return { operateur: null, type: null, source: 'inconnu' };
  }

  return { operateur: null, type: null, source: 'inconnu' };
}

/** Raccourci quand seul l'opérateur compte. */
export const nomOperateur = (entree: unknown): Operateur | null => operateur(entree).operateur;

/** Le numéro est-il une ligne mobile ? `null` si on ne peut pas le dire. */
export function estMobile(entree: unknown): boolean | null {
  const l = operateur(entree);
  return l.type === null ? null : l.type === 'mobile';
}
