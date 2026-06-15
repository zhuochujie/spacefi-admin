import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { changeAdminPassword } from '../../api'

type ChangePasswordModalProps = {
  open: boolean
  token: string
  onClose: () => void
}

export function ChangePasswordModal({ open, token, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const changePasswordMutation = useMutation({
    mutationFn: () => changeAdminPassword(token, currentPassword, newPassword),
  })

  if (!open) return null
  const canSubmit =
    Boolean(currentPassword && newPassword && confirmPassword) &&
    newPassword.length >= 8 &&
    newPassword.length <= 128 &&
    newPassword !== currentPassword &&
    newPassword === confirmPassword &&
    !changePasswordMutation.isPending

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')
    changePasswordMutation.reset()

    if (!currentPassword || !newPassword || !confirmPassword) {
      setLocalError('请完整填写密码信息。')
      return
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      setLocalError('新密码长度必须为 8 至 128 个字符。')
      return
    }

    if (newPassword === currentPassword) {
      setLocalError('新密码不能与当前密码相同。')
      return
    }

    if (newPassword !== confirmPassword) {
      setLocalError('两次输入的新密码不一致。')
      return
    }

    changePasswordMutation.mutate()
  }

  function handleClose() {
    if (changePasswordMutation.isPending) return
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section
        className="modal-panel modal-panel-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">Account Security</p>
            <h2 id="change-password-title">修改密码</h2>
          </div>
          <button type="button" className="secondary" onClick={handleClose} disabled={changePasswordMutation.isPending}>
            关闭
          </button>
        </header>

        {changePasswordMutation.isSuccess ? (
          <div className="detail-section">
            <p className="status success">密码修改成功。</p>
            <div className="modal-actions">
              <button type="button" className="primary" onClick={onClose}>
                完成
              </button>
            </div>
          </div>
        ) : (
          <form className="detail-section edit-level-form" onSubmit={handleSubmit}>
            <div className="field field-editable">
              <label htmlFor="current-password">当前密码</label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoFocus
              />
            </div>
            <div className="field field-editable">
              <label htmlFor="new-password">新密码</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="8 至 128 个字符"
              />
            </div>
            <div className="field field-editable">
              <label htmlFor="confirm-password">确认新密码</label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary" onClick={handleClose} disabled={changePasswordMutation.isPending}>
                取消
              </button>
              <button type="submit" className="primary" disabled={!canSubmit}>
                {changePasswordMutation.isPending ? '修改中...' : '确认修改'}
              </button>
            </div>

            {(localError || changePasswordMutation.error) ? (
              <p className="status error">{localError || changePasswordMutation.error?.message}</p>
            ) : null}
          </form>
        )}
      </section>
    </div>
  )
}
