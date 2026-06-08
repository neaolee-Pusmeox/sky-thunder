// add_touch.js - Add mobile touch controls to Raiden game
const fs = require('fs');
let c = fs.readFileSync('raiden-game.html', 'utf8');
const CRLF = '\r\n';
let fixes = 0;
const SQ = "'"; // single quote

// ===== 1. Add touch control CSS =====
const styleEnd = c.lastIndexOf('</style>');

const touchCSS = CRLF + '/* ========== 触屏操控 ========== */' + CRLF +
  '#touchControls {' + CRLF +
  '  position: absolute;' + CRLF +
  '  bottom: 0; left: 0; right: 0; top: 0;' + CRLF +
  '  pointer-events: none;' + CRLF +
  '  z-index: 10;' + CRLF +
  '  display: none;' + CRLF +
  '}' + CRLF +
  '#touchControls.active {' + CRLF +
  '  display: block;' + CRLF +
  '}' + CRLF +
  '/* 虚拟摇杆 */' + CRLF +
  '#joyBase {' + CRLF +
  '  position: absolute;' + CRLF +
  '  bottom: 30px; left: 24px;' + CRLF +
  '  width: 130px; height: 130px;' + CRLF +
  '  border-radius: 50%;' + CRLF +
  '  background: radial-gradient(circle, rgba(0,255,255,0.08) 0%, rgba(0,100,255,0.05) 60%, rgba(0,50,200,0.02) 100%);' + CRLF +
  '  border: 2px solid rgba(0,200,255,0.25);' + CRLF +
  '  pointer-events: all;' + CRLF +
  '  touch-action: none;' + CRLF +
  '}' + CRLF +
  '#joyThumb {' + CRLF +
  '  position: absolute;' + CRLF +
  '  top: 50%; left: 50%;' + CRLF +
  '  width: 56px; height: 56px;' + CRLF +
  '  margin-left: -28px; margin-top: -28px;' + CRLF +
  '  border-radius: 50%;' + CRLF +
  '  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.25), rgba(0,200,255,0.18));' + CRLF +
  '  border: 2px solid rgba(0,255,255,0.4);' + CRLF +
  '  pointer-events: none;' + CRLF +
  '  transition: none;' + CRLF +
  '  box-shadow: 0 0 15px rgba(0,200,255,0.3);' + CRLF +
  '}' + CRLF +
  '/* 方向指示灯 */' + CRLF +
  '#dirIndicator {' + CRLF +
  '  position: absolute;' + CRLF +
  '  top: 50%; left: 50%;' + CRLF +
  '  width: 8px; height: 8px;' + CRLF +
  '  margin-left: -4px; margin-top: -4px;' + CRLF +
  '  border-radius: 50%;' + CRLF +
  '  background: rgba(0,255,255,0.6);' + CRLF +
  '  pointer-events: none;' + CRLF +
  '  box-shadow: 0 0 8px rgba(0,255,255,0.5);' + CRLF +
  '}' + CRLF +
  '/* 自动射击开关 */' + CRLF +
  '#autoShootToggle {' + CRLF +
  '  position: absolute;' + CRLF +
  '  bottom: 170px; right: 30px;' + CRLF +
  '  width: 60px; height: 34px;' + CRLF +
  '  background: rgba(255,255,255,0.06);' + CRLF +
  '  border: 2px solid rgba(0,255,255,0.3);' + CRLF +
  '  border-radius: 17px;' + CRLF +
  '  pointer-events: all;' + CRLF +
  '  touch-action: none;' + CRLF +
  '  cursor: pointer;' + CRLF +
  '  transition: all 0.2s;' + CRLF +
  '}' + CRLF +
  '#autoShootToggle.on {' + CRLF +
  '  background: rgba(0,255,100,0.15);' + CRLF +
  '  border-color: rgba(0,255,100,0.6);' + CRLF +
  '  box-shadow: 0 0 15px rgba(0,255,100,0.3);' + CRLF +
  '}' + CRLF +
  '#autoShootKnob {' + CRLF +
  '  position: absolute;' + CRLF +
  '  top: 3px; left: 3px;' + CRLF +
  '  width: 24px; height: 24px;' + CRLF +
  '  border-radius: 50%;' + CRLF +
  '  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.4), rgba(0,200,255,0.3));' + CRLF +
  '  border: 1px solid rgba(0,255,255,0.5);' + CRLF +
  '  pointer-events: none;' + CRLF +
  '  transition: left 0.2s;' + CRLF +
  '}' + CRLF +
  '#autoShootToggle.on #autoShootKnob {' + CRLF +
  '  left: 29px;' + CRLF +
  '  background: radial-gradient(circle at 35% 35%, rgba(255,255,255,0.5), rgba(0,255,100,0.4));' + CRLF +
  '  border-color: rgba(0,255,100,0.7);' + CRLF +
  '  box-shadow: 0 0 10px rgba(0,255,100,0.4);' + CRLF +
  '}' + CRLF +
  '#autoShootLabel {' + CRLF +
  '  position: absolute;' + CRLF +
  '  bottom: 175px; right: 100px;' + CRLF +
  '  color: rgba(255,255,255,0.5);' + CRLF +
  '  font-family: Orbitron, Courier New, monospace;' + CRLF +
  '  font-size: 9px;' + CRLF +
  '  letter-spacing: 1px;' + CRLF +
  '  pointer-events: none;' + CRLF +
  '  text-align: right;' + CRLF +
  '  line-height: 1.2;' + CRLF +
  '}' + CRLF +
  '#autoShootLabel span {' + CRLF +
  '  display: block;' + CRLF +
  '  color: rgba(0,255,200,0.7);' + CRLF +
  '  font-size: 10px;' + CRLF +
  '  font-weight: 700;' + CRLF +
  '}' + CRLF +
  '/* 炸弹按钮 */' + CRLF +
  '#bombBtn {' + CRLF +
  '  position: absolute;' + CRLF +
  '  bottom: 36px; right: 24px;' + CRLF +
  '  width: 72px; height: 72px;' + CRLF +
  '  border-radius: 50%;' + CRLF +
  '  background: radial-gradient(circle, rgba(255,60,40,0.2) 0%, rgba(255,100,40,0.1) 60%, rgba(200,40,20,0.05) 100%);' + CRLF +
  '  border: 2px solid rgba(255,80,40,0.4);' + CRLF +
  '  pointer-events: all;' + CRLF +
  '  touch-action: none;' + CRLF +
  '  display: flex;' + CRLF +
  '  align-items: center;' + CRLF +
  '  justify-content: center;' + CRLF +
  '  cursor: pointer;' + CRLF +
  '  box-shadow: 0 0 20px rgba(255,60,40,0.2);' + CRLF +
  '  transition: all 0.1s;' + CRLF +
  '}' + CRLF +
  '#bombBtn:active, #bombBtn.pressed {' + CRLF +
  '  background: radial-gradient(circle, rgba(255,120,40,0.4) 0%, rgba(255,160,60,0.25) 60%, rgba(255,80,20,0.15) 100%);' + CRLF +
  '  border-color: rgba(255,200,100,0.7);' + CRLF +
  '  box-shadow: 0 0 35px rgba(255,100,40,0.5);' + CRLF +
  '  transform: scale(0.92);' + CRLF +
  '}' + CRLF +
  '#bombBtn .bomb-icon {' + CRLF +
  '  font-size: 28px;' + CRLF +
  '  color: rgba(255,100,50,0.9);' + CRLF +
  '  text-shadow: 0 0 15px rgba(255,80,40,0.6);' + CRLF +
  '  pointer-events: none;' + CRLF +
  '  line-height: 1;' + CRLF +
  '}' + CRLF +
  '#bombBtn .bomb-count {' + CRLF +
  '  position: absolute;' + CRLF +
  '  top: -6px; right: -6px;' + CRLF +
  '  width: 22px; height: 22px;' + CRLF +
  '  border-radius: 50%;' + CRLF +
  '  background: rgba(0,0,0,0.6);' + CRLF +
  '  border: 1px solid rgba(255,200,100,0.5);' + CRLF +
  '  color: #ff0;' + CRLF +
  '  font-size: 11px;' + CRLF +
  '  font-family: Orbitron, monospace;' + CRLF +
  '  font-weight: 700;' + CRLF +
  '  text-align: center;' + CRLF +
  '  line-height: 20px;' + CRLF +
  '  pointer-events: none;' + CRLF +
  '}' + CRLF +
  '@media (max-width: 500px) {' + CRLF +
  '  #touchControls { display: none; }' + CRLF +
  '  #touchControls.active { display: block; }' + CRLF +
  '}' + CRLF +
  '@media (min-width: 501px) {' + CRLF +
  '  #touchControls { display: none !important; }' + CRLF +
  '}';

if (styleEnd > 0) {
  c = c.substring(0, styleEnd) + touchCSS + CRLF + c.substring(styleEnd);
  fixes++;
  console.log('1. Touch CSS inserted');
}

// ===== 2. Add touch control HTML =====
const scriptTag = c.indexOf('\n<script>');
const insertPoint = scriptTag > 0 ? c.lastIndexOf('</div>', scriptTag) : -1;

if (insertPoint > 0) {
  const lineStart = c.lastIndexOf('\n', insertPoint);
  const touchHTML = CRLF + '  <!-- 触屏操控 -->' + CRLF +
    '  <div id="touchControls">' + CRLF +
    '    <div id="joyBase">' + CRLF +
    '      <div id="dirIndicator"></div>' + CRLF +
    '      <div id="joyThumb"></div>' + CRLF +
    '    </div>' + CRLF +
    '    <div id="autoShootLabel">AUTO<br><span>FIRE</span></div>' + CRLF +
    '    <div id="autoShootToggle">' + CRLF +
    '      <div id="autoShootKnob"></div>' + CRLF +
    '    </div>' + CRLF +
    '    <div id="bombBtn">' + CRLF +
    '      <span class="bomb-icon">\u{1F4A3}</span>' + CRLF +
    '      <span class="bomb-count" id="bombCount">3</span>' + CRLF +
    '    </div>' + CRLF +
    '  </div>' + CRLF;
  c = c.substring(0, lineStart) + touchHTML + c.substring(lineStart);
  fixes++;
  console.log('2. Touch HTML inserted');
}

// ===== 3. Add touch control JS =====
const keyupEnd = c.indexOf("window.addEventListener('keyup'");
if (keyupEnd > 0) {
  let scan = keyupEnd;
  for (let i = 0; i < 2; i++) scan = c.indexOf('\n', scan) + 1;
  const afterLine = scan;

  const touchJS = CRLF + CRLF +
    '// ==================== 触屏操控系统 ====================' + CRLF +
    'let touchJoystick = { active: false, id: null, baseX: 0, baseY: 0, dx: 0, dy: 0 };' + CRLF +
    'let autoShootOn = false;' + CRLF +
    CRLF +
    'function updateTouchControlsVisibility() {' + CRLF +
    '  const tc = document.getElementById("touchControls");' + CRLF +
    '  if (!tc) return;' + CRLF +
    '  if (gameState === STATE.PLAYING) {' + CRLF +
    '    tc.classList.add("active");' + CRLF +
    '    const bc = document.getElementById("bombCount");' + CRLF +
    '    if (bc) bc.textContent = bombs;' + CRLF +
    '  } else {' + CRLF +
    '    tc.classList.remove("active");' + CRLF +
    '  }' + CRLF +
    '}' + CRLF +
    CRLF +
    'const joyBase = document.getElementById("joyBase");' + CRLF +
    'const joyThumb = document.getElementById("joyThumb");' + CRLF +
    'if (joyBase) {' + CRLF +
    '  joyBase.addEventListener("touchstart", e => {' + CRLF +
    '    e.preventDefault();' + CRLF +
    '    if (gameState !== STATE.PLAYING) return;' + CRLF +
    '    const t = e.changedTouches[0];' + CRLF +
    '    touchJoystick.active = true;' + CRLF +
    '    touchJoystick.id = t.identifier;' + CRLF +
    '    const rect = joyBase.getBoundingClientRect();' + CRLF +
    '    touchJoystick.baseX = rect.left + rect.width / 2;' + CRLF +
    '    touchJoystick.baseY = rect.top + rect.height / 2;' + CRLF +
    '    touchJoystick.dx = 0;' + CRLF +
    '    touchJoystick.dy = 0;' + CRLF +
    '  }, { passive: false });' + CRLF +
    CRLF +
    '  joyBase.addEventListener("touchmove", e => {' + CRLF +
    '    e.preventDefault();' + CRLF +
    '    if (!touchJoystick.active) return;' + CRLF +
    '    for (let i = 0; i < e.changedTouches.length; i++) {' + CRLF +
    '      if (e.changedTouches[i].identifier === touchJoystick.id) {' + CRLF +
    '        const t = e.changedTouches[i];' + CRLF +
    '        const dx = t.clientX - touchJoystick.baseX;' + CRLF +
    '        const dy = t.clientY - touchJoystick.baseY;' + CRLF +
    '        const dist = Math.sqrt(dx * dx + dy * dy);' + CRLF +
    '        const maxDist = 45;' + CRLF +
    '        if (dist > maxDist) {' + CRLF +
    '          touchJoystick.dx = (dx / dist) * maxDist;' + CRLF +
    '          touchJoystick.dy = (dy / dist) * maxDist;' + CRLF +
    '        } else { touchJoystick.dx = dx; touchJoystick.dy = dy; }' + CRLF +
    '        if (joyThumb) joyThumb.style.transform = `translate(${touchJoystick.dx}px, ${touchJoystick.dy}px)`;' + CRLF +
    '        break;' + CRLF +
    '      }' + CRLF +
    '    }' + CRLF +
    '  }, { passive: false });' + CRLF +
    CRLF +
    '  joyBase.addEventListener("touchend", e => {' + CRLF +
    '    e.preventDefault();' + CRLF +
    '    for (let i = 0; i < e.changedTouches.length; i++) {' + CRLF +
    '      if (e.changedTouches[i].identifier === touchJoystick.id) {' + CRLF +
    '        touchJoystick.active = false;' + CRLF +
    '        touchJoystick.dx = 0; touchJoystick.dy = 0;' + CRLF +
    '        if (joyThumb) joyThumb.style.transform = "translate(0px, 0px)";' + CRLF +
    '        break;' + CRLF +
    '      }' + CRLF +
    '    }' + CRLF +
    '  }, { passive: false });' + CRLF +
    CRLF +
    '  joyBase.addEventListener("touchcancel", e => {' + CRLF +
    '    touchJoystick.active = false;' + CRLF +
    '    touchJoystick.dx = 0; touchJoystick.dy = 0;' + CRLF +
    '    if (joyThumb) joyThumb.style.transform = "translate(0px, 0px)";' + CRLF +
    '  });' + CRLF +
    '}' + CRLF +
    CRLF +
    'const autoToggle = document.getElementById("autoShootToggle");' + CRLF +
    'if (autoToggle) {' + CRLF +
    '  autoToggle.addEventListener("touchstart", e => {' + CRLF +
    '    e.preventDefault();' + CRLF +
    '    if (gameState !== STATE.PLAYING) return;' + CRLF +
    '    autoShootOn = !autoShootOn;' + CRLF +
    '    autoToggle.classList.toggle("on", autoShootOn);' + CRLF +
    '  }, { passive: false });' + CRLF +
    '  autoToggle.addEventListener("click", e => {' + CRLF +
    '    if (gameState !== STATE.PLAYING) return;' + CRLF +
    '    autoShootOn = !autoShootOn;' + CRLF +
    '    autoToggle.classList.toggle("on", autoShootOn);' + CRLF +
    '  });' + CRLF +
    '}' + CRLF +
    CRLF +
    'const bombBtnEl = document.getElementById("bombBtn");' + CRLF +
    'if (bombBtnEl) {' + CRLF +
    '  bombBtnEl.addEventListener("touchstart", e => {' + CRLF +
    '    e.preventDefault();' + CRLF +
    '    if (gameState !== STATE.PLAYING || bombs <= 0) return;' + CRLF +
    '    bombBtnEl.classList.add("pressed");' + CRLF +
    '    useBomb();' + CRLF +
    '    if (!godMode) bombs--; else bombs = 5;' + CRLF +
    '    const bc = document.getElementById("bombCount");' + CRLF +
    '    if (bc) bc.textContent = bombs;' + CRLF +
    '    if (navigator.vibrate) navigator.vibrate(30);' + CRLF +
    '    setTimeout(() => bombBtnEl.classList.remove("pressed"), 200);' + CRLF +
    '  }, { passive: false });' + CRLF +
    '  bombBtnEl.addEventListener("click", e => {' + CRLF +
    '    if (gameState !== STATE.PLAYING || bombs <= 0) return;' + CRLF +
    '    useBomb();' + CRLF +
    '    if (!godMode) bombs--; else bombs = 5;' + CRLF +
    '    const bc = document.getElementById("bombCount");' + CRLF +
    '    if (bc) bc.textContent = bombs;' + CRLF +
    '  });' + CRLF +
    '}' + CRLF +
    CRLF +
    'function applyTouchJoystick() {' + CRLF +
    '  if (!touchJoystick.active) return;' + CRLF +
    '  const deadZone = 10;' + CRLF +
    '  const dx = Math.abs(touchJoystick.dx) > deadZone ? touchJoystick.dx : 0;' + CRLF +
    '  const dy = Math.abs(touchJoystick.dy) > deadZone ? touchJoystick.dy : 0;' + CRLF +
    '  keys["arrowleft"] = dx < -5; keys["arrowright"] = dx > 5;' + CRLF +
    '  keys["arrowup"] = dy < -5; keys["arrowdown"] = dy > 5;' + CRLF +
    '  keys["a"] = dx < -5; keys["d"] = dx > 5;' + CRLF +
    '  keys["w"] = dy < -5; keys["s"] = dy > 5;' + CRLF +
    '}' + CRLF +
    CRLF +
    'function applyAutoShoot() {' + CRLF +
    '  if (autoShootOn) { keys["j"] = true; keys["z"] = true; }' + CRLF +
    '}';

  c = c.substring(0, afterLine) + touchJS + c.substring(afterLine);
  fixes++;
  console.log('3. Touch JS inserted');
}

// ===== 4. Hook into game loop =====
const gameLoopCheck = '  if (gameState!==STATE.PLAYING) {';
const glIdx = c.indexOf(gameLoopCheck);
if (glIdx > 0) {
  const returnIdx = c.indexOf('    return;', glIdx);
  const afterBlock = c.indexOf('\n', returnIdx) + 1;
  const playerUpdate = c.indexOf('player.update();', afterBlock);
  if (playerUpdate > 0) {
    const insertLine = c.lastIndexOf('\n  ', playerUpdate) + 1;
    const hook = '  applyTouchJoystick();' + CRLF +
      '  applyAutoShoot();' + CRLF +
      '  updateTouchControlsVisibility();' + CRLF + CRLF + '  ';
    c = c.substring(0, insertLine) + hook + c.substring(insertLine + 3);
    fixes++;
    console.log('4. Game loop hooks inserted');
  }
}

// ===== 5. Reset state in initGame =====
const initGameIdx = c.indexOf('function initGame() {');
if (initGameIdx > 0) {
  const braceStart = c.indexOf('{', initGameIdx) + 1;
  const reset = CRLF +
    '  autoShootOn = false;' + CRLF +
    '  const at = document.getElementById("autoShootToggle"); if(at) at.classList.remove("on");' + CRLF +
    '  const jt = document.getElementById("joyThumb"); if(jt) jt.style.transform = "translate(0px, 0px)";' + CRLF +
    '  touchJoystick.active = false; touchJoystick.dx = 0; touchJoystick.dy = 0;';
  c = c.substring(0, braceStart) + reset + c.substring(braceStart);
  fixes++;
  console.log('5. initGame reset inserted');
}

fs.writeFileSync('raiden-game.html', c);

// JS syntax check
try {
  const js = c.match(/<script>([\s\S]*)<\/script>/)[1];
  new Function(js);
  console.log('\n=== JS syntax: VALID ===');
} catch(e) {
  console.log('\n=== JS syntax: ERROR ===');
  console.log(e.message);
}

console.log(`\nTotal fixes: ${fixes}/5`);
