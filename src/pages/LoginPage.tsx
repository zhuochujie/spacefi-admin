import { useNavigate } from 'react-router'
import { WalletLoginPanel } from '../components/login/WalletLoginPanel'

type LoginPageProps = {
  onLogin: (token: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()

  return (
    <main className="shell auth-shell">
      <WalletLoginPanel
        onLogin={(token) => {
          onLogin(token)
          navigate('/overview', { replace: true })
        }}
      />
    </main>
  )
}
