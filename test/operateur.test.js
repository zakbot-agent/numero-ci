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

test('tranche pour MTN sur un ancien numéro, grâce à ses préfixes publiés', () => {
  const r = operateur('05462020');       // 05 figure dans la liste MTN
  assert.equal(r.operateur, 'mtn');
  assert.equal(r.source, 'ancien-prefixe-mtn');
});

test('ne devine PAS l\'opérateur quand il ne peut pas le savoir', () => {
  // 57 n'est pas dans la liste publiée par MTN, et ni Orange ni Moov ne publient
  // les leurs : répondre « Orange » ici serait une invention
  const r = operateur('57223637');
  assert.equal(r.operateur, null);
  assert.equal(r.source, 'inconnu');
  assert.equal(estMobile('57223637'), null);
});

test('dit toujours d\'où vient sa réponse', () => {
  assert.equal(operateur('0757223637').source, 'prefixe');
  assert.equal(operateur('05462020').source, 'ancien-prefixe-mtn');
  assert.equal(operateur('quelque chose').source, 'inconnu');
});

test('un préfixe hors plan ne renvoie pas d\'opérateur', () => {
  assert.equal(nomOperateur('0357223637'), null);   // 03 n'existe pas
  assert.equal(nomOperateur('9999999999'), null);
});
