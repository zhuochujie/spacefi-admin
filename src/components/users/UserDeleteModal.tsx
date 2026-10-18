import { useState, type FormEvent } from 'react'
import type { DeleteUserResult, UserRecord } from '../../api'
import { formatAmount, shortAddress } from '../../lib/format'

type UserDeleteModalProps = {
  open: boolean
  user: UserRecord | null
  busy: boolean
  error?: string
  result: DeleteUserResult | null
  onClose: () => void
  onSubmit: (confirmAddress: string) => void
}

export function UserDeleteModal({
  open,
  user,
  busy,
  error,
  result,
  onClose,
  onSubmit,
}: UserDeleteModalProps) {
  const [confirmAddress, setConfirmAddress] = useState('')
  const [localError, setLocalError] = useState('')

  if (!open || !user) return null

  const normalizedConfirmAddress = confirmAddress.trim().toLowerCase()
  const normalizedUserAddress = user.address.toLowerCase()
  const hasSubordinates = (user.teamCount ?? 0) > 0
  const canSubmit =
    !busy &&
    !result &&
    !hasSubordinates &&
    normalizedConfirmAddress === normalizedUserAddress

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    if (hasSubordinates) {
      setLocalError('该用户存在下级，不能删除。')
      return
    }

    if (normalizedConfirmAddress !== normalizedUserAddress) {
      setLocalError('请输入完整钱包地址确认删除。')
      return
    }

    onSubmit(normalizedConfirmAddress)
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-delete-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{shortAddress(user.address)}</p>
            <h2 id="user-delete-modal-title">删除用户</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>
            关闭
          </button>
        </header>

        <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
          <p className="status warning">
            删除后会移除该用户的余额、资金记录、付费矿机、免费矿机、提现签名、购买签名和邀请关系。市场历史订单和链上记录不会删除。
          </p>

          <div className="detail-filters level-grid">
            <div className="field compact">
              <label>用户ID</label>
              <strong>{user.id}</strong>
            </div>
            <div className="field compact">
              <label>下级数量</label>
              <strong>{user.teamCount ?? 0}</strong>
            </div>
            <div className="field compact">
              <label>SPACE余额</label>
              <strong>{formatAmount(user.balance, { display: true })}</strong>
            </div>
            <div className="field compact">
              <label>USDT余额</label>
              <strong>{formatAmount(user.usdtBalance, { display: true })}</strong>
            </div>
          </div>

          <div className="field compact field-editable">
            <label htmlFor="delete-user-address">输入完整钱包地址确认删除</label>
            <input
              id="delete-user-address"
              value={confirmAddress}
              onChange={(event) => setConfirmAddress(event.target.value)}
              placeholder={user.address}
              disabled={busy || Boolean(result)}
            />
          </div>

          {hasSubordinates && <p className="status error">该用户存在下级，不能删除。</p>}

          {result && (
            <p className="status success">
              删除完成：资金记录 {result.deleted.accountBalanceLogs} 条，付费矿机 {result.deleted.accountMiners} 条，免费矿机 {result.deleted.freeMiners} 条，提现签名 {result.deleted.accountWithdrawSignatures} 条，购买签名 {result.deleted.minerPurchaseSignatures} 条，邀请关系 {result.deleted.accountRelations} 条。
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="secondary" onClick={onClose} disabled={busy}>
              {result ? '完成' : '取消'}
            </button>
            <button type="submit" className="danger" disabled={!canSubmit}>
              {busy ? '删除中...' : '确认删除'}
            </button>
          </div>

          {(localError || error) && <p className="status error">{localError || error}</p>}
        </form>
      </section>
    </div>
  )
}
