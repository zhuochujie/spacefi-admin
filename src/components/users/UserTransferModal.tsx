import { useEffect, useState, type FormEvent } from 'react'
import { formatUnits, parseUnits } from 'viem'
import type { UserRecord, UserTransferResult } from '../../api'
import { formatAmount, shortAddress } from '../../lib/format'

type TransferToken = 'SPACE' | 'USDT'

type UserTransferModalProps = {
  open: boolean
  user: UserRecord | null
  busy: boolean
  error?: string
  result?: UserTransferResult | null
  onClose: () => void
  onSubmit: (payload: { toAddress: string; token: TransferToken; amount: string }) => void
}

const addressPattern = /^0x[a-fA-F0-9]{40}$/

export function UserTransferModal({
  open,
  user,
  busy,
  error,
  result,
  onClose,
  onSubmit,
}: UserTransferModalProps) {
  const [token, setToken] = useState<TransferToken>('USDT')
  const [toAddress, setToAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [localError, setLocalError] = useState('')
  const [displayUser, setDisplayUser] = useState<UserRecord | null>(null)
  const [appliedResultKey, setAppliedResultKey] = useState('')

  useEffect(() => {
    if (!open) return
    setDisplayUser(user)
    setAppliedResultKey('')
  }, [open, user])

  useEffect(() => {
    if (!result || !displayUser || result.from.id !== displayUser.id) return
    const resultKey = `${result.from.id}:${result.from.balance}:${result.from.usdtBalance}:${result.to.id}:${result.to.balance}:${result.to.usdtBalance}`
    if (resultKey === appliedResultKey) return

    setDisplayUser((current) => {
      if (!current) return current

      return {
        ...current,
        balance: result.from.balance,
        usdtBalance: result.from.usdtBalance,
      }
    })
    setToAddress('')
    setAmount('')
    setLocalError('')
    setAppliedResultKey(resultKey)
  }, [appliedResultKey, displayUser, result])

  if (!open || !displayUser) return null
  const currentUser = displayUser

  function handleClose() {
    if (busy) return
    setToken('USDT')
    setToAddress('')
    setAmount('')
    setLocalError('')
    onClose()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    const normalizedToAddress = toAddress.trim().toLowerCase()
    if (!addressPattern.test(normalizedToAddress)) {
      setLocalError('请输入有效的目标地址。')
      return
    }

    if (normalizedToAddress === currentUser.address.toLowerCase()) {
      setLocalError('不能转账给自己。')
      return
    }

    let amountWei: bigint
    try {
      amountWei = parseUnits(amount.trim(), 18)
    } catch {
      setLocalError(`请输入有效的 ${token} 数量。`)
      return
    }

    if (amountWei <= 0n) {
      setLocalError('转账数量必须大于 0。')
      return
    }

    onSubmit({
      toAddress: normalizedToAddress,
      token,
      amount: amountWei.toString(),
    })
  }

  const currentBalance = token === 'USDT' ? currentUser.usdtBalance : currentUser.balance

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-transfer-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{shortAddress(currentUser.address)}</p>
            <h2 id="user-transfer-modal-title">平台内转账</h2>
          </div>
          <button type="button" className="secondary" onClick={handleClose} disabled={busy}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <div className="detail-filters level-grid">
            <div className="field compact field-editable">
              <label htmlFor="user-transfer-token">转账币种</label>
              <select
                id="user-transfer-token"
                value={token}
                onChange={(event) => setToken(event.target.value as TransferToken)}
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
              <label htmlFor="user-transfer-address">目标地址</label>
              <input
                id="user-transfer-address"
                value={toAddress}
                onChange={(event) => setToAddress(event.target.value.trim())}
                placeholder="请输入目标用户地址"
                disabled={busy}
              />
            </div>
            <div className="field compact field-editable">
              <label htmlFor="user-transfer-amount">转账数量（{token}）</label>
              <div className="input-with-action">
                <input
                  id="user-transfer-amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="请输入转账数量"
                  disabled={busy}
                />
                <button
                  type="button"
                  className="secondary small"
                  disabled={busy || BigInt(currentBalance) <= 0n}
                  onClick={() => setAmount(formatUnits(BigInt(currentBalance), 18))}
                >
                  最大
                </button>
              </div>
            </div>
          </div>

          <p className="status warning">
            这是后台平台内转账，只修改系统余额，不会发起链上交易。
          </p>

          {result && (
            <p className="status success">
              转账成功：{shortAddress(result.from.address)} → {shortAddress(result.to.address)}
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={handleClose} disabled={busy}>
              取消
            </button>
            <button type="submit" className="primary" disabled={busy || !amount.trim() || !toAddress.trim()}>
              {busy ? '提交中...' : '确认转账'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
