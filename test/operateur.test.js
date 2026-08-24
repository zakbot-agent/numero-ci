import test from 'node:test';
import assert from 'node:assert/strict';
import { operator, operatorName, isMobile } from '../dist/operateur.js';

test('reconnaît l\'opérateur au préfixe du nouveau format', () => {
  assert.equal(operatorName('0157223637'), 'moov');
  assert.equal(operatorName('0557223637'), 'mtn');
  assert.equal(operatorName('0757223637'), 'orange');
  assert.equal(operatorName('+225 07 57 22 36 37'), 'orange');
});

test('distingue mobile et fixe', () => {
  assert.equal(operator('0757223637').type, 'mobile');
  assert.equal(operator('2757223637').type, 'landline');
  assert.equal(isMobile('0557223637'), true);
  assert.equal(isMobile('2557223637'), false);
});

test('reconnaît l\'opérateur d\'un ancien numéro à 8 chiffres', () => {
  // tranches en 0x : 01-03 Moov, 04-06 MTN, 07-09 Orange
  assert.equal(operator('01223344').operator, 'moov');
  assert.equal(operator('05462020').operator, 'mtn');
  assert.equal(operator('07223637').operator, 'orange');
  // tranches supplémentaires publiées par MTN
  assert.equal(operator('45223637').operator, 'mtn');
  assert.equal(operator('96223637').operator, 'mtn');
  assert.equal(operator('05462020').source, 'legacy-prefix');
});

test('ne devine PAS sur une tranche qui n\'est attribuée nulle part', () => {
  // 57 ne figure ni dans les tranches en 0x ni dans la liste MTN
  const r = operator('57223637');
  assert.equal(r.operator, null);
  assert.equal(r.source, 'unknown');
  assert.equal(isMobile('57223637'), null);
});

test('dit toujours d\'où vient sa réponse', () => {
  assert.equal(operator('0757223637').source, 'prefix');
  assert.equal(operator('05462020').source, 'legacy-prefix');
  assert.equal(operator('quelque chose').source, 'unknown');
});

test('un préfixe hors plan ne renvoie pas d\'opérateur', () => {
  assert.equal(operatorName('0357223637'), null);   // 03 n'existe pas
  assert.equal(operatorName('9999999999'), null);
});
