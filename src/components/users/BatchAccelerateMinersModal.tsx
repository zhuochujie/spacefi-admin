import { useMemo, useState } from 'react'
import type { BatchAccelerateMinersResult } from '../../api'
import { formatAmount } from '../../lib/format'

type BatchAccelerateMinersModalProps = {
  open: boolean
  busy?: boolean
  error?: string
  result?: BatchAccelerateMinersResult | null
  onClose: () => void
  onSubmit: (addresses: string[]) => void
}

const addressPattern = /^0x[a-fA-F0-9]{40}$/

export function BatchAccelerateMinersModal({
  open,
  busy = false,
  error,
  result,
  onClose,
  onSubmit,
}: BatchAccelerateMinersModalProps) {
  const [rawAddresses, setRawAddresses] = useState('')
  const [localError, setLocalError] = useState('')

  const parsedAddresses = useMemo(
    () => parseAddressList(rawAddresses),
    [rawAddresses],
  )

  if (!open) return null

  const handleClose = () => {
    if (busy) return
    setRawAddresses('')
    setLocalError('')
    onClose()
  }

  const handleSubmit = () => {
    const invalidAddresses = parsedAddresses.filter(
      (address) => !addressPattern.test(address),
    )

    if (parsedAddresses.length <= 0) {
      setLocalError('请输入地址。')
      return
    }

    if (parsedAddresses.length > 500) {
      setLocalError('一次最多提交 500 个地址。')
      return
    }

    if (invalidAddresses.length > 0) {
      setLocalError(`存在无效地址：${invalidAddresses.slice(0, 3).join(', ')}`)
      return
    }

    setLocalError('')
    onSubmit(parsedAddresses)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-accelerate-miners-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Batch Accelerate</p>
            <h2 id="batch-accelerate-miners-title">批量加速矿机出局</h2>
          </div>
          <button type="button" className="secondary" disabled={busy} onClick={handleClose}>
            关闭
          </button>
        </header>

        <div className="form-grid">
          <label className="field">
            <span>地址列表</span>
            <textarea
              value={rawAddresses}
              disabled={busy}
              rows={10}
              placeholder="每行一个地址，也支持逗号、空格分隔"
              onChange={(event) => {
                setRawAddresses(event.target.value)
                setLocalError('')
              }}
            />
          </label>

          <p className="status warning">
            这个操作会把匹配地址名下所有未出局的普通矿机直接释放到 expectedReward，并增加 SPACE 余额。
          </p>

          <p className="status">
            已解析 {parsedAddresses.length} 个地址，最多 500 个。
          </p>

          {result && (
            <div className="summary-row compact-summary">
              <div className="summary-card">
                <span>输入地址</span>
                <strong>{result.inputAddressCount}</strong>
              </div>
              <div className="summary-card">
                <span>匹配账户</span>
                <strong>{result.matchedAccountCount}</strong>
              </div>
              <div className="summary-card">
                <span>加速账户</span>
                <strong>{result.acceleratedAccountCount}</strong>
              </div>
              <div className="summary-card">
                <span>加速矿机</span>
                <strong>{result.acceleratedMinerCount}</strong>
              </div>
              <div className="summary-card">
                <span>释放 SPACE</span>
                <strong>{formatAmount(result.totalReward, { display: true })}</strong>
              </div>
            </div>
          )}

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary" disabled={busy} onClick={handleClose}>
            取消
          </button>
          <button type="button" className="primary" disabled={busy} onClick={handleSubmit}>
            {busy ? '提交中...' : '确认批量加速'}
          </button>
        </div>
      </div>
    </div>
  )
}

function parseAddressList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[\s,，;；]+/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}
