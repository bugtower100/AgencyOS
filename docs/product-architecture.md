# Agency OS · 产品与技术架构草案

> 版本：2025-11-25 · 面向三角机构 GM 信息追踪工具 MVP

## 1. 产品愿景与设计原则

- **定位**：离线优先的 GM 专用“信息作战室”，在一场或长期战役中持续追踪特工、任务、异常体、混沌/散逸端与嘉奖体系。
- **体验基调**：参考规则书中的 Agency OS —— 复古企业 UI、等宽数据视图、高对比暗色主题，偶尔穿插“励志”或“机构提醒”弹窗，营造压迫感与黑色幽默。
- **运营价值**：标准化记录格式，降低笔记负担；将规则概念（ARC、混沌池、任务报告等）映射为可操作数据；在任务流转中提供实时提示（混沌阈值、散逸端天气事件、机构评级变动等）。

## 2. 用户角色与关键场景

| 角色 | 诉求 | 典型场景 |
| --- | --- | --- |
| 主 GM（总经理） | 快速录入/查阅全部战役信息，在任务中实时调整混沌、嘉奖与日志 | Session 0 录入、任务执行桌面、战后结算 |
| 副 GM / 战役助理 | 共享读取权限，可追加备注或整理报告 | 战役准备、汇总日志 |
| 玩家（只读，可选） | 查看自己的特工卡片与嘉奖记录 | 任务前复盘、查看申领物 |

核心流程：
1. **战役启动**：设置分部档案、内容安全标签、初始特工。
2. **任务准备**：创建任务、选择特工、设定可选目标、预关联异常体。
3. **任务进行**：在单页 Mission Control 中记录时间线、调整混沌/过载、管理散逸端、调用申领物商店、触发高墙文件提示。
4. **任务结算**：通过向导完成异常体分析、可选目标、嘉奖申诫、散逸端去向、MVP 计算与战役快照。

## 3. 功能地图（MVP→增强）

### MVP 版本
- 战役仪表板（战役概要、下一任务预告、统计卡片）。
- 特工档案：ARC 结构、人际关系、资质 QA、嘉奖/申诫、状态快照。
- 任务控制台：时间线日志、混沌池/过载面板、可选目标、散逸端计数、异常体摘要。
- 异常体/散逸端库：搜索与详情页，支持任务关联。
- 结算向导：任务报告字段、MVP & 机构评级自动计算、战役快照。
- 本地持久化 + 手动导出（JSON）+ 自动快照。

### 后续增强
- 高墙文件解锁浏览器、申领物商店、“请求机构”特效。
- 多用户角色与分享链接。
- 云同步 / 多端访问。
- 插件化报表（故事 recap、newsletter）。

## 4. 信息架构与导航

```
┌─ 战役仪表板
│  ├─ 战役信息卡 + 内容安全标签
│  ├─ 运行统计（混沌累计、异常体状态）
│  └─ 时间线（任务/重大事件）
│
├─ 人力资源档案
│  ├─ 特工列表（过滤：状态/ARC）
│  └─ 特工详情（标签页：基础/ARC/关系/任务历史/统计）
│
├─ 任务控制台
│  ├─ 左：特工卡片抽屉 + NPC/地点速览
│  ├─ 中：时间线日志（场景、线索、系统事件）
│  └─ 右：混沌池、过载、可选目标、散逸端、励志提示
│
├─ 异常体与散逸端
│  ├─ 异常体卡片视图 + 详情
│  └─ 散逸端列表 + 一键转清扫任务
│
└─ 报表与导出
   ├─ 嘉奖/申诫趋势、MVP 排行
   ├─ 任务评级分布
   └─ 导出中心（JSON/PDF 模板）
```

## 5. 数据模型（逻辑草案）

以 TypeScript 接口表示，后续可映射到 IndexedDB / SQLite。

```ts
type ID = string

type Tag = '恐怖' | '职场喜剧' | '内容-身体恐怖' | '内容-情感操控' | string

interface Campaign {
  id: ID
  name: string
  divisionCode: string
  location: string
  status: 'active' | 'paused' | 'ended'
  styleTags: Tag[]
  contentFlags: Tag[]
  defaultRules: string[] // 例：['A4', 'B2']
  notes: string
  nextMissionId?: ID
  createdAt: string
  updatedAt: string
}

interface Player {
  id: ID
  displayName: string
  contact?: string
  sensitivityFlags: Tag[]
}

interface Agent {
  id: ID
  campaignId: ID
  playerId?: ID
  name: string
  codename: string
  status: 'active' | 'resting' | 'retired' | 'dead' | 'pending'
  arc: {
    anomaly: { type: string; abilities: AbilityNote[] }
    reality: { type: string; trigger: string; overloadRelief: string }
    role: { type: string; primaryDirective: string; permittedActions: string[] }
  }
  qa: { label: string; current: number; max: number }[]
  relationships: Relationship[]
  awards: RewardRecord[]
  reprimands: RewardRecord[]
  rating: 'exemplary' | 'satisfactory' | 'watchlist' | 'critical'
  insuranceStatus: 'safe' | 'debt' | 'revoked'
  snapshots: AgentSnapshot[]
  createdAt: string
  updatedAt: string
}

interface Mission {
  id: ID
  campaignId: ID
  code: string
  name: string
  type: '收容' | '清扫' | '市场破坏' | '其他'
  inWorldDate: string
  realDate: string
  briefing: string
  objectives: Objective[]
  participants: ID[] // agent ids
  anomalyLinks: ID[]
  chaos: ChaosState
  looseEndCount: number
  status: 'planning' | 'active' | 'debrief' | 'archived'
  timeline: MissionLogEntry[]
}

interface Anomaly {
  id: ID
  campaignId: ID
  codename: string
  focus: { emotion: string; subject: string }
  impulse: string
  domain: string
  status: 'active' | 'contained' | 'neutralized' | 'escaped'
  behaviorNotes: string[]
  chaosEffects: ChaosEffect[]
  firstMissionId?: ID
  relatedLooseEndIds: ID[]
}

interface LooseEnd {
  id: ID
  missionId: ID
  descriptor: string
  mindsRepresented: number
  state: 'unresolved' | 'contained' | 'transitioned'
}

interface DebriefReport {
  id: ID
  missionId: ID
  anomalyStatus: string
  looseEndCount: number
  anomalyAnalysis: { codename: string; behavior: string; focus: string; domain: string }
  grade: 'S' | 'A' | 'B' | 'C' | 'D'
  completeness: 'model' | 'complete' | 'incomplete'
  optionalObjectiveSummary: string
  finalPlea: string
  mvpAgentId?: ID
}
```

## 6. 技术架构与选型

| 层级 | 选型 | 说明 |
| --- | --- | --- |
| 构建 | Vite + React 18 + TypeScript | 现代前端脚手架，需 Node ≥ 20.19（当前 20.16 需升级以避免 Vite 警告）。 |
| UI | Tailwind CSS + Radix UI primitives + 自定义主题 | 便于实现复古企业风暗色主题；Radix 负责可访问组件。 |
| 状态管理 | Zustand（全局可变 store） + React Hook Form + Zod | Zustand 处理战役/任务等实体；RHForm+Zod 提供可验证表单。 |
| 数据持久化 | Dexie.js（IndexedDB 封装） + local encrypted backup (JSON) | 支持离线、自动快照、导入导出。 |
| 同步/查询 | TanStack Query（后续接入远程 API 时复用） | 目前用于本地缓存与异步加载。 |
| 表格/图表 | TanStack Table、Recharts | 呈现嘉奖趋势、混沌统计。 |
| 富文本/日志 | Tiptap（可选）或简易 Markdown 编辑器 | 记录任务时间线与异常体笔记。 |
| 测试 | Vitest + Testing Library + Playwright（后续 E2E） | 保证关键交互（混沌调整、任务结算）正确。 |

### 模块组织
- `src/modules/campaign`, `modules/agents`, `modules/missions`, `modules/anomalies`, `modules/reports` 等，集中其 UI、hooks、services。
- `src/components/ui`：基础视觉组件（Panel、Card、DataList、TerminalPrompt、励志 Toast）。
- `src/stores`：Zustand store（拆分 slices：campaignSlice、agentSlice 等）。
- `src/services/db`：Dexie schema、导出/导入工具、战役快照。 
- `src/theme`：颜色、字体、阴影、响应式断点，含“Emergency Mode” 动画。

## 7. 任务流程与交互要点

### Session 0 / 入职
1. GM 在战役设置页录入分部、内容安全标签、自定义规则开关。
2. 录入玩家与特工：ARC 三要素 + 资质 QA + 人际关系。
3. 自动建立首个“战役快照 v0”。

### 任务进行
1. 选择任务进入 Mission Control。
2. 时间线面板支持键盘快捷：`L` 新增日志、`C` +/- 混沌、`A` 添加嘉奖、`R` 添加申诫、`E` 记录散逸端。
3. 混沌池：
   - 展示当前值、阈值提醒；
   - 根据领域开关自动调整消耗；
   - 触发混沌效应弹窗（附描述模板）。
4. 散逸端面板：根据数量显示天气/限制提示（引用规则文本 0.规则/6.混沌.md & 2.表/0.可预测异常/…）。
5. 励志弹窗：基于计时或事件触发（例如任务超过 90 分钟或申诫突破 3）。

### 任务结算
1. Debrief 向导按章节展开：异常体状态 → 可选目标 → 嘉奖/申诫 → MVP / 机构评级 → 战役快照。
2. 计算规则：
   - 捕获 +3 嘉奖，逃脱 +3 申诫 +7 散逸端（文档 2 建议）。
   - MVP 依据嘉奖-申诫差值；若平局则选当前 QA 最高。
   - 机构评级映射申诫数量（规则书 29 页）。
3. 生成报告草稿，可导出 PDF/Markdown，并写入战役时间线。

## 8. 数据备份与导出策略

- **自动快照**：每次任务结算后调用 Dexie `snapshot` 表写入战役 JSON（含版本号 + 时间戳）。
- **手动导出**：用户可导出单战役或全局数据（JSON），后续扩展 CSV/PDF。
- **导入**：上传 JSON → schema 校验 → 写入 IndexedDB。

## 9. 风险与后续工作

| 风险/需求 | 应对 |
| --- | --- |
| Node 版本不满足 Vite 7 要求 | 升级至 Node 20.19+ 或 22.12+，并记录在 README。 |
| GM 长时间使用导致性能压力（大量日志/实体） | 列表虚拟化、分批加载 Dexie 查询、对日志提供归档。 |
| 规则引用大量文本 | 在 `规则文本/` 中按需建立链接，支持“跳转到规则”按钮。 |
| 后续云同步 | 预先用 Repository 模式封装数据访问，便于切换后端。 |

## 10. 下一步实现建议

1. 搭建基础项目结构（路由、布局、主题、Zustand store、Dexie 实例）。
2. 落地战役仪表板与特工档案（基础增删改查 + 表单校验）。
3. 打造 Mission Control 单页，确保混沌/散逸端/日志交互顺滑。
4. 完成 Debrief 向导与导出工具。
5. 引入特色功能：励志弹窗、紧急事态模式、申领物商店、高墙文件解锁。
