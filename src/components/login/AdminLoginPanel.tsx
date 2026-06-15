import { useMutation } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { loginAdmin } from '../../api'

type AdminLoginPanelProps = {
  onLogin: (token: string) => void
}

export function AdminLoginPanel({ onLogin }: AdminLoginPanelProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const loginMutation = useMutation({
    mutationFn: async ({ loginUsername, loginPassword }: { loginUsername: string; loginPassword: string }) => {
      return loginAdmin(loginUsername, loginPassword)
    },
    onSuccess: (result) => {
      onLogin(result.access_token)
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')

    const loginUsername = username.trim()
    if (!loginUsername || !password) {
      setLocalError('请输入用户名和密码。')
      return
    }

    loginMutation.mutate({ loginUsername, loginPassword: password })
  }

  return (
    <section className="auth-panel">
      <div className="auth-copy">
        <p className="eyebrow">Admin Console</p>
        <h1>管理后台</h1>
        <p className="muted">使用后台账号登录。</p>

        <form className="detail-section" onSubmit={handleSubmit}>
          <div className="field field-editable">
            <label htmlFor="admin-username">用户名</label>
            <input
              id="admin-username"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="请输入用户名"
              autoFocus
            />
          </div>
          <div className="field field-editable">
            <label htmlFor="admin-password">密码</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="请输入密码"
            />
          </div>
          <button type="submit" className="primary login-button" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? '登录中...' : '登录'}
          </button>
        </form>

        {loginMutation.error || localError ? (
          <p className="status error">{loginMutation.error?.message || localError}</p>
        ) : null}
      </div>
    </section>
  )
}
