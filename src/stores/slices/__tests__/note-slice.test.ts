/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest'
import { createNoteSlice } from '../note-slice'
import type { Note } from '@/lib/types'

describe('note-slice createNote/update/delete', () => {
  it('createNote generates id and timestamps and returns created value', () => {
    let state: any = { notes: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') state = patch(state)
      else state = { ...state, ...patch }
    }
    const get = () => state

  const slice = createNoteSlice(set, get as any, {} as any)
    const created = slice.createNote?.({ title: 't', summary: '', content: '' })
    expect(created).toBeDefined()
    const note = state.notes[0] as Note
    expect(note.id).toBeDefined()
    expect(note.createdAt).toBeDefined()
    expect(note.updatedAt).toBeDefined()
    expect(note.title).toBe('t')
  })

  it('legacy addNote inserts provided Note as-is', () => {
    let state: any = { notes: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') state = patch(state)
      else state = { ...state, ...patch }
    }
    const get = () => state
    const slice = createNoteSlice(set, get as any, {} as any)
    const now = new Date().toISOString()
    const note: Note = { id: 'n-1', title: 'x', summary: '', content: '', createdAt: now, updatedAt: now }
    slice.addNote?.(note)
    expect(state.notes.length).toBe(1)
    expect(state.notes[0].id).toBe('n-1')
  })

  it('updateNote merges patch and sets updatedAt', () => {
    let state: any = { notes: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') state = patch(state)
      else state = { ...state, ...patch }
    }
    const get = () => state
  const slice = createNoteSlice(set, get as any, {} as any)
    const created = slice.createNote?.({ title: 't', summary: '', content: '' })
    expect(created).toBeDefined()
    const id = created!.id
    slice.updateNote(id, { title: 'changed' })
    expect(state.notes[0].title).toBe('changed')
    expect(state.notes[0].updatedAt).toBeDefined()
  })

  it('deleteNote removes note', () => {
    let state: any = { notes: [] }
    const set = (patch: any) => {
      if (typeof patch === 'function') state = patch(state)
      else state = { ...state, ...patch }
    }
    const get = () => state
  const slice = createNoteSlice(set, get as any, {} as any)
    const created = slice.createNote?.({ title: 't', summary: '', content: '' })
    const id = created!.id
    slice.deleteNote(id)
    expect(state.notes.length).toBe(0)
  })
})
