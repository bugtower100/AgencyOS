import { describe, it, expect } from 'vitest'
import { levenshtein, missionTypeKey } from '../utils'

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('abc', 'abc')).toBe(0)
  })

  it('computes distance between short strings', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
    expect(levenshtein('abc', '')).toBe(3)
  })
})

describe('missionTypeKey', () => {
  it('maps Chinese values to translation keys', () => {
    expect(missionTypeKey('收容')).toBe('containment')
    expect(missionTypeKey('清扫')).toBe('cleanup')
    expect(missionTypeKey('市场破坏')).toBe('disruption')
    expect(missionTypeKey('其他')).toBe('other')
  })

  it('returns english keys untouched', () => {
    expect(missionTypeKey('containment')).toBe('containment')
    expect(missionTypeKey('cleanup')).toBe('cleanup')
    expect(missionTypeKey('disruption')).toBe('disruption')
    expect(missionTypeKey('other')).toBe('other')
  })

  it('falls back to other for unknown values', () => {
    expect(missionTypeKey('未知类型')).toBe('other')
    expect(missionTypeKey(undefined)).toBe('other')
  })
})
