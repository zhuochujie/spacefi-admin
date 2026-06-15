import { useState, type FormEvent } from 'react'
import type { DividendRuleGroup, DividendRuleGroupPayload } from '../../api'
import { formatDividendBp, formatDividendCategory } from '../../lib/dividends'

type DividendRuleModalProps = {
  open: boolean
  group: DividendRuleGroup | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: DividendRuleGroupPayload) => void
}

export function DividendRuleModal({
  open,
  group,
  busy,
  error,
  onClose,
  onSubmit,
}: DividendRuleModalProps) {
  const sortedRules = (group?.rules ?? []).slice().sort((left, right) => left.level - right.level)
  const [ruleInputs, setRuleInputs] = useState(() =>
    sortedRules.map((rule) => ({
      level: rule.level,
      bp: String(rule.bp),
    })),
  )
  const [localError, setLocalError] = useState('')

  if (!open || !group) return null

  const parsedRules = ruleInputs.map((rule) => ({
    level: rule.level,
    bp: /^\d+$/.test(rule.bp.trim()) ? Number(rule.bp.trim()) : null,
  }))
  const totalBp = parsedRules.reduce((sum, rule) => sum + (rule.bp ?? 0), 0)
  const isValid = parsedRules.every(
    (rule) => rule.bp != null && rule.bp >= 0 && rule.bp <= 10000,
  ) && totalBp === 10000
  const originalBpByLevel = new Map(sortedRules.map((rule) => [rule.level, rule.bp]))
  const hasChanges = parsedRules.some(
    (rule) => rule.bp != null && rule.bp !== originalBpByLevel.get(rule.level),
  )
  const canSubmit = isValid && hasChanges && !busy

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (parsedRules.some((rule) => rule.bp == null)) {
      setLocalError('所有比例 BP 都必须是非负整数。')
      return
    }

    if (parsedRules.some((rule) => rule.bp == null || rule.bp < 0 || rule.bp > 10000)) {
      setLocalError('比例 BP 范围是 0 - 10000。')
      return
    }

    if (totalBp !== 10000) {
      setLocalError('当前分组 BP 总和必须等于 10000。')
      return
    }

    if (!hasChanges) return

    onSubmit({
      rules: parsedRules.map((rule) => ({
        level: rule.level,
        bp: rule.bp ?? 0,
      })),
    })
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
            <h2 id="dividend-rule-modal-title">修改分红分组</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="dividend-form-grid">
            <div className="field compact">
              <label>规则类型</label>
              <div className="readonly-value">{formatDividendCategory(group.category)}</div>
            </div>
            <div className="field compact">
              <label>Token</label>
              <div className="readonly-value">{group.token}</div>
            </div>
            <div className="field compact">
              <label>当前总 BP</label>
              <div className="readonly-value">{totalBp}</div>
            </div>
            <div className="field compact">
              <label>当前总比例</label>
              <div className="readonly-value">{formatDividendBp(totalBp)}</div>
            </div>
            {ruleInputs.map((ruleInput, index) => {
              const numericBp = parsedRules[index]?.bp

              return (
                <div key={ruleInput.level} className="field compact field-editable">
                  <label htmlFor={`dividend-bp-${ruleInput.level}`}>等级 {ruleInput.level} 比例 BP</label>
                  <input
                    id={`dividend-bp-${ruleInput.level}`}
                    inputMode="numeric"
                    value={ruleInput.bp}
                    onChange={(event) => {
                      const nextValue = event.target.value
                      setRuleInputs((state) =>
                        state.map((item) => (item.level === ruleInput.level ? { ...item, bp: nextValue } : item)),
                      )
                    }}
                    placeholder="0 - 10000"
                  />
                  <span className="field-hint">{numericBp == null ? '-' : formatDividendBp(numericBp)}</span>
                </div>
              )
            })}
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
