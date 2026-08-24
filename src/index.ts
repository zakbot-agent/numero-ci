/**
 * numero-ci — les numéros de téléphone ivoiriens, sans surprise.
 *
 * Trois choses que ce paquet fait et que les bibliothèques généralistes ne font
 * pas :
 *  · il rapproche un numéro d'avant 2021 (8 chiffres) de son équivalent
 *    d'aujourd'hui (10 chiffres), ce qui permet de dédoublonner une base de
 *    contacts où les deux formats cohabitent ;
 *  · il donne l'opérateur — Orange, MTN, Moov — à partir du numéro ;
 *  · il refuse de deviner quand il ne peut pas savoir, au lieu de rendre une
 *    réponse plausible et fausse.
 */
export { INDICATIF, PREFIXES, ANCIENS_PREFIXES_MTN } from './plan.js';
export type { Operateur, TypeLigne } from './plan.js';

export { analyser, estValide, cle, chiffres } from './normaliser.js';
export type { NumeroAnalyse } from './normaliser.js';

export { operateur, nomOperateur, estMobile } from './operateur.js';
export type { Ligne } from './operateur.js';

export { formater, lienWhatsApp } from './formater.js';
export type { Format } from './formater.js';
