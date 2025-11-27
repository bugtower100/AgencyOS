import type { StateCreator } from 'zustand'
import { createId } from '@/lib/utils'
import type { AnomalySummary } from '@/lib/types'

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
> = (set) => ({
  anomalies: [],
  createAnomaly: (payload) =>
    set((state) => ({
      anomalies: [...state.anomalies, { ...payload, id: createId() }],
    })),
  updateAnomaly: (id, payload) =>
    set((state) => ({
      anomalies: state.anomalies.map((anomaly) => (anomaly.id === id ? { ...payload, id } : anomaly)),
    })),
  deleteAnomaly: (id) =>
    set((state) => ({
      anomalies: state.anomalies.filter((anomaly) => anomaly.id !== id),
    })),
})
