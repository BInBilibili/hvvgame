# 通用游戏项目 AI 开发流程

## 1. 目的和适用范围

本流程把游戏需求拆成可重复执行、可验证和可交接的任务。它适用于单机、联机、策略、动作和工具型游戏；项目没有某项能力时，在任务中标记“不适用”，不要凭空添加系统。

信息优先级通常为：当前代码和资源、已接受的产品/技术决策、当前状态文件、设计文档、历史记录。出现冲突时，先记录冲突位置和影响，再暂停受影响任务并请求决策。

## 2. 标准工作循环

### A. 领取与预检

1. 从 docs/AI_DEVELOPMENT_STATE.md 找到第一个依赖满足的 READY 任务；没有状态文件时，先创建最小状态文件和任务包。
2. 阅读任务的 source_documents，检查工作区状态和已有修改。
3. 运行任务要求的基线测试。基线已失败时，记录失败是否在任务范围内，不要先覆盖它。

### B. 发现（DISCOVERY）

记录当前行为、目标行为、调用链、数据来源、存档影响、输入/UI 入口和范围外事项。优先寻找现有实现、测试和可复用的本地验证脚本。

### C. 契约（CONTRACT）

在写代码前冻结：

- 输入、前置条件和合法性校验；
- 权威状态变化、拒绝原因、事件和快照；
- UI、Agent、脚本可以看到什么，不能看到什么；
- 稳定 ID、数据格式、存档版本和迁移规则；
- 验收条件、验证命令和失败时的恢复入口。

如果需要新的产品决策，任务回到 BLOCKED，不要在实现中偷偷决定。

### D. 实现（IMPLEMENTING）

按最小纵向切片完成数据、加载、运行时行为、消费者、测试和文档。保持兼容入口直到迁移验证完成。每完成一个小切片就检查 diff，避免把目录整理或无关重构混入任务。

### E. 验证（VERIFYING）

先低成本、后高成本执行：

1. 静态检查、格式检查和资源加载检查；
2. 受影响的单元/纯模拟测试；
3. 受影响的集成或 smoke 测试；
4. UI、输入、分辨率、本地化和真实窗口验证（若适用）；
5. 存档迁移、确定性、性能或发布门（若受影响）。

低层验证失败时先停止向上扩展，并保留完整命令、环境和错误输出。没有执行的项目标记 NOT_RUN。

### F. 审查与交接（REVIEWING）

检查实际 diff、用户可见文本、路径可移植性、存档安全、证据来源和文档链接。确认状态文件已更新后，任务才能进入 DONE；否则进入 REWORK 或 BLOCKED。

## 3. 工作项模板

~~~yaml
work_item_id: GAME-UI-001
title: One observable behavior
type: ui | gameplay | data | save | test | docs | maintenance
status: READY
owner: ai
external_research: optional
objective: >-
  A single behavior the task must deliver.
why_now: >-
  Dependency or player problem that makes it timely.
depends_on: []
source_documents: []
current_evidence: []
in_scope: []
out_of_scope: []
invariants: []
behavior_contract:
  inputs: []
  authoritative_changes: []
  rejection_reasons: []
  events_and_snapshots: []
data_contracts: []
persistence:
  format_change: false
  migration: none
observability: []
acceptance_criteria: []
verification:
  baseline: []
  focused: []
  full_gate: false
  optional_research: []
expected_files: []
risks: []
rollback: >-
  Compatibility path or recovery method.
handoff_outputs: []
~~~

一个工作项只解决一个主要行为目标。如果验收条件包含另一个不相关系统，拆成有依赖关系的两个工作项。

## 4. 变更验证矩阵

| 变更 | 最低验证 | 需要额外记录 |
|---|---|---|
| 纯文档 | 链接、代码块、表格检查；git diff --check | 无需重跑游戏 |
| 数据/资源/加载器 | 资源加载、重复 ID、范围和类型校验；相关回归 | 版本和迁移影响 |
| 命令/规则/权威状态 | 合法与拒绝路径、顺序、快照不可变性、确定性 | 玩家与 AI 是否共用管线 |
| UI/输入/本地化 | 受影响场景 smoke、键鼠导航、文本同步、必要的分辨率/真实窗口检查 | SIMULATED 与 HUMAN 分开 |
| 存档 | 旧版本迁移、损坏恢复、备份、原子写入和重复加载 | 旧档不得被清空 |
| 性能 | 固定场景、实体/资源规模、采样时间和硬件 | 区分平均、P95 和峰值 |
| 发布/阶段出口 | 所有受影响门、干净构建、独立启动和导出包检查 | 未通过项不能标为 DONE |

可复用同一源代码、环境和命令的有效证据，但必须确认中间没有发生会使证据失效的变化。

## 5. 失败、阻塞和回归

- 基线失败：保存命令和原始输出，判断是否为既有问题，并在任务记录中标注。
- 实现回归：进入 REWORK，优先恢复行为契约，不要放宽断言隐藏问题。
- 缺少决策、依赖或权限：进入 BLOCKED，写清解除阻塞所需的最小行动。
- 存档迁移失败：保留原档和备份，修复迁移器后用原始副本重放。
- 真实窗口或真人研究未执行：保持 NOT_RUN，不能用脚本结果替代体验结论。

## 6. 交接格式

~~~text
结果：DONE / REWORK / BLOCKED
行为变化：用户能观察到什么变化
验证证据：命令、环境、结果和证据路径；标注 HUMAN/SIMULATED/NOT_RUN
未验证或范围外：具体项目和原因
风险：存档、兼容性、性能、UI 或发布风险
下一步：唯一一个解除风险或继续工作的动作
~~~

## 7. 新项目启动提示词

~~~text
请按 AGENTS.md 和 docs/AI_DEVELOPMENT_WORKFLOW.md 执行。
先读取 docs/AI_DEVELOPMENT_STATE.md（如果存在），找到第一个依赖满足的 READY 工作项。
先做发现和契约，再做最小纵向实现；保护工作区已有修改；按验证矩阵运行测试；
明确区分 HUMAN、SIMULATED 和 NOT_RUN；最后更新状态文件并按交接格式报告。
未经明确授权，不提交、不推送、不创建分支或 Pull Request。
~~~
