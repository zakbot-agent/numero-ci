import test from 'node:test';
import assert from 'node:assert/strict';
import { format, whatsappLink } from '../dist/formater.js';

test('format national : cinq groupes de deux chiffres', () => {
  assert.equal(format('+2250757223637'), '07 57 22 36 37');
  assert.equal(format('0757223637', 'national'), '07 57 22 36 37');
});

test('formats international, compact et WhatsApp', () => {
  assert.equal(format('07 57 22 36 37', 'international'), '+2250757223637');
  assert.equal(format('07 57 22 36 37', 'compact'), '0757223637');
  assert.equal(format('07 57 22 36 37', 'wa'), 'https://wa.me/2250757223637');
});

test('un numéro non reconnaissable rend null, jamais une chaîne à moitié juste', () => {
  assert.equal(format('12345'), null);
  assert.equal(format(''), null);
  assert.equal(format('0357223637'), null);
});

test('un ancien numéro se formate si on donne l\'opérateur', () => {
  assert.equal(format('57223637', 'national'), null);
  assert.equal(format('57223637', 'national', 'orange'), '07 57 22 36 37');
});

test('lien WhatsApp, avec message optionnel', () => {
  assert.equal(whatsappLink('0757223637'), 'https://wa.me/2250757223637');
  assert.match(whatsappLink('0757223637', 'Bonjour !'), /\?text=Bonjour%20!$/);
  assert.equal(whatsappLink('rien'), null);
});
