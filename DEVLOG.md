# Sky Thunder (雷电风暴) — Dev Log

> 最后更新: 2026-06-20 · **v2.0.1** · 单文件 `raiden-game.html`（Canvas 2D + Web Audio，零依赖）

---

## 当前版本 (v2.0.x)

| 版本 | 要点 |
|------|------|
| **v2.0.1** | 穿透激光修复、`beginPlaySession()` 开局流程、菜单/帮助/暂停文案对齐 |
| **v2.0** | 三档难度机制分轨、敌弹四维缩放、分难度高分榜、Hard 自杀弹 |
| **v1.9.1** | 手机端暂停/武器/炸弹按钮、菜单战机锚点、冲击波反馈 |
| **v1.9** | 冷暖阵营视觉、Web Audio 四路混音（weapon/threat/ui/impact） |
| **v1.8** | 触屏跟手、局次令牌 `gameRunId`、结算统计补全、稳定性补丁 |

**硬性约束（不变）**：运行时只有 `raiden-game.html`，不引入框架、构建链、外部素材包。`smoke-check.mjs` 仅开发验证用。

**日志与代码不一致（勿当已实现）**：成就系统、每日挑战、暂停页改难度、BGM 音量滑块、独立设置页。见 v1.6/v1.7 历史，当前单文件未落地。

---

## v2.0.1 — 审计修复 (2026-06-20)

- 穿透激光：`penetrate` 弹不再无条件销毁，最多连续命中 4 目标。
- 开局：`initGame()` 不立即刷波；`beginPlaySession()` 统一出击/重开，首波在关卡过渡后生成。
- 文案：菜单 pill、mobile-info、帮助页同步自动炸弹 / Hard 自杀弹 / 双指松手放雷。
- 帮助页补全 7 小怪、精英、Buff、Graze/TENSION/COMBO、分榜说明；暂停页只读显示当前难度。

---

## v2.0 — 难度阶梯 (2026-06-20)

三档签名：**EASY** 自动炸弹 + 慢弹小弹；**NORMAL** 基准；**HARD** 自杀弹 + 无自动炸弹 + 高分倍率。

新增字段：`enemyBulletSpeedMul`、`enemyBulletSizeMul`、`enemyFireRateMul`、`grazeMul`、`bossIntervalMul`、`maxRank` 等；`playerBulletSpeed` 仅影响玩家弹速。

- `addEnemyBullet()` 统一敌弹速度/尺寸；`buildWaveTypePool(level)` 按难度控敌种。
- Rank：Easy 上限 2.0；擦弹 `50×rank×grazeMul`。
- 高分：`skyThunder_highScore_easy|normal|hard`。

---

## v1.8 ~ v1.9.1 摘要

- **移动端**：单指跟手 + 自动开火；右侧暂停/武器/炸弹；双指按住后松手备用放雷。
- **视觉**：玩家冷色、敌机暖色、敌弹高对比；HUD 降噪。
- **音效**：程序化 SFX + 轻量 BGM；分 bus 混音。
- **反馈**：炸弹/击毁/Boss 警告冲击波；菜单 CSS 战机剪影。
- **稳定**：`gameRunId` 隔离延迟 spawn；Game Over 六维统计。

---

## 历史归档 (v1.0 ~ v1.7)

只留里程碑，细节以 git 历史为准。

### v1.0 核心 (2025-06)
7 关 ×（5 波 + 1 Boss）、5 武器 Lv.6 终极、7 类敌人 + 精英、Combo/Graze/Rank、对象池、作弊 `G`。

### v1.1 ~ v1.4 打磨与热修
- 三档难度雏形、自动炸弹、Hard 自杀弹、Boss 间隔分档。
- 炸弹消耗集中到 `useBomb()`；Stage 5→6 卡死修复。
- `WeaponManager` 模块化；Canvas save/restore 与 swap-and-pop 性能优化。

### v1.5 ~ v1.6 工程化尝试（部分未进当前文件）
- CSS Token、GameOver 扩展统计、暂停页 SFX 滑块：**部分保留**。
- 设置页、BGM 滑块、粒子等级、成就、每日挑战：**仅日志，当前 html 无**。

### v1.7 计划功能（未落地）
成就 20 项、每日挑战 seeded RNG、会话追踪钩子。代码曾存在于迭代分支，**当前 `raiden-game.html` 不含**。

---

## 项目概览

竖版 STG，480×720 内部分辨率，CSS 自适应。Chrome / Edge / Safari 打开即玩。

```bash
# 开发校验
node smoke-check.mjs
```

### 状态机
`MENU` → `PLAYING`（含关卡过渡）→ `PAUSED` / `GAMEOVER`

### 核心系统
| 系统 | 说明 |
|------|------|
| 武器 ×5 | 双发/散弹/激光/导弹/雷电链，W 道具升至 Lv.6 |
| 难度 ×3 | EASY / NORMAL / HARD，机制分轨 |
| Rank | 随时间上升，影响敌弹密度与速度（HUD: TENSION） |
| Combo / Graze | 连击倍率、擦弹加分 |
| Boss ×7 | `BOSS_CONFIGS` 数据驱动，多阶段弹幕 |

### 操作
| 键 | 功能 |
|----|------|
| WASD / 方向键 | 移动 |
| J / Z | 射击 |
| K / X | 炸弹 |
| M | 切武器 |
| P | 暂停 |
| R | 重开 |

---

## 技术备忘

1. Canvas 480×720，勿改内部分辨率比例。
2. Boss 阶段按 `hp/maxHp` 切换；攻击委托 `BOSS_CONFIGS[].attack`。
3. 擦弹：`grazeBox` 包住 hitbox 但不与机体 hitbox 重叠。
4. 延迟 spawn 必须带 `gameRunId` 校验。
5. 难度数值以 `DIFFICULTY` 对象为唯一来源。

---

## 后续方向（未承诺）

本地双人、练习模式、回放、在线榜、周目 NG+ 等见早期路线图，**均未排期**。新功能继续遵守单文件约束。
