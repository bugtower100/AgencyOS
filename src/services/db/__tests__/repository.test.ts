import { describe, it, expect } from 'vitest'
import type { AgencySnapshot } from '@/lib/types'
import { createSnapshotEnvelope, parseSnapshotFile } from '../repository'

describe('parseSnapshotFile', () => {
  it('preserves requisitions/settings/emergency from envelope', () => {
    const snapshot: AgencySnapshot = {
      campaign: {
        id: 'c1',
        name: 'Test',
        divisionCode: 'D-01',
        location: 'Somewhere',
        status: 'active',
        styleTags: [],
        contentFlags: [],
        defaultRules: [],
        updatedAt: '2025-12-19T00:00:00.000Z',
      },
      agents: [],
      missions: [],
      anomalies: [],
      notes: [],
      logs: [],
      requisitions: [
        {
          id: 'r1',
          name: 'Item',
          source: 'hq',
          prices: [{ label: 'Cost', cost: 1 }],
          description: 'Desc',
          createdAt: '2025-12-19T00:00:00.000Z',
          updatedAt: '2025-12-19T00:00:00.000Z',
        },
      ],
      settings: {
        notesAllowHtml: false,
        dashboardReadOnlyStyle: true,
      },
      emergency: {
        isEnabled: true,
        permissions: {
          canReadDom: true,
          canWriteDom: false,
          canWriteCampaignData: false,
          canWriteSettingsData: false,
          allowedAreas: [],
        },
        chatHistory: [],
        actionHistory: [],
        llmConfig: {
          apiUrl: 'https://example.invalid',
          model: 'test',
        },
      },
    }

    const envelope = createSnapshotEnvelope(snapshot)
    const parsed = parseSnapshotFile(envelope)

    expect(parsed.requisitions?.length).toBe(1)
    expect(parsed.requisitions?.[0].id).toBe('r1')
    expect(parsed.settings?.notesAllowHtml).toBe(false)
    expect(parsed.settings?.dashboardReadOnlyStyle).toBe(true)
    expect(parsed.emergency?.isEnabled).toBe(true)
  })
})
