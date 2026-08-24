import { analyser } from './normaliser.js';
import type { Operateur } from './plan.js';

/**
 * Formats d'affichage.
 *
 * `national` est celui qu'on écrit et qu'on lit en Côte d'Ivoire : cinq groupes
 * de deux chiffres. `international` sert aux systèmes ; `wa` construit un lien
 * WhatsApp, qui attend l'indicatif sans le « + » ni les espaces.
 */
export type Format = 'national' | 'international' | 'compact' | 'wa';

/**
 * @returns la chaîne formatée, ou null si le numéro n'est pas reconnaissable.
 *          On ne renvoie jamais une chaîne à moitié juste : un numéro affiché
 *          de travers est composé de travers.
 */
export function formater(
  entree: unknown,
  format: Format = 'national',
  operateur?: Operateur,
): string | null {
  const r = analyser(entree, operateur);
  if (!r.valide || !r.national) return null;

  switch (format) {
    case 'compact':
      return r.national;
    case 'international':
      return r.international;
    case 'wa':
      // wa.me n'accepte ni « + » ni espaces
      return `https://wa.me/225${r.national}`;
    case 'national':
    default:
      return r.national.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }
}

/** Lien WhatsApp direct, avec message pré-rempli optionnel. */
export function lienWhatsApp(entree: unknown, message?: string, operateur?: Operateur): string | null {
  const base = formater(entree, 'wa', operateur);
  if (!base) return null;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
