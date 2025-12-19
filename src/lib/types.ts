export interface TrackItemSnapshot {
  id: ID
  label: string
  checked: boolean
}

export interface CustomTrackSnapshot {
  id: ID
  name: string
  color: string
  items: TrackItemSnapshot[]
}
export type ID = string

export type CampaignStatus = 'active' | 'paused' | 'ended'
export type AgentStatus = 'active' | 'resting' | 'retired' | 'dead' | 'pending'
export type MissionType = '收容' | '清扫' | '市场破坏' | '其他'
export type MissionStatus = 'planning' | 'active' | 'debrief' | 'archived'

export const QA_CATEGORIES = [
  { key: 'focus', label: '专注' },
  { key: 'deceit', label: '欺瞒' },
  { key: 'vitality', label: '活力' },
  { key: 'empathy', label: '共情' },
  { key: 'initiative', label: '主动' },
  { key: 'resilience', label: '坚毅' },
  { key: 'presence', label: '气场' },
  { key: 'expertise', label: '专业' },
  { key: 'mystique', label: '诡秘' },
] as const

export type QAKey = (typeof QA_CATEGORIES)[number]['key']

export interface QAStat {
  current: number
  max: number
}

export type QAProfile = Record<QAKey, QAStat>

export interface Campaign {
  id: ID
  name: string
  divisionCode: string
  location: string
  status: CampaignStatus
  styleTags: string[]
  contentFlags: string[]
  defaultRules: string[]
  nextMissionId?: ID
  // Optional current on-duty general manager (editable in UI)
  generalManager?: string
  updatedAt: string
}

export interface AgentClaimRecord {
  id: ID
  itemName: string
  category: string
  reason: string
  claimedAt: string
  status: 'pending' | 'approved' | 'rejected'
  /** 关联的申领物库ID（可选） */
  requisitionId?: ID
}

// ============ 申领物 Requisitions ============
export type RequisitionSource = 'hq' | 'branch' | 'siphon'

export interface RequisitionPrice {
  label: string
  cost: number
}

export interface Requisition {
  id: ID
  name: string
  /** 来源归属：hq=总部, branch=分部, siphon=Siphon的商店 */
  source: RequisitionSource
  /** 分部名称（当 source 为 branch 时使用） */
  branchName?: string
  /** 多价格支持 */
  prices: RequisitionPrice[]
  /** 效果描述 */
  description: string
  /** 获取条件 */
  condition?: string
  /** 已购买特工 */
  purchasedBy?: string
  /** 图片（Base64或URL） */
  image?: string
  /** 是否为新物品 */
  isNew?: boolean
  /** 是否星标 */
  starred?: boolean
  /** 排序权重 */
  order?: number
  createdAt: string
  updatedAt: string
}

export interface AgentSummary {
  id: ID
  codename: string
  arcAnomaly: string
  arcReality: string
  arcRole: string
  qa: QAProfile
  awards: number
  reprimands: number
  status: AgentStatus
  claims?: AgentClaimRecord[]
  // 当前任务内新增的嘉奖/申诫增量，用于计算本次任务的 MVP / 观察期
  awardsDelta?: number
  reprimandsDelta?: number
}

export interface MissionSummary {
  id: ID
  code: string
  name: string
  type: MissionType
  status: MissionStatus
  chaos: number
  looseEnds: number
  realityRequestsFailed?: number
  scheduledDate: string
  optionalObjectiveHint?: string
  expectedAgents?: string
  goalsSummary?: string
}

export interface AnomalySummary {
  id: ID
  codename: string
  focus: string
  domain: string
  status: 'active' | 'contained' | 'neutralized' | 'escaped'
}

export interface Note {
  id: ID
  title: string
  summary: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface MissionLogEntry {
  id: ID
  missionId: ID
  timestamp: string
  type: 'log' | 'chaos' | 'loose-end' | 'reality-failure'
  detail: string
  delta?: number
}

export interface EmergencyAction {
  id: ID
  timestamp: number
  type: 'setStyle' | 'updateText' | 'addElement' | 'removeElement' | 'runAnimation' | 'updateData' | 'navigate'
  selector: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  originalState?: any
}

export interface EmergencyMessage {
  id: ID
  sender: 'user' | 'agent'
  text: string
  timestamp: number
}

export interface EmergencyPermissions {
  canReadDom: boolean
  canWriteDom: boolean;
  canWriteCampaignData: boolean;
  canWriteSettingsData: boolean;
  allowedAreas: string[]
}

export interface AgencySnapshot {
  campaign: Campaign
  agents: AgentSummary[]
  missions: MissionSummary[]
  anomalies: AnomalySummary[]
  notes: Note[]
  logs: MissionLogEntry[]
  requisitions?: Requisition[]
  tracks?: CustomTrackSnapshot[]
  settings?: {
    notesAllowHtml?: boolean
    dashboardReadOnlyStyle?: boolean
  }
  emergency?: {
    isEnabled: boolean
    permissions: EmergencyPermissions
    chatHistory: EmergencyMessage[]
    actionHistory: EmergencyAction[]
    llmConfig: {
      apiUrl: string
      model: string
      apiKey?: string
    }
  }
}
