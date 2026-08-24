import test from 'node:test';
import assert from 'node:assert/strict';
import { analyser, cle, estValide, chiffres } from '../dist/normaliser.js';

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
    const r = analyser(ecriture);
    assert.equal(r.valide, true, `refusé : ${ecriture}`);
    assert.equal(r.national, attendu, `mal normalisé : ${ecriture}`);
    assert.equal(r.international, '+2250757223637');
  }
});

test('un tiret insécable ne fait pas échouer la lecture', () => {
  // les modèles de langage et certains CRM produisent U+2011 au lieu du tiret simple
  assert.equal(analyser('07‑57‑22‑36‑37').national, '0757223637');
});

test('reconnaît le type de ligne par le préfixe', () => {
  assert.equal(analyser('0157223637').valide, true);  // Moov mobile
  assert.equal(analyser('0557223637').valide, true);  // MTN mobile
  assert.equal(analyser('2757223637').valide, true);  // Orange fixe
});

test('refuse ce qui n\'est pas ivoirien, sans prétendre trancher', () => {
  assert.equal(analyser('0357223637').valide, false); // 03 hors plan
  assert.equal(analyser('').valide, false);
  assert.equal(analyser(null).valide, false);
  assert.equal(analyser('12345').valide, false);
});

test('un ancien numéro à 8 chiffres est signalé, pas deviné', () => {
  const r = analyser('57223637');
  assert.equal(r.valide, false);
  assert.equal(r.ancienFormat, true);
  assert.equal(r.cle, '57223637');
  assert.match(r.raison, /opérateur/);
});

test('avec l\'opérateur, l\'ancien numéro est converti', () => {
  assert.equal(analyser('57223637', 'orange').national, '0757223637');
  assert.equal(analyser('57223637', 'mtn').national, '0557223637');
  assert.equal(analyser('57223637', 'moov').national, '0157223637');
});

test('la clé rapproche les deux époques du même numéro', () => {
  // le cas réel : un carnet WhatsApp d'avant 2021 et une base scrapée aujourd'hui
  const ancien = cle('22557223637');      // +225 5722 3637, ancien format
  const nouveau = cle('+225 07 57 22 36 37');
  assert.equal(ancien, nouveau, 'les deux écritures devraient se rejoindre');
  assert.equal(ancien, '57223637');
});

test('la clé écarte ce qui n\'est pas un numéro', () => {
  assert.equal(cle('120363043211234567@g.us'), null);  // identifiant de groupe WhatsApp
  assert.equal(cle('123'), null);
  assert.equal(cle(''), null);
});

test('estValide et chiffres', () => {
  assert.equal(estValide('07 57 22 36 37'), true);
  assert.equal(estValide('99 99'), false);
  assert.equal(chiffres('+225 (07) 57-22.36 37'), '2250757223637');
});

test('un ancien numéro se convertit seul quand sa tranche est connue', () => {
  // 07 = Orange à l'époque des 8 chiffres → préfixe 07 ajouté devant
  assert.equal(analyser('07223637').national, '0707223637');
  assert.equal(analyser('01223344').national, '0101223344');   // Moov
  assert.equal(analyser('05462020').national, '0505462020');   // MTN
});

test('une tranche non attribuée reste non convertie, et le dit', () => {
  const r = analyser('57223637');
  assert.equal(r.valide, false);
  assert.match(r.raison, /57/);
});
