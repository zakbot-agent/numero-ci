import test from 'node:test';
import assert from 'node:assert/strict';
import { operateur, nomOperateur, estMobile } from '../dist/operateur.js';

test('reconnaît l\'opérateur au préfixe du nouveau format', () => {
  assert.equal(nomOperateur('0157223637'), 'moov');
  assert.equal(nomOperateur('0557223637'), 'mtn');
  assert.equal(nomOperateur('0757223637'), 'orange');
  assert.equal(nomOperateur('+225 07 57 22 36 37'), 'orange');
});

test('distingue mobile et fixe', () => {
  assert.equal(operateur('0757223637').type, 'mobile');
  assert.equal(operateur('2757223637').type, 'fixe');
  assert.equal(estMobile('0557223637'), true);
  assert.equal(estMobile('2557223637'), false);
});

test('reconnaît l\'opérateur d\'un ancien numéro à 8 chiffres', () => {
  // tranches en 0x : 01-03 Moov, 04-06 MTN, 07-09 Orange
  assert.equal(operateur('01223344').operateur, 'moov');
  assert.equal(operateur('05462020').operateur, 'mtn');
  assert.equal(operateur('07223637').operateur, 'orange');
  // tranches supplémentaires publiées par MTN
  assert.equal(operateur('45223637').operateur, 'mtn');
  assert.equal(operateur('96223637').operateur, 'mtn');
  assert.equal(operateur('05462020').source, 'ancien-prefixe');
});

test('ne devine PAS sur une tranche qui n\'est attribuée nulle part', () => {
  // 57 ne figure ni dans les tranches en 0x ni dans la liste MTN
  const r = operateur('57223637');
  assert.equal(r.operateur, null);
  assert.equal(r.source, 'inconnu');
  assert.equal(estMobile('57223637'), null);
});

test('dit toujours d\'où vient sa réponse', () => {
  assert.equal(operateur('0757223637').source, 'prefixe');
  assert.equal(operateur('05462020').source, 'ancien-prefixe');
  assert.equal(operateur('quelque chose').source, 'inconnu');
});

test('un préfixe hors plan ne renvoie pas d\'opérateur', () => {
  assert.equal(nomOperateur('0357223637'), null);   // 03 n'existe pas
  assert.equal(nomOperateur('9999999999'), null);
});
