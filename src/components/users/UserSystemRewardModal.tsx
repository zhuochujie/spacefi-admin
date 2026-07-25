import { useState, type FormEvent } from 'react'
import { parseUnits } from 'viem'
import type { UserRecord } from '../../api'
import { formatAmount, shortAddress } from '../../lib/format'

type RewardToken = 'SPACE' | 'USDT'

type UserSystemRewardModalProps = {
  open: boolean
  user: UserRecord | null
  busy: boolean
  error?: string
  onClose: () => void
  onSubmit: (payload: { token: RewardToken; amount: string }) => void
}

export function UserSystemRewardModal({
  open,
  user,
  busy,
  error,
  onClose,
  onSubmit,
}: UserSystemRewardModalProps) {
  const [token, setToken] = useState<RewardToken>('USDT')
  const [amount, setAmount] = useState('')
  const [localError, setLocalError] = useState('')

  if (!open || !user) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    let amountWei: bigint
    try {
      amountWei = parseUnits(amount.trim(), 18)
    } catch {
      setLocalError(`请输入有效的 ${token} 数量。`)
      return
    }

    if (amountWei <= 0n) {
      setLocalError('奖励数量必须大于 0。')
      return
    }

    onSubmit({
      token,
      amount: amountWei.toString(),
    })
  }

  const currentBalance = token === 'USDT' ? user.usdtBalance : user.balance

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="system-reward-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{shortAddress(user.address)}</p>
            <h2 id="system-reward-modal-title">系统奖励</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="detail-filters level-grid">
            <div className="field compact field-editable">
              <label htmlFor="system-reward-token">奖励币种</label>
              <select
                id="system-reward-token"
                value={token}
                onChange={(event) => setToken(event.target.value as RewardToken)}
                disabled={busy}
              >
                <option value="USDT">USDT</option>
                <option value="SPACE">SPACE</option>
              </select>
            </div>
            <div className="field compact">
              <label>当前{token}余额</label>
              <strong>{formatAmount(currentBalance, { display: true })} {token}</strong>
            </div>
            <div className="field compact field-editable">
              <label htmlFor="system-reward-amount">奖励数量（{token}）</label>
              <input
                id="system-reward-amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="请输入奖励数量"
                disabled={busy}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              取消
            </button>
            <button type="submit" className="primary" disabled={busy || !amount.trim()}>
              {busy ? '提交中...' : '确认增加'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
