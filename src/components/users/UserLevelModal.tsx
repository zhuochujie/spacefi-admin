import { useState, type FormEvent } from 'react'
import type { UserRecord } from '../../api'
import { shortAddress } from '../../lib/format'

type UserLevelModalProps = {
  open: boolean
  user: UserRecord | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: { manualVipLevel?: number; nodeLevel?: number }) => void
}

export function UserLevelModal({
  open,
  user,
  busy,
  error,
  onClose,
  onSubmit,
}: UserLevelModalProps) {
  const [manualVipLevel, setManualVipLevel] = useState(() => String(user?.manualVipLevel ?? ''))
  const [nodeLevel, setNodeLevel] = useState(() => String(user?.nodeLevel ?? ''))
  const [localError, setLocalError] = useState('')

  if (!open || !user) return null

  function parseLevel(value: string) {
    if (value.trim() === '') return undefined
    if (!/^\d+$/.test(value.trim())) return null

    return Number(value.trim())
  }

  const nextManualVipLevel = parseLevel(manualVipLevel)
  const nextNodeLevel = parseLevel(nodeLevel)
  const isValid = nextManualVipLevel !== null && nextNodeLevel !== null
  const hasChanges =
    nextManualVipLevel !== user.manualVipLevel ||
    nextNodeLevel !== user.nodeLevel
  const canSubmit = isValid && hasChanges && !busy

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (nextManualVipLevel === null || nextNodeLevel === null) {
      setLocalError('请输入非负整数等级。')
      return
    }

    if (nextManualVipLevel == null && nextNodeLevel == null) {
      setLocalError('至少修改一个等级。')
      return
    }

    if (!hasChanges) return

    onSubmit({
      ...(nextManualVipLevel == null ? {} : { manualVipLevel: nextManualVipLevel }),
      ...(nextNodeLevel == null ? {} : { nodeLevel: nextNodeLevel }),
    })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-level-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{shortAddress(user.address)}</p>
            <h2 id="user-level-modal-title">修改等级</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="detail-filters level-grid">
            <div className="field compact field-editable">
              <label htmlFor="manual-vip-level">指定VIP等级</label>
              <input
                id="manual-vip-level"
                inputMode="numeric"
                value={manualVipLevel}
                onChange={(event) => setManualVipLevel(event.target.value)}
                placeholder="请输入等级"
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="node-level">节点等级</label>
              <input
                id="node-level"
                inputMode="numeric"
                value={nodeLevel}
                onChange={(event) => setNodeLevel(event.target.value)}
                placeholder="请输入等级"
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              取消
            </button>
            <button type="submit" className="primary" disabled={!canSubmit}>
              {busy ? '保存中...' : '保存'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
