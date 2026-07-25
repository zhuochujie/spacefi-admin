import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { ChangePasswordModal } from '../account/ChangePasswordModal'
import { useAdminProfileQuery } from '../../hooks/useAdminData'

type AdminLayoutProps = {
  token: string
  onLogout: () => void
}

export function AdminLayout({ token, onLogout }: AdminLayoutProps) {
  const [navOpen, setNavOpen] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const profileQuery = useAdminProfileQuery(token)
  const profile = profileQuery.data ?? null
  const isAdminUser = profile?.username === 'admin'

  if (profileQuery.isLoading && !profile) {
    return <main className="shell">加载中...</main>
  }

  if (!profile) {
    return (
      <main className="shell auth-shell">
        <section className="panel">
          <h1>登录已失效</h1>
          <p className="muted">请重新登录后进入管理后台。</p>
          <button type="button" className="primary" onClick={onLogout}>
            返回登录
          </button>
        </section>
      </main>
    )
  }

  function closeNav() {
    setNavOpen(false)
  }

  function handleLogout() {
    closeNav()
    onLogout()
  }

  return (
    <main className="admin-layout">
      {navOpen ? <button type="button" className="sidebar-backdrop" aria-label="关闭导航" onClick={closeNav} /> : null}

      <aside id="admin-sidebar" className={navOpen ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-brand">
          <p className="eyebrow">Admin Console</p>
          <strong>管理后台</strong>
        </div>
        <nav className="sidebar-nav" aria-label="后台导航">
          <NavLink
            to="/overview"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            平台总览
          </NavLink>
          <NavLink
            to="/users"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            用户管理
          </NavLink>
          <NavLink
            to="/miners"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            矿机管理
          </NavLink>
          <NavLink
            to="/notices"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            公告管理
          </NavLink>
          <NavLink
            to="/dividends"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            分红管理
          </NavLink>
          <NavLink
            to="/configs"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            配置管理
          </NavLink>
          <NavLink
            to="/maintenance"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            onClick={closeNav}
          >
            系统维护
          </NavLink>
          {isAdminUser ? (
            <NavLink
              to="/market"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
              onClick={closeNav}
            >
              市场管理
            </NavLink>
          ) : null}
        </nav>
        <div className="sidebar-footer">
          <span>{profile.username}</span>
          <button
            type="button"
            className="secondary"
            onClick={() => {
              closeNav()
              setPasswordModalOpen(true)
            }}
          >
            修改密码
          </button>
          <button type="button" className="secondary" onClick={handleLogout}>
            退出
          </button>
        </div>
      </aside>

      <section className="admin-content">
        <header className="mobile-appbar">
          <button
            type="button"
            className="secondary menu-button"
            aria-expanded={navOpen}
            aria-controls="admin-sidebar"
            aria-label="打开导航"
            onClick={() => setNavOpen((value) => !value)}
          >
            <span aria-hidden="true" className="menu-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
          <strong>管理后台</strong>
        </header>
        <Outlet context={{ token, profile }} />
      </section>

      <ChangePasswordModal
        key={passwordModalOpen ? 'open' : 'closed'}
        open={passwordModalOpen}
        token={token}
        onClose={() => setPasswordModalOpen(false)}
      />
    </main>
  )
}
