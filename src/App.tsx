import { useQueryClient } from '@tanstack/react-query'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AdminLayout } from './components/layout/AdminLayout'
import { ConfigsPage } from './pages/ConfigsPage'
import { DividendsPage } from './pages/DividendsPage'
import { LoginPage } from './pages/LoginPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { MarketPage } from './pages/MarketPage'
import { MinersPage } from './pages/MinersPage'
import { NoticesPage } from './pages/NoticesPage'
import { OverviewPage } from './pages/OverviewPage'
import { UsersPage } from './pages/UsersPage'
import { AUTH_EXPIRED_EVENT, clearStoredToken, getStoredToken, storeToken } from './lib/session'
import './App.css'

const BuybackPage = lazy(() => import('./pages/BuybackPage'))

function App() {
  const queryClient = useQueryClient()
  const initialToken = useMemo(() => getStoredToken(), [])
  const [token, setToken] = useState(initialToken)
  const buybackPage = <Suspense fallback={<div className="panel">回购数据加载中...</div>}><BuybackPage /></Suspense>

  function handleLogin(nextToken: string) {
    storeToken(nextToken)
    setToken(nextToken)
  }

  function handleLogout() {
    clearStoredToken()
    setToken('')
    queryClient.clear()
  }

  useEffect(() => {
    function handleAuthExpired() {
      setToken('')
      queryClient.clear()
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired)
  }, [queryClient])

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? '/overview' : '/login'} replace />} />
      <Route
        path="/login"
        element={token ? <Navigate to="/overview" replace /> : <LoginPage onLogin={handleLogin} />}
      />
      <Route
        path="/overview"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<OverviewPage />} />
      </Route>
      <Route
        path="/users"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<UsersPage />} />
      </Route>
      <Route
        path="/miners"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<MinersPage />} />
      </Route>
      <Route
        path="/dividends"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<DividendsPage />} />
      </Route>
      <Route
        path="/notices"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<NoticesPage />} />
      </Route>
      <Route
        path="/configs"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<ConfigsPage />} />
      </Route>
      <Route
        path="/maintenance"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<MaintenancePage />} />
      </Route>
      <Route
        path="/market"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<MarketPage />} />
      </Route>
      <Route
        path="/buyback"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={buybackPage} />
      </Route>
      <Route
        path="/admin"
        element={token ? <AdminLayout token={token} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      >
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="miners" element={<MinersPage />} />
        <Route path="notices" element={<NoticesPage />} />
        <Route path="dividends" element={<DividendsPage />} />
        <Route path="configs" element={<ConfigsPage />} />
        <Route path="maintenance" element={<MaintenancePage />} />
        <Route path="market" element={<MarketPage />} />
        <Route path="buyback" element={buybackPage} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={token ? '/overview' : '/login'} replace />}
      />
    </Routes>
  )
}

export default App
