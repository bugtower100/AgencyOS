import type { StateCreator } from 'zustand'
import type { AnomalySummary } from '@/lib/types'
import { makeCrud } from './slice-helpers'

export interface AnomalySlice {
  anomalies: AnomalySummary[]
  createAnomaly: (payload: Omit<AnomalySummary, 'id'>) => void
  updateAnomaly: (id: string, payload: Omit<AnomalySummary, 'id'>) => void
  deleteAnomaly: (id: string) => void
}

export const createAnomalySlice: StateCreator<
  AnomalySlice,
  [],
  [],
  AnomalySlice
> = (set, get) => ({
  anomalies: [],
    ...(() => {
  const crud = makeCrud<AnomalySummary>('anomalies', set, get)
      return {
    createAnomaly: (payload: Omit<AnomalySummary, 'id'>) => crud.create(payload),
    updateAnomaly: (id: string, payload: Omit<AnomalySummary, 'id'>) => crud.update(id, payload),
        deleteAnomaly: (id: string) => crud.remove(id),
      }
    })(),
})
