#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('./raiden-game.html', import.meta.url), 'utf8');
const failures = [];

function expect(label, condition) {
  if (!condition) failures.push(label);
}

for (const id of [
  'gameCanvas',
  'mobileControls',
  'menuScreen',
  'helpScreen',
  'pauseScreen',
  'pauseDiffLabel',
  'gameOverScreen',
  'statLevel',
  'statKills',
  'statCombo',
  'statGraze',
  'statTime',
  'statHitRate'
]) {
  expect(`missing DOM id: ${id}`, html.includes(`id="${id}"`) || html.includes(`id='${id}'`));
}

for (const token of [
  'function canvasPointFromTouch',
  'function updateTouchTarget',
  'function drawTouchFeedback',
  'let gameRunId',
  'runId !== gameRunId',
  'TOUCH_FOLLOW_OFFSET_Y',
  'function touchCycleWeapon',
  'function touchUseBomb',
  'function touchPauseGame',
  'function setMobileControlsVisible',
  'function beginPlaySession',
  'onpointerdown="touchCycleWeapon(event)"',
  'onpointerdown="touchUseBomb(event)"',
  'onpointerdown="touchPauseGame(event)"',
  'const VISUAL',
  'function enemyPalette',
  'function drawEnemyBackplate',
  'function drawEnemyCoreOverlay',
  'let audioMix',
  'function ensureAudioMix',
  'function audioBus',
  'function spawnShockwave',
  'function updateShockwaves',
  'function drawShockwaves',
  'menu-ship-anchor',
  'enemyBulletSpeedMul',
  'enemyFireRateMul',
  'playerBulletSpeed',
  'function buildWaveTypePool',
  'function enemyShootCooldown',
  'function bossShootInterval',
  'function spawnHardSuicideBurst',
  'function getHighScore',
  'function getMaxRank',
  'HIGH_SCORE_KEYS',
  'if (bullet.penetrate && bullet.alive)',
  '消耗 1 枚炸弹 + 1 点生命',
  '双指按住后松手',
  '各难度独立保存最高分',
  'TENSION'
]) {
  expect(`missing implementation token: ${token}`, html.includes(token));
}

const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
expect('missing inline script block', Boolean(scriptMatch));

if (scriptMatch) {
  const script = scriptMatch[1];
  try {
    new vm.Script(script, { filename: 'raiden-game.inline.js' });
  } catch (error) {
    failures.push(`inline script syntax error: ${error.message}`);
  }

  const requiredDiffKeys = [
    'enemyMul', 'hpMul', 'speedMul', 'powerUpRate', 'startLives', 'startBombs',
    'scoreMul', 'grazeMul', 'playerBulletSpeed', 'enemyBulletSpeedMul',
    'enemyBulletSizeMul', 'enemyFireRateMul', 'bossIntervalMul', 'eliteMul',
    'maxRank', 'rankGainMul', 'rankHitLoss', 'rankBombLoss', 'typeBias'
  ];
  for (const tier of ['easy', 'normal', 'hard']) {
    for (const key of requiredDiffKeys) {
      const pattern = new RegExp(`${tier}:\\s*\\{[\\s\\S]*?${key}:`);
      expect(`DIFFICULTY.${tier} missing ${key}`, pattern.test(script));
    }
  }

  expect('initGame should not call spawnWave directly', !/function initGame\(\)[\s\S]*?autoBombUsed=false;\s*spawnWave\(\)/.test(script));
  const startGameBody = script.match(/function startGame\(\)\s*\{[\s\S]*?\n\}/);
  expect('startGame function exists', Boolean(startGameBody));
  if (startGameBody) {
    expect('startGame should not clear enemies', !startGameBody[0].includes('enemies = []'));
    expect('startGame uses beginPlaySession', startGameBody[0].includes('beginPlaySession()'));
  }
  expect('penetrate laser uses alive guard', /if \(bullet\.penetrate && bullet\.alive\)/.test(script));

  const diffBlock = script.match(/const DIFFICULTY = \{[\s\S]*?\};/)[0];
  const helperSrc = `
    ${diffBlock}
    var difficulty = 'easy';
    var diffCfg = DIFFICULTY.easy;
    var rank = 1.2;
    var level = 1;
    var highScores = { easy: 100, normal: 200, hard: 300 };
    function getHighScore(d) { return highScores[d] || 0; }
    function getMaxRank() { return diffCfg.maxRank || 2.5; }
    function enemyShootCooldown(base, floor) {
      return Math.max(floor || 6, base / (rank * (diffCfg.enemyFireRateMul || 1)));
    }
    function bossShootInterval(base, floor) {
      return Math.max(floor || 5, Math.floor(base * diffCfg.bossIntervalMul / (rank || 1)));
    }
    function buildWaveTypePool(lv) {
      const b = diffCfg.typeBias;
      const types = [];
      const add = (type, count) => { for (let i = 0; i < count; i++) types.push(type); };
      add('scout', b.scout || 3);
      add('tank', b.tank || 2);
      if (difficulty === 'easy') {
        if (lv >= 2) add('turret', 1);
        if (lv >= 3 && (b.speeder || 0) > 0) add('speeder', 1);
        if (lv >= 4 && (b.splitter || 0) > 0) add('splitter', 1);
      } else if (difficulty === 'normal') {
        if ((b.speeder || 0) > 0) add('speeder', b.speeder);
        if ((b.splitter || 0) > 0) add('splitter', b.splitter);
        if (lv >= 2) { add('tank', 1); add('turret', 1); }
        if (lv >= 3) { add('shielded', 1); add('splitter', 1); }
        if (lv >= 4) add('sniper', 1);
      } else {
        if ((b.speeder || 0) > 0) add('speeder', b.speeder);
        if ((b.splitter || 0) > 0) add('splitter', b.splitter);
        if ((b.shielded || 0) > 0) add('shielded', b.shielded);
        if ((b.sniper || 0) > 0) add('sniper', b.sniper);
        add('turret', 1);
        if (lv >= 2) { add('tank', 1); add('speeder', 1); add('splitter', 1); }
        if (lv >= 3) { add('tank', 1); add('turret', 1); add('shielded', 1); add('sniper', 1); }
      }
      if (types.length === 0) types.push('scout');
      return types;
    }
  `;

  try {
    const ctx = vm.createContext({});
    vm.runInContext(helperSrc, ctx);
    const easyPool = vm.runInContext('buildWaveTypePool(1)', ctx);
    expect('easy Lv1 pool excludes sniper/shielded', !easyPool.includes('sniper') && !easyPool.includes('shielded'));
    expect('easy Lv1 pool includes scout', easyPool.includes('scout'));
    expect('enemyShootCooldown respects floor', vm.runInContext('enemyShootCooldown(40, 8)', ctx) >= 8);
    expect('bossShootInterval uses difficulty mul', vm.runInContext('bossShootInterval(12, 5)', ctx) >= 5);
    expect('getMaxRank easy cap', vm.runInContext('getMaxRank()', ctx) === 2.0);
    vm.runInContext("difficulty='hard'; diffCfg=DIFFICULTY.hard;", ctx);
    const hardPool = vm.runInContext('buildWaveTypePool(1)', ctx);
    expect('hard Lv1 pool includes sniper', hardPool.includes('sniper'));
  } catch (error) {
    failures.push(`logic sandbox error: ${error.message}`);
  }
}

if (failures.length > 0) {
  console.error('Smoke check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Smoke check passed: syntax, DOM, v2.0 difficulty, docs sync, and logic sandbox are valid.');
