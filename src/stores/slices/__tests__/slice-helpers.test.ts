/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { makeCrud } from '../slice-helpers'
import { createId } from '@/lib/utils'

describe('slice-helpers makeCrud', () => {
  it('supports create, update, remove with hooks', () => {
  let state: any = { items: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') state = patch(state)
      else state = { ...state, ...patch }
    }
    const get = () => state

  let createdHookCount = 0
  const deletedIds: string[] = []
  let onUpdateParams: any = null
    const { create, update, remove } = makeCrud('items', set, get, {
      onCreate: (item) => {
        createdHookCount++
        return item
      },
      onDelete: (id) => deletedIds.push(id),
      onUpdate: (id, prev, next) => {
        onUpdateParams = { id, prev, next }
      },
    })

    const a = create({ name: 'a' } as any)
    expect(state.items.length).toBe(1)
    expect(a.id).toBeDefined()
    expect(createdHookCount).toBe(1)

  update(a.id!, { name: 'a-updated' } as any)
    expect(state.items[0].name).toBe('a-updated')
  expect(onUpdateParams).toBeDefined()

  remove(a.id!)
    expect(state.items.length).toBe(0)
    expect(deletedIds).toContain(a.id)
  })

  it('supports upsert to create and update existing item', () => {
    let state: any = { items: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') state = patch(state)
      else state = { ...state, ...patch }
    }
    const get = () => state
    const { upsert } = makeCrud('items', set, get, {})
    const created = upsert({ name: 'foo' } as any)
    expect(state.items.length).toBe(1)
    expect(created.id).toBeDefined()
  upsert({ id: created.id, name: 'bar' } as any)
  expect(state.items[0].name).toBe('bar')
  })
})

describe('createId', () => {
  it('generates unique strings', () => {
    const a = createId()
    const b = createId()
    expect(typeof a).toBe('string')
    expect(a).not.toBe(b)
  })
})
