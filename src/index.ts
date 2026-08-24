/**
 * numero-ci — Ivorian phone numbers, without surprises.
 *
 * Three things this package does that general-purpose libraries do not:
 *  · it matches a pre-2021 number (8 digits) with its current form (10 digits),
 *    which is what lets you deduplicate a contact list where both coexist;
 *  · it tells you the operator — Orange, MTN, Moov — from the number itself;
 *  · it refuses to guess when it cannot know, instead of returning a plausible
 *    but wrong answer.
 */
export { COUNTRY_CODE, PREFIXES, LEGACY_PREFIXES, LEGACY_PREFIXES_MTN, LEGACY_TO_OPERATOR, LENGTH_CURRENT, LENGTH_LEGACY } from './plan.js';
export type { Operator, LineType } from './plan.js';

export { parse, isValid, matchKey, digits } from './normaliser.js';
export type { ParsedNumber } from './normaliser.js';

export { operator, operatorName, isMobile } from './operateur.js';
export type { LineInfo } from './operateur.js';

export { format, whatsappLink } from './formater.js';
export type { Format } from './formater.js';
