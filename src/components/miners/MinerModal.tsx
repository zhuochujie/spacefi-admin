import { useState, type FormEvent } from 'react'
import type { AdminMiner, CreateMinerPayload, UpdateMinerPayload } from '../../api'
import { formatAmount } from '../../lib/format'

type MinerModalProps = {
  open: boolean
  miner: AdminMiner | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: CreateMinerPayload | UpdateMinerPayload) => void
}

export function MinerModal({
  open,
  miner,
  busy,
  error,
  onClose,
  onSubmit,
}: MinerModalProps) {
  const [id, setId] = useState(miner?.id ?? '')
  const [name, setName] = useState(miner?.name ?? '')
  const [price, setPrice] = useState(miner?.price ?? '')
  const [expectedReward, setExpectedReward] = useState(miner?.expectedReward ?? '')
  const [desc, setDesc] = useState(miner?.desc ?? '')
  const [isPurchasable, setIsPurchasable] = useState(miner?.isPurchasable ?? false)
  const [localError, setLocalError] = useState('')

  if (!open) return null

  const editing = Boolean(miner)
  const formattedPrice = /^\d+$/.test(price.trim()) ? formatAmount(price.trim(), { display: true }) : '-'
  const formattedExpectedReward = /^\d+$/.test(expectedReward.trim())
    ? formatAmount(expectedReward.trim(), { display: true })
    : '-'
  const nextId = id.trim()
  const nextName = name.trim()
  const nextPrice = price.trim()
  const nextExpectedReward = expectedReward.trim()
  const nextDesc = desc.trim()
  const isValid =
    (editing || Boolean(nextId)) &&
    Boolean(nextName) &&
    /^\d+$/.test(nextPrice) &&
    /^\d+$/.test(nextExpectedReward)
  const hasChanges = !editing || (
    nextName !== miner?.name.trim() ||
    nextPrice !== miner.price.trim() ||
    nextExpectedReward !== miner.expectedReward.trim() ||
    nextDesc !== (miner.desc ?? '').trim() ||
    isPurchasable !== miner.isPurchasable
  )
  const canSubmit = isValid && hasChanges && !busy

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (!editing && !nextId) {
      setLocalError('矿机 ID 必填。')
      return
    }

    if (!nextName) {
      setLocalError('矿机名称必填。')
      return
    }

    if (!hasChanges) return

    if (!/^\d+$/.test(nextPrice) || !/^\d+$/.test(nextExpectedReward)) {
      setLocalError('价格和预期奖励必须是非负整数字符串。')
      return
    }

    const payload = {
      ...(!editing ? { id: nextId } : {}),
      name: nextName,
      price: nextPrice,
      expectedReward: nextExpectedReward,
      ...(nextDesc ? { desc: nextDesc } : { desc: '' }),
      isPurchasable,
    }

    onSubmit(payload)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="miner-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Miner</p>
            <h2 id="miner-modal-title">{editing ? '修改矿机' : '新增矿机'}</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="miner-form-grid">
            <div className={editing ? 'field compact' : 'field compact field-editable'}>
              <label htmlFor="miner-id">矿机 ID</label>
              {editing ? (
                <div className="readonly-value">{miner?.id}</div>
              ) : (
                <input
                  id="miner-id"
                  value={id}
                  onChange={(event) => setId(event.target.value)}
                  placeholder="SPACE_100"
                />
              )}
            </div>
            <div className="field compact field-editable">
              <label htmlFor="miner-name">名称</label>
              <input
                id="miner-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="SPACE 100"
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="miner-price">价格</label>
              <input
                id="miner-price"
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="最小单位字符串"
              />
              <span className="field-hint">对应数量：{formattedPrice}</span>
            </div>
            <div className="field compact field-editable">
              <label htmlFor="miner-reward">预期奖励</label>
              <input
                id="miner-reward"
                inputMode="numeric"
                value={expectedReward}
                onChange={(event) => setExpectedReward(event.target.value)}
                placeholder="最小单位字符串"
              />
              <span className="field-hint">对应数量：{formattedExpectedReward}</span>
            </div>
            <label className="checkbox-option miner-checkbox">
              <input
                type="checkbox"
                checked={isPurchasable}
                onChange={(event) => setIsPurchasable(event.target.checked)}
              />
              可购买
            </label>
            <div className="field compact field-editable miner-desc-field">
              <label htmlFor="miner-desc">描述或 i18n key</label>
              <textarea
                id="miner-desc"
                value={desc}
                onChange={(event) => setDesc(event.target.value)}
                placeholder="miner.desc.SPACE_100"
                rows={4}
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
