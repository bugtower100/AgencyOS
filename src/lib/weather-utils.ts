export type WeatherRule = {
  key: string
  threshold: number
  startChaos: string
  weatherEvent: string
  restriction: string
}

const RULES: WeatherRule[] = [
  {
    key: '0',
    threshold: 0,
    startChaos: '0',
    weatherEvent: '0',
    restriction: '仅限机构雇佣条款所规定的内容。',
  },
  {
    key: '11',
    threshold: 11,
    startChaos: '5',
    weatherEvent: '1',
    restriction:
      '在看似正常的对话中，特工们的人际关系会自发地提醒他们机构的职责以及减少散逸端的重要性。',
  },
  {
    key: '22',
    threshold: 22,
    startChaos: '10',
    weatherEvent: '2',
    restriction:
      '要获得三重升华的效果，特工必须发表一段简短的演说，重申他们致力于清除散逸端和稳定现实的决心。',
  },
  {
    key: '33',
    threshold: 33,
    startChaos: '15',
    weatherEvent: '3',
    restriction: '在进行任何掷骰前，特工都必须（大声或以等效方式）数到3。',
  },
  {
    key: '44',
    threshold: 44,
    startChaos: '20',
    weatherEvent: '4',
    restriction: '在散逸端数量降至44以下前，特工不再有资格获得MVP。',
  },
  {
    key: '55',
    threshold: 55,
    startChaos: '25',
    weatherEvent: '5',
    restriction:
      '向特工们宣读以下内容：“若散逸端数量达到66，所有特工的合同都将被终止。如果你们无法通过任务减少此数量，就必须额外加班：从所有工作/生活平衡条的末尾划掉一个格子，以自行清除6个散逸端。”',
  },
  {
    key: '66',
    threshold: 66,
    startChaos: '无',
    weatherEvent: '无',
    restriction:
      '当前任务结束时，在役的外勤小队将被强制退休。他们必须从可用的退休选项中选择一个。如果没有，他们将被送往收容库。该管辖区的散逸端数量将减少11个，每有一名特工使用其职能提供的退休选项，便额外减少11个。',
  },
  {
    key: '77',
    threshold: 77,
    startChaos: '无',
    weatherEvent: '无',
    restriction:
      '崩解即将开始。为避免此事，该分部的管辖区将被从存在中抹除。[前往： W7]',
  },
]

export function getWeatherRuleKey(count: number) {
  // find the highest rule threshold that is <= count
  const sorted = [...RULES].sort((a, b) => a.threshold - b.threshold)
  let selected = sorted[0]
  for (const r of sorted) {
    if (count >= r.threshold) selected = r
    else break
  }
  return selected.key
}

export function getWeatherRuleByKey(key: string) {
  return RULES.find((r) => r.key === key) || RULES[0]
}

export function getWeatherRuleForCount(count: number) {
  const key = getWeatherRuleKey(count)
  return getWeatherRuleByKey(key)
}

export const _INTERNAL_RULES = RULES
