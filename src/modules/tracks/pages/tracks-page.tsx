import { useState } from 'react'
import { Panel } from '@/components/ui/panel'
import { useTracksStore } from '@/stores/tracks-store'

export function TracksPage() {
  const tracks = useTracksStore((state) => state.tracks)
  const createTrack = useTracksStore((state) => state.createTrack)
  const updateTrackMeta = useTracksStore((state) => state.updateTrackMeta)
  const updateTrackItemCount = useTracksStore((state) => state.updateTrackItemCount)
  const updateTrackItem = useTracksStore((state) => state.updateTrackItem)
  const deleteTrack = useTracksStore((state) => state.deleteTrack)

  const [name, setName] = useState('')
  const [color, setColor] = useState('#22c55e')
  const [itemCount, setItemCount] = useState(5)

  const handleCreate = () => {
    createTrack({ name, color, itemCount })
    setName('')
    setItemCount(5)
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="text-xs uppercase tracking-[0.4em] text-agency-muted">自定义轨道</p>
        <h1 className="text-2xl font-semibold text-white">自定义轨道管理</h1>
      </header>

      <Panel className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-agency-muted">新建轨道</p>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            名称
            <input
              className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="例如：观察日程 / 特殊流程"
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            颜色
            <input
              type="color"
              className="mt-1 h-[42px] w-full cursor-pointer border border-agency-border bg-agency-ink/60 rounded-xl win98:rounded-none"
              value={color}
              onChange={(event) => setColor(event.target.value)}
            />
          </label>
          <label className="text-xs uppercase tracking-[0.3em] text-agency-muted">
            复选框数量
            <input
              type="number"
              min={1}
              max={32}
              className="mt-1 w-full border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm text-agency-cyan rounded-xl win98:rounded-none"
              value={itemCount}
              onChange={(event) => setItemCount(Number(event.target.value) || 1)}
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              className="w-full border border-agency-cyan/60 px-4 py-2 text-xs uppercase tracking-[0.3em] text-agency-cyan rounded-2xl win98:rounded-none"
              onClick={handleCreate}
            >
              创建轨道
            </button>
          </div>
        </div>
      </Panel>

      {tracks.length ? (
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <Panel
              key={track.id}
              className="space-y-4 border border-agency-border/60 bg-agency-ink/70 shadow-[0_0_0_1px_rgba(15,23,42,0.5)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center bg-agency-ink/80 text-xs text-agency-muted rounded-xl win98:rounded-none">
                    #{index + 1}
                  </span>
                  <input
                    className="min-w-[160px] border border-agency-border bg-agency-ink/60 px-3 py-2 text-sm font-medium text-agency-cyan shadow-inner rounded-xl win98:rounded-none"
                    value={track.name}
                    onChange={(event) =>
                      updateTrackMeta(track.id, {
                        name: event.target.value,
                      })
                    }
                  />
                  <div className="flex items-center gap-2 bg-agency-ink/60 px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-agency-muted rounded-full win98:rounded-none">
                    <span
                      className="h-3 w-3 shadow-[0_0_0_1px_rgba(15,23,42,0.8)] rounded-full win98:rounded-none"
                      style={{ backgroundColor: track.color }}
                    />
                    <span>颜色</span>
                    <input
                      type="color"
                      className="h-6 w-10 cursor-pointer border border-agency-border bg-agency-ink/60 rounded win98:rounded-none"
                      value={track.color}
                      onChange={(event) =>
                        updateTrackMeta(track.id, {
                          color: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-agency-ink/60 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-agency-muted rounded-full win98:rounded-none">
                    <span>复选框数量</span>
                    <input
                      type="number"
                      min={1}
                      max={32}
                      className="h-7 w-16 border border-agency-border bg-agency-ink/80 px-2 text-xs text-agency-cyan rounded-lg win98:rounded-none"
                      value={track.items.length}
                      onChange={(event) =>
                        updateTrackItemCount(track.id, Number(event.target.value) || 1)
                      }
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="border border-agency-border/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-agency-muted transition hover:border-agency-magenta hover:text-agency-magenta rounded-2xl win98:rounded-none"
                  onClick={() => deleteTrack(track.id)}
                >
                  删除轨道
                </button>
              </div>

              <div className="border border-dashed border-agency-border/70 bg-gradient-to-r from-agency-ink/60 via-agency-ink/40 to-agency-ink/60 p-3 rounded-2xl win98:rounded-none">
                <div className="flex flex-wrap gap-3">
                  {track.items.map((item) => (
                    <label
                      key={item.id}
                      className="group flex flex-col items-center gap-1 border border-transparent bg-agency-ink/60 px-3 py-2 text-center text-xs text-agency-muted shadow-sm transition hover:border-agency-cyan/60 hover:bg-agency-ink/80 rounded-xl win98:rounded-none"
                      style={{ color: track.color }}
                    >
                      <input
                        type="checkbox"
                        className="h-5 w-5 cursor-pointer border border-agency-border bg-agency-ink/80 shadow-inner outline-none ring-0 focus-visible:outline-none rounded win98:rounded-none"
                        checked={item.checked}
                        onChange={(event) =>
                          updateTrackItem(track.id, item.id, {
                            checked: event.target.checked,
                          })
                        }
                      />
                      <input
                        className="w-24 border border-agency-border bg-agency-ink/60 px-1 py-0.5 text-[0.65rem] text-agency-cyan placeholder:text-agency-muted/60 rounded win98:rounded-none"
                        value={item.label}
                        onChange={(event) =>
                          updateTrackItem(track.id, item.id, {
                            label: event.target.value,
                          })
                        }
                        placeholder="节点标签"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </Panel>
          ))}
        </div>
      ) : (
        <Panel>
          <p className="text-sm text-agency-muted">尚未创建任何轨道。先在上方创建一条自定义轨道吧。</p>
        </Panel>
      )}
    </div>
  )
}
