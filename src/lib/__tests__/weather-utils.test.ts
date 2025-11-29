import { describe, it, expect } from 'vitest'
import { getWeatherRuleKey, getWeatherRuleForCount } from '../weather-utils'

describe('weather utils', () => {
  it('resolves to correct keys', () => {
    expect(getWeatherRuleKey(0)).toBe('0')
    expect(getWeatherRuleKey(5)).toBe('0')
    expect(getWeatherRuleKey(11)).toBe('11')
    expect(getWeatherRuleKey(12)).toBe('11')
    expect(getWeatherRuleKey(34)).toBe('33')
    expect(getWeatherRuleKey(44)).toBe('44')
    expect(getWeatherRuleKey(66)).toBe('66')
    expect(getWeatherRuleKey(77)).toBe('77')
    expect(getWeatherRuleKey(100)).toBe('77')
  })

  it('returns the expected start chaos value for some thresholds', () => {
    expect(getWeatherRuleForCount(0).startChaos).toBe('0')
    expect(getWeatherRuleForCount(11).startChaos).toBe('5')
    expect(getWeatherRuleForCount(34).startChaos).toBe('15')
    expect(getWeatherRuleForCount(55).startChaos).toBe('25')
    expect(getWeatherRuleForCount(66).startChaos).toBe('无')
  })
})
