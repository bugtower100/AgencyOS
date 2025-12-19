import type { StateCreator } from 'zustand'
import type { Requisition } from '@/lib/types'
import { makeCrud } from './slice-helpers'

export interface RequisitionSlice {
  requisitions: Requisition[]
  createRequisition: (payload: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>) => Requisition
  updateRequisition: (id: string, payload: Partial<Omit<Requisition, 'id'>>) => void
  deleteRequisition: (id: string) => void
  toggleRequisitionStar: (id: string) => void
  reorderRequisitions: (sourceId: string, targetId: string) => void
  importRequisitions: (items: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>[], mode: 'append' | 'overwrite') => void
}

export const createRequisitionSlice: StateCreator<
  RequisitionSlice,
  [],
  [],
  RequisitionSlice
> = (set, get) => {
  const crud = makeCrud<Requisition>('requisitions', set, get, {
    onCreate: (item) => ({
      ...item,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }),
  })

  return {
    requisitions: [],
    createRequisition: (payload) => {
      const now = new Date().toISOString()
      return crud.create({
        ...payload,
        createdAt: now,
        updatedAt: now,
      })
    },
    updateRequisition: (id, payload) => {
      crud.update(id, {
        ...payload,
        updatedAt: new Date().toISOString(),
      })
    },
    deleteRequisition: (id) => crud.remove(id),
    toggleRequisitionStar: (id) => {
      const item = get().requisitions.find((r) => r.id === id)
      if (item) {
        crud.update(id, { starred: !item.starred })
      }
    },
    reorderRequisitions: (sourceId, targetId) => {
      set((state) => {
        const items = [...state.requisitions]
        const sourceIndex = items.findIndex((item) => item.id === sourceId)
        const targetIndex = items.findIndex((item) => item.id === targetId)
        if (sourceIndex === -1 || targetIndex === -1) return state
        
        // 同类才能拖拽
        const sourceItem = items[sourceIndex]
        const targetItem = items[targetIndex]
        if (sourceItem.source !== targetItem.source) return state
        
        const [removed] = items.splice(sourceIndex, 1)
        items.splice(targetIndex, 0, removed)
        
        // 更新 order
        return {
          requisitions: items.map((item, index) => ({ ...item, order: index })),
        }
      })
    },
    importRequisitions: (newItems, mode) => {
      const now = new Date().toISOString()
      const itemsWithMeta = newItems.map((item, index) => ({
        ...item,
        id: `import-${Date.now()}-${index}`,
        createdAt: now,
        updatedAt: now,
      }))
      
      set((state) => ({
        requisitions: mode === 'overwrite' 
          ? itemsWithMeta 
          : [...state.requisitions, ...itemsWithMeta],
      }))
    },
  }
}

// 默认申领物数据
export const DEFAULT_HQ_REQUISITIONS: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: "三角机构官方马克杯", source: "hq", prices: [{label: "12盎司", cost: 3}, {label: "18盎司", cost: 18}], description: "这款时髦的陶瓷马克杯能盛放任何处于合理温度范围内的液体。" },
  { name: "便利回形针", source: "hq", prices: [{label: "租赁", cost: 1}, {label: "购买", cost: 15}], description: "这枚一英寸长的金属回形针能让特工隐秘地储存任意数量的文档或数字文件。\n将纸质文件扣在一起即可储存，或将回形针的一端插入任何数据端口，即可保存、传输或复制数字数据。回形针的存储数据量没有上限；任意数量的纸张看起来都只会是一叠五张左右、平平无奇的纸。请注意，储存在回形针中的任何信息都将成为机构财产。" },
  { name: "随身储物柜", source: "hq", prices: [{label: "小型租赁", cost: 1}, {label: "大型租赁", cost: 3}, {label: "小型购买", cost: 11}, {label: "大型购买", cost: 33}], description: "这个金属储物柜由当值的流形维护，在任务期间可随时存取：将手中持有的物体伸向身后（以存放物体），或空手伸向身后（以取出物体）。物体在储物柜中会正常老化和损耗。\n小型储物柜的尺寸约为一个普通背包大小。大型储物柜的尺寸约为一个普通车库大小。" },
  { name: "三角机构企业膳食计划", source: "hq", prices: [{label: "单次任务膳食计划", cost: 1}, {label: "永久膳食计划", cost: 15}], description: "当您从任何餐厅为自己点餐时，只要您只点这份获准食物清单上的菜品，便可使用机构的公司卡： 咖喱角、可丽饼（折叠供应）、饭团、三明治（切成三角形）、披萨或派（按片）、哈曼塔森、箭蟹、瑞士三角巧克力。其他选项必须经您的总经理批准。" },
  { name: "慈善捐款", source: "hq", prices: [{label: "感谢您的捐赠！", cost: 9}], description: "一家随机抽选的贫困孤儿院将获得为期一年的资金支持。" },
  { name: "三轮行汽车服务", source: "hq", prices: [{label: "宾客通行证", cost: 1}, {label: "终身会员", cost: 15}], description: "您将被指派一辆自选的私人载具。该载具可以是任何市售的、可在公路上合法行驶的移动物体，其尺寸须足以容纳您的整个外勤小队，并配备任何必要的设施。归还受损车辆将招致申诫。" },
  { name: "信息披露协议", source: "hq", prices: [{label: "宾客通行证", cost: 1}, {label: "会员", cost: 15}], description: "受本协议保护的特工授权机构，在双方都同意的情况下，转录其思想并将其他特工的思想植入其心智，以促进特工间的沟通，并使您能无需言语、远距离地进行交谈。所有特工都必须签署自己的信息披露协议方可参与。" },
  { name: "三角机构官方运动夹克", source: "hq", prices: [{label: "任意尺码", cost: 15}], description: "这款轻便透气的夹克能让特工在彰显其无可挑剔品味的同时，保持舒适与行动自如。特工可要求在背后丝网印刷其姓名或呼号，右前胸也预留了空间，可添加特工每次晋升时获得的刺绣臂章。" },
  { name: "三角家居礼品卡", source: "hq", prices: [{label: "1000美元礼品卡", cost: 1}, {label: "3,000,000美元礼品卡", cost: 66}], description: "在办公室时，或在任务期间身处购物中心时，您可使用此礼品卡消费，以购买道具、家具、家居用品，以及您调查可能需要的任何其他常见的凡俗物品。商品不得转售。" },
  { name: "部门调动申请", source: "hq", prices: [{label: "首次", cost: 15}, {label: "此后每次", cost: 30}], description: "感觉自己与当前部门格格不入？可申请将您的职能调动至您当前外勤小队中尚无代表的任何职能。请注意，您只能在下次任务开始时，才能获得新职能的初始申领物。" },
  { name: "历史修正申请", source: "hq", prices: [{label: "所有申请", cost: 99}], description: "您可利用机构的3%闪回计划，来改写您过去某个特定的凡俗时刻。这可以涵盖各种情况，从调整您在一次决定性谈话中所说的话，到改变您今早是否在三明治里加了蛋黄酱。\n请注意，此项操作无法影响与异常存在的过往互动，包括您自己的私人异常体。" },
  { name: "LMZ\"破天者\"执政官级直升机", source: "hq", prices: [{label: "基础款", cost: 333}, {label: "防火款", cost: 999}], description: "这架顶尖的机构品牌直升机将您从一切陆地烦恼中解放出来。\"破天者\"拥有可容纳多达9名乘客的豪华真皮座椅、超过300海里的航程、140节的巡航速度、可定制的自动助手以及冷藏杯架，是当之无愧的至尊出行方式。\n不含飞行员培训。需签署责任豁免书。" },
]

export const DEFAULT_SIPHON_REQUISITIONS: Omit<Requisition, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: "加速发展", source: "siphon", prices: [{label: "激活", cost: 7}], description: '激活「练习」或「为人所知」。' },
  { name: "自我实现", source: "siphon", prices: [{label: "替换能力", cost: 14}], description: '不喜欢你某项异常能力的发展方向？Siphon能让你的观察成为最重要的因素，并将你现有的一项能力，替换为你本会因以不同方式回答前一个能力问题而获得的能力。被替换掉的能力会失去其「已练习」状态和任何已回答的「为人所知」问题。' },
  { name: "众多", source: "siphon", prices: [{label: "获得能力", cost: 21}], description: "从你外勤小队中无人使用的异常ARC组件处，获得一项初始异常能力。它可以像正常能力一样进阶为未来的能力。" },
  { name: "潜入", source: "siphon", prices: [{label: "获得能力", cost: 28}], description: '你获得能力「潜入」：当你死亡时，你不会返回机构，而是坠入门厅。你可以通过在某个正想着你的人附近现身，来迅速返回现实。当你返回时，选择你身体的一部分，它将永远改变以反映你的异常。你不能两次选择同一选项：左眼、右眼、口鼻、左手、右手、左臂、右臂、左脚、右脚、左腿、右腿、心脏、胃\n这些改变可能会使你仅仅是存在，就会开始制造散逸端。' },
  { name: "分裂", source: "siphon", prices: [{label: "获得能力", cost: 42}], description: '你获得能力「分裂」：你的异常体可以安全地脱离你的身体，并自主行动，持续时间不超过7分钟。在此期间，你可以独立地控制两者；你的人类身体无法使用异常能力，而你的异常形态则会为每个遭遇它的人制造一个散逸端。' },
  { name: "领域创造", source: "siphon", prices: [{label: "获得能力", cost: 49}], description: '你获得能力「领域创造」：\n每次任务中，你可以将一个封闭的房间或一个直径约10米的开放空间，建立为你的领域。该空间不能位于另一个异常体的领域之内，也不能与之接触。在任务结束前，它不会消散。\n你的领域具有以下效果：其他异常体，包括次级异常体，未经你的许可不得进入你的领域。在你的领域中使用异常能力时，成功的掷骰会自动获得一个额外的 3。\n每次任务中，你可以在你的领域内无需掷骰便使用UNL3ASH一次，仅影响领域内的事物。' },
  { name: "觉醒", source: "siphon", prices: [{label: "获得能力", cost: 56}], description: "创造一项能完美代表你的全新异常能力，包括一个成功效果、一个三重升华效果和一个失败效果。" },
]
