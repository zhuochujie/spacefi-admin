import { useNavigate } from 'react-router'
import { AdminLoginPanel } from '../components/login/AdminLoginPanel'

type LoginPageProps = {
  onLogin: (token: string) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate()

  return (
    <main className="shell auth-shell">
      <AdminLoginPanel
        onLogin={(token) => {
          onLogin(token)
          navigate('/overview', { replace: true })
        }}
      />
    </main>
  )
}
