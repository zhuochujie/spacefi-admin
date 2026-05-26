import { useState, type FormEvent } from 'react'
import type { DividendRule } from '../../api'
import { formatDividendBp, formatDividendCategory } from '../../lib/dividends'

type DividendRuleModalProps = {
  open: boolean
  rule: DividendRule | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: { bp: number }) => void
}

export function DividendRuleModal({
  open,
  rule,
  busy,
  error,
  onClose,
  onSubmit,
}: DividendRuleModalProps) {
  const [bp, setBp] = useState(String(rule?.bp ?? 0))
  const [localError, setLocalError] = useState('')

  if (!open || !rule) return null

  const numericBp = /^\d+$/.test(bp.trim()) ? Number(bp.trim()) : null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (numericBp == null) {
      setLocalError('比例 BP 必须是非负整数。')
      return
    }

    if (numericBp < 0 || numericBp > 10000) {
      setLocalError('比例 BP 范围是 0 - 10000。')
      return
    }

    onSubmit({ bp: numericBp })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dividend-rule-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Dividend Rule</p>
            <h2 id="dividend-rule-modal-title">修改分红比例</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="dividend-form-grid">
            <div className="field compact">
              <label>规则类型</label>
              <div className="readonly-value">{formatDividendCategory(rule.category)}</div>
            </div>
            <div className="field compact">
              <label>Token</label>
              <div className="readonly-value">{rule.token}</div>
            </div>
            <div className="field compact">
              <label>等级</label>
              <div className="readonly-value">{rule.level}</div>
            </div>
            <div className="field compact field-editable">
              <label htmlFor="dividend-bp">比例 BP</label>
              <input
                id="dividend-bp"
                inputMode="numeric"
                value={bp}
                onChange={(event) => setBp(event.target.value)}
                placeholder="0 - 10000"
              />
            </div>
            <div className="field compact">
              <label>换算比例</label>
              <div className="readonly-value">{numericBp == null ? '-' : formatDividendBp(numericBp)}</div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              取消
            </button>
            <button type="submit" className="primary" disabled={busy}>
              {busy ? '保存中...' : '保存'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
