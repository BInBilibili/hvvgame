# AI 开发状态

流程见 docs/AI_DEVELOPMENT_WORKFLOW.md，产品基线见 docs/GAME_DESIGN.md。

## 控制块

~~~yaml
project: hvvgame
current_phase: DISCOVERY
active_work_item: GAME-DATA-001
ready_queue: [GAME-SIM-001]
blocked_queue: []
last_updated: 2026-10-08
~~~

## 环境事实

- 工作目录：D:\game\hvvgame
- node v22.20.0 / npm 10.9.3 / pnpm 11.22.0
- **已是 git 仓库**：分支 `main`，远端 `origin` = https://github.com/BInBilibili/hvvgame（public），首次提交 `28c2db5`。AGENTS.md 第 1 节的只读预检自此可执行。
- 网络事实：`github.com:443` 直连不通（`api.github.com:443` 可直连），本仓库 `.git/config` 已配 `http.proxy = http://127.0.0.1:7890`；`gh` 命令走 API 不受影响。
- 现有文件：AGENTS.md、.gitignore、docs/（AI_DEVELOPMENT_WORKFLOW.md、GAME_DESIGN.md、本文件）、demo/welink-chat/（index.html、app.js、data.js、style.css）。

## 技术决策（第一切片）

- 语言：**ESM JavaScript + JSDoc 类型注释**，不引入构建步骤。
- 测试：**Node 22 内置 `node --test` + `node:assert`**，零依赖。
- 理由：验证命令立即可跑；同一份 `.js` 模块之后被网页直接 `import`，不需要迁移。
- 若后续要 TypeScript，数据契约与文件布局不变，只换加载/编译层。

## 工作项

### GAME-DATA-001（READY）

~~~yaml
work_item_id: GAME-DATA-001
title: 群包与群友的数据契约、加载校验和样例数据
type: data
status: READY
owner: ai
external_research: none
objective: >-
  交付群包(group pack)与群友(groupmate)的稳定数据契约、一个加载校验器、
  一份 1 个群 + 5 个群友的合法样例包，以及覆盖合法与拒绝路径的零依赖测试。
why_now: >-
  所有后续系统（模拟、抽卡、合成、存档）都消费这份契约；
  先冻结契约才能保证加一个群 = 加一份 JSON。
depends_on: []
source_documents:
  - docs/GAME_DESIGN.md
  - docs/AI_DEVELOPMENT_WORKFLOW.md
current_evidence: []
in_scope:
  - 群包与群友的字段、类型、取值域和稳定 ID 规则
  - 加载校验器：重复 ID、缺字段、类型错误、稀有度越界、未知枚举
  - data/groups/ 下一份样例群包（1 群 + 5 群友，全部化名）
  - 针对校验器的 node --test 测试
out_of_scope:
  - 任何产率公式、抽卡概率、数值平衡
  - 任何 UI、渲染、存档写入
  - 头像的生成算法（本项只冻结 avatar_seed 字段）
  - 聊天记录导出工具或任何外部 API 接入
invariants:
  - 群友与群的 id 在全局唯一且稳定，不随显示名变化
  - 化名与头像种子必须能唯一确定一个可展示身份，且不含真实昵称
  - 校验器是纯函数：不读网络、不读当前时间、不读开发机绝对路径
  - 合法包全部通过；非法包必须给出可定位的拒绝原因（文件 + 字段 + 原因）
behavior_contract:
  inputs:
    - 一个群包对象（或 data/groups/ 下的 JSON 文件路径）
  authoritative_changes:
    - 校验通过时返回规范化后的只读数据；不修改输入对象
  rejection_reasons:
    - duplicate_id
    - missing_field
    - type_mismatch
    - rarity_out_of_range
    - unknown_enum
    - empty_roster
  events_and_snapshots: []
data_contracts:
  - group pack：id / display_name / tier / base_rate / rarity_table / members[]
  - groupmate：id / alias / avatar_seed / source_group / rarity / tags[] / skill / quote
  - skill：{ kind, value }，kind 为受限枚举
persistence:
  format_change: false
  migration: none
observability:
  - 校验失败时输出结构化错误列表（path + reason + offending value）
acceptance_criteria:
  - AC1 合法样例包校验通过，且返回数据与样例语义等价
  - AC2 重复群友 id -> duplicate_id
  - AC3 缺少必填字段 -> missing_field
  - AC4 rarity 超出范围 -> rarity_out_of_range
  - AC5 未知 skill.kind -> unknown_enum
  - AC6 样例包至少 1 群 5 群友，全部为化名且带 avatar_seed
  - AC7 校验器不修改传入对象（重复校验结果一致）
verification:
  baseline: []
  focused:
    - node --test
  full_gate: false
  optional_research: []
expected_files:
  - src/data/schema.js
  - src/data/loadGroupPack.js
  - data/groups/sample.pack.json
  - test/data.contract.test.js
risks:
  - 契约字段过早冻结会影响后续合成规则 -> 合成相关字段保持最小，只留 tags
rollback: >-
  本项不写入任何持久化状态，删除新增文件即可完全回滚。
handoff_outputs:
  - 契约文档段落（追加到 docs/GAME_DESIGN.md 或单独 docs/DATA_CONTRACT.md）
  - node --test 输出
~~~

### GAME-SIM-001（READY，依赖 GAME-DATA-001）

~~~yaml
work_item_id: GAME-SIM-001
title: 群活跃度产出与离线收益的确定性模拟
type: gameplay
status: BLOCKED
blocked_reason: 需要先决策 docs/GAME_DESIGN.md 第 4 节的产出公式与离线收益上限。
depends_on: [GAME-DATA-001]
~~~


## 记录

### 2026-10-06 项目初始化

- 结果：DONE
- 行为变化：建立产品基线 docs/GAME_DESIGN.md 与状态文件；登记 GAME-DATA-001。
- 验证证据：NOT_RUN（仓库尚无代码，无可执行验证）。环境版本通过 `node -v` 等命令读取。
- 未验证或范围外：git 预检 NOT_RUN（非 git 仓库）；所有数值均为未决策。
- 风险：数据契约若在无任何数值需求的情况下冻结，可能需要二次修订。
- 下一步：执行 GAME-DATA-001。

### 2026-10-08 建立 git 仓库并推送到 GitHub

- 结果：DONE
- 行为变化：`git init -b main`；新增 .gitignore；首次提交 `28c2db5`（9 文件 / 2087 行）；创建 public 仓库 `BInBilibili/hvvgame` 并推送 `main`。
- 验证证据：SIMULATED —— `git rev-parse HEAD` 与 `git rev-parse origin/main` 同为 `28c2db5d171736030527bb9e20a41527d0880754`；`gh api repos/BInBilibili/hvvgame/git/trees/main?recursive=1` 返回 9 个路径，与本地一致；`git diff --cached --check` 无输出。
- 未验证或范围外：未运行 `node --test`（仓库尚无 src/ 与测试）；未创建 README、LICENSE、CI 或 GitHub Pages。
- 风险：`.git/config` 的 `http.proxy = http://127.0.0.1:7890` 依赖本机代理，代理关闭时 `git push` 会失败（改为 SSH 或改用直连可绕开）。
- 下一步：执行 GAME-DATA-001（数据契约 + 加载校验 + 样例群包 + 零依赖测试）。
