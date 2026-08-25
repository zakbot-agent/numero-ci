import test from 'node:test';
import assert from 'node:assert/strict';
import { parse, matchKey, isValid, digits } from '../dist/normaliser.js';
import { isMobile, operatorName } from '../dist/operateur.js';

test('accepte toutes les écritures d\'un même numéro', () => {
  const attendu = '0757223637';
  for (const ecriture of [
    '0757223637',
    '07 57 22 36 37',
    '07-57-22-36-37',
    '07.57.22.36.37',
    '+225 07 57 22 36 37',
    '+2250757223637',
    '00225 0757223637',
    '(07) 57 22 36 37',
  ]) {
    const r = parse(ecriture);
    assert.equal(r.valid, true, `refusé : ${ecriture}`);
    assert.equal(r.national, attendu, `mal normalisé : ${ecriture}`);
    assert.equal(r.international, '+2250757223637');
  }
});

test('un tiret insécable ne fait pas échouer la lecture', () => {
  // les modèles de langage et certains CRM produisent U+2011 au lieu du tiret simple
  assert.equal(parse('07‑57‑22‑36‑37').national, '0757223637');
});

test('reconnaît le type de ligne par le préfixe', () => {
  assert.equal(parse('0157223637').valid, true);  // Moov mobile
  assert.equal(parse('0557223637').valid, true);  // MTN mobile
  assert.equal(parse('2757223637').valid, true);  // Orange fixe
});

test('refuse ce qui n\'est pas ivoirien, sans prétendre trancher', () => {
  assert.equal(parse('0357223637').valid, false); // 03 hors plan
  assert.equal(parse('').valid, false);
  assert.equal(parse(null).valid, false);
  assert.equal(parse('12345').valid, false);
});

test('un ancien numéro à 8 chiffres est signalé, pas deviné', () => {
  const r = parse('57223637');
  assert.equal(r.valid, false);
  assert.equal(r.legacyFormat, true);
  assert.equal(r.matchKey, '57223637');
  assert.match(r.reason, /opérateur/);
});

test('avec l\'opérateur, l\'ancien numéro est converti', () => {
  assert.equal(parse('57223637', 'orange').national, '0757223637');
  assert.equal(parse('57223637', 'mtn').national, '0557223637');
  assert.equal(parse('57223637', 'moov').national, '0157223637');
});

test('la clé rapproche les deux époques du même numéro', () => {
  // le cas réel : un carnet WhatsApp d'avant 2021 et une base scrapée aujourd'hui
  const ancien = matchKey('22557223637');      // +225 5722 3637, ancien format
  const nouveau = matchKey('+225 07 57 22 36 37');
  assert.equal(ancien, nouveau, 'les deux écritures devraient se rejoindre');
  assert.equal(ancien, '57223637');
});

test('la clé écarte ce qui n\'est pas un numéro', () => {
  assert.equal(matchKey('120363043211234567@g.us'), null);  // identifiant de groupe WhatsApp
  assert.equal(matchKey('123'), null);
  assert.equal(matchKey(''), null);
});

test('estValide et chiffres', () => {
  assert.equal(isValid('07 57 22 36 37'), true);
  assert.equal(isValid('99 99'), false);
  assert.equal(digits('+225 (07) 57-22.36 37'), '2250757223637');
});

test('un ancien numéro se convertit seul quand sa tranche est connue', () => {
  // 07 = Orange à l'époque des 8 chiffres → préfixe 07 ajouté devant
  assert.equal(parse('07223637').national, '0707223637');
  assert.equal(parse('01223344').national, '0101223344');   // Moov
  assert.equal(parse('05462020').national, '0505462020');   // MTN
});

test('une tranche non attribuée reste non convertie, et le dit', () => {
  const r = parse('57223637');
  assert.equal(r.valid, false);
  assert.match(r.reason, /57/);
});

// ── Fixes d'avant 2021 : ils prennent « 27 » (ex-Côte d'Ivoire Télécom) ──
// Cas réel : l'hôtel Cannelle de San-Pédro apparaît sous les deux écritures.
test('un fixe à 8 chiffres de San-Pédro devient un 27…', () => {
  const r = parse('34710539');
  assert.equal(r.valid, true);
  assert.equal(r.national, '2734710539');
  assert.equal(r.legacyFormat, true);
});

test('un fixe à 8 chiffres d’Abidjan devient un 27…', () => {
  assert.equal(parse('22411692').national, '2722411692');
});

test('un fixe de Korhogo aussi', () => {
  assert.equal(parse('+225 36864750').national, '2736864750');
});

test('un fixe ancien est reconnu comme fixe, pas comme mobile', () => {
  assert.equal(isMobile('34710539'), false);
  assert.equal(operatorName('34710539'), 'orange');
});

test('une tranche hors plan reste refusée plutôt que devinée', () => {
  const r = parse('88007321');
  assert.equal(r.valid, false);
  assert.match(r.reason, /aucun opérateur connu/);
});
