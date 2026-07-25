import { useState, type FormEvent } from 'react'
import type { AdminConfigItem } from '../../api'
import { formatDividendBp } from '../../lib/dividends'
import { formatAmount } from '../../lib/format'

type ConfigModalProps = {
  open: boolean
  config: AdminConfigItem | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (value: string) => void
}

export function ConfigModal({
  open,
  config,
  busy,
  error,
  onClose,
  onSubmit,
}: ConfigModalProps) {
  const [value, setValue] = useState(config?.value ?? '')
  const [localError, setLocalError] = useState('')

  if (!open || !config) return null
  function formatSecondsAsDays(nextValue: string) {
    const days = Number(nextValue) / 86400
    return `${days.toFixed(2).replace(/\.?0+$/, '')}天`
  }

  const isWeiConfig = config.key.endsWith('WEI')
  const isBpConfig = config.key.endsWith('BP')
  const isSecondsConfig = config.key.endsWith('SECONDS')
  const isBooleanConfig = config.key === 'FREE_MINER_CAN_INVITE'
  const isNumericValue = /^\d+$/.test(value.trim())
  const readableValue = isWeiConfig && isNumericValue ? formatAmount(value.trim(), { display: true }) : '-'
  const readableBp = isBpConfig && isNumericValue ? formatDividendBp(Number(value.trim())) : '-'
  const readableDays = isSecondsConfig && isNumericValue ? formatSecondsAsDays(value.trim()) : '-'
  const nextValue = value.trim()
  const hasChanges = nextValue !== config.value.trim()
  const isValidValue = isBooleanConfig ? ['0', '1'].includes(nextValue) : isNumericValue
  const canSubmit = isValidValue && hasChanges && !busy

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (!isValidValue) {
      if (isBooleanConfig) {
        setLocalError('该配置只能填写 1 或 0。')
        return
      }

      setLocalError('配置值必须是非负整数字符串。')
      return
    }

    if (!hasChanges) return

    onSubmit(nextValue)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="config-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Config</p>
            <h2 id="config-modal-title">修改配置</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="dividend-form-grid">
            <div className="field compact">
              <label>Key</label>
              <div className="readonly-value">{config.key}</div>
            </div>
            <div className="field compact field-editable">
              <label htmlFor="config-value">配置值</label>
              <input
                id="config-value"
                inputMode="numeric"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="请输入非负整数"
              />
              {isWeiConfig ? <span className="field-hint">对应数量：{readableValue}</span> : null}
              {isBpConfig ? <span className="field-hint">对应比例：{readableBp}</span> : null}
              {isSecondsConfig ? <span className="field-hint">对应天数：{readableDays}</span> : null}
              {isBooleanConfig ? <span className="field-hint">1 表示开启，0 表示关闭。</span> : null}
            </div>
            <div className="field compact config-desc-field">
              <label>说明</label>
              <div className="readonly-value">{config.desc}</div>
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
