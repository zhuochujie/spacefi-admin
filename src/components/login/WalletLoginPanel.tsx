import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { getAddress } from 'viem'
import {
  useConnection,
  useConnect,
  useSignMessage,
} from 'wagmi'
import { getNonce, loginWithSignature } from '../../api'

type WalletLoginPanelProps = {
  onLogin: (token: string) => void
}

export function WalletLoginPanel({ onLogin }: WalletLoginPanelProps) {
  const [connectionError, setConnectionError] = useState('')
  const connection = useConnection()
  const { connectors, connectAsync, isPending: connectPending } = useConnect()
  const { signMessageAsync, isPending: signPending } = useSignMessage()

  const loginMutation = useMutation({
    mutationFn: async (address: string) => {
      const loginAddress = getAddress(address).toLowerCase()
      const nonce = await getNonce(loginAddress)
      const signature = await signMessageAsync({
        message: `Sign this message to login your account.\n\nAddress: ${loginAddress}\nNonce: ${nonce}`,
      })
      const result = await loginWithSignature(loginAddress, signature)
      return { token: result.access_token, address: loginAddress }
    },
  })

  const busy = connectPending || signPending || loginMutation.isPending
  const currentConnector = connectors[0]

  async function handleLogin() {
    setConnectionError('')
    try {
      const address = connection.address ?? (await connectWallet())
      const result = await loginMutation.mutateAsync(address)
      onLogin(result.token)
    } catch (error) {
      setConnectionError(error instanceof Error ? error.message : '登录失败')
    }
  }

  async function connectWallet() {
    if (!currentConnector) throw new Error('未找到可用钱包连接器')

    const result = await connectAsync({ connector: currentConnector })
    return result.accounts[0]
  }

  return (
    <section className="auth-panel">
      <div className="auth-copy">
        <p className="eyebrow">Admin Console</p>
        <h1>管理后台</h1>
        <p className="muted">使用钱包签名登录后进入用户管理模块。</p>

        <button type="button" className="primary login-button" onClick={handleLogin} disabled={busy}>
          {busy ? '登录中...' : '登录'}
        </button>

        {loginMutation.error || connectionError ? (
          <p className="status error">{loginMutation.error?.message || connectionError}</p>
        ) : null}
      </div>
    </section>
  )
}
