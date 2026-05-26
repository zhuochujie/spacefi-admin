import { useState, type FormEvent } from 'react'
import type { AdminConfigItem } from '../../api'

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    const nextValue = value.trim()
    if (!/^\d+$/.test(nextValue)) {
      setLocalError('配置值必须是非负整数字符串。')
      return
    }

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
