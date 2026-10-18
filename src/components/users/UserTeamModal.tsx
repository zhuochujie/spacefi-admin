import { useEffect, useState } from 'react'
import copy from 'copy-to-clipboard'
import type { TeamMarketTradeStats, UserRecord, UserTeamBranch, UserTeamMember, UserTeamMinerPurchaseStats, UserTeamOverview } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { Pagination } from '../common/Pagination'
import type { TeamBranchFilters, TeamMemberFilters, TeamMinerPurchaseStatsRange } from '../../hooks/useAdminData'
import { formatAmount, formatTime, shortAddress } from '../../lib/format'

type UserTeamModalProps = {
  open: boolean
  user: UserRecord | null
  overview: UserTeamOverview | null
  branches: UserTeamBranch[]
  members: UserTeamMember[]
  branchFilters: TeamBranchFilters
  memberFilters: TeamMemberFilters
  totalBranches: number
  totalMembers: number
  marketStats: TeamMarketTradeStats | null
  minerPurchaseStats: UserTeamMinerPurchaseStats | null
  minerPurchaseStatsRange: TeamMinerPurchaseStatsRange
  busy: boolean
  marketStatsBusy: boolean
  minerPurchaseStatsBusy: boolean
  error?: string
  marketStatsError?: string
  minerPurchaseStatsError?: string
  onClose: () => void
  onQueryMarketStats: (range: { from: number; to: number }) => void
  onQueryMinerPurchaseStats: (range: TeamMinerPurchaseStatsRange) => void
  onBranchPageChange: (page: number) => void
  onMemberFiltersChange: (filters: TeamMemberFilters) => void
  onMemberPageChange: (page: number) => void
}

export function UserTeamModal({
  open,
  user,
  overview,
  branches,
  members,
  branchFilters,
  memberFilters,
  totalBranches,
  totalMembers,
  marketStats,
  minerPurchaseStats,
  minerPurchaseStatsRange,
  busy,
  marketStatsBusy,
  minerPurchaseStatsBusy,
  error,
  marketStatsError,
  minerPurchaseStatsError,
  onClose,
  onQueryMarketStats,
  onQueryMinerPurchaseStats,
  onBranchPageChange,
  onMemberFiltersChange,
  onMemberPageChange,
}: UserTeamModalProps) {
  const [toastMessage, setToastMessage] = useState('')
  const [marketStatsFrom, setMarketStatsFrom] = useState('')
  const [marketStatsTo, setMarketStatsTo] = useState('')
  const [marketStatsLocalError, setMarketStatsLocalError] = useState('')
  const [minerPurchaseStatsFrom, setMinerPurchaseStatsFrom] = useState('')
  const [minerPurchaseStatsTo, setMinerPurchaseStatsTo] = useState('')
  const [minerPurchaseStatsLocalError, setMinerPurchaseStatsLocalError] = useState('')

  useEffect(() => {
    if (!open) return

    setMinerPurchaseStatsFrom('')
    setMinerPurchaseStatsTo('')
    setMinerPurchaseStatsLocalError('')
  }, [open, user?.id])

  if (!open || !user) return null

  const branchTotalPages = Math.max(1, Math.ceil(totalBranches / branchFilters.pageSize))
  const memberTotalPages = Math.max(1, Math.ceil(totalMembers / memberFilters.pageSize))

  const copyAddress = async (address: string) => {
    setToastMessage(await copy(address, { fallbackToPrompt: true }) ? '已复制' : '复制失败')
  }

  const handleQueryMarketStats = () => {
    const from = Math.floor(new Date(marketStatsFrom).getTime() / 1000)
    const to = Math.floor(new Date(marketStatsTo).getTime() / 1000)

    if (!marketStatsFrom || !marketStatsTo || Number.isNaN(from) || Number.isNaN(to)) {
      setMarketStatsLocalError('请选择开始时间和结束时间')
      return
    }

    if (to <= from) {
      setMarketStatsLocalError('结束时间必须大于开始时间')
      return
    }

    setMarketStatsLocalError('')
    onQueryMarketStats({ from, to })
  }

  const handleQueryMinerPurchaseStats = () => {
    const hasFrom = minerPurchaseStatsFrom.trim().length > 0
    const hasTo = minerPurchaseStatsTo.trim().length > 0

    if (hasFrom !== hasTo) {
      setMinerPurchaseStatsLocalError('请选择完整的开始时间和结束时间，或留空查询所有时间。')
      return
    }

    if (!hasFrom && !hasTo) {
      setMinerPurchaseStatsLocalError('')
      onQueryMinerPurchaseStats({ from: 0, to: Math.floor(Date.now() / 1000) })
      return
    }

    const from = Math.floor(new Date(minerPurchaseStatsFrom).getTime() / 1000)
    const to = Math.floor(new Date(minerPurchaseStatsTo).getTime() / 1000)

    if (Number.isNaN(from) || Number.isNaN(to)) {
      setMinerPurchaseStatsLocalError('请选择有效的时间区间。')
      return
    }

    if (to <= from) {
      setMinerPurchaseStatsLocalError('结束时间必须大于开始时间。')
      return
    }

    setMinerPurchaseStatsLocalError('')
    onQueryMinerPurchaseStats({ from, to })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-team-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{shortAddress(user.address)}</p>
            <h2 id="user-team-modal-title">团队数据</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>
            关闭
          </button>
        </header>

        {error && <p className="status error">{error}</p>}

        <section className="summary-row">
          <SummaryCard label="直推人数" value={overview?.directCount ?? 0} />
          <SummaryCard label="团队人数" value={overview?.teamCount ?? 0} />
          <SummaryCard label="团队业绩" value={formatAmount(overview?.teamPerformance ?? '0', { display: true })} />
          <SummaryCard label="直推业绩" value={formatAmount(overview?.directPerformance ?? '0', { display: true })} />
          <SummaryCard label="购买矿机人数" value={overview?.teamMinerBuyerCount ?? 0} />
          <SummaryCard label="普通矿机数" value={overview?.teamMinerCount ?? 0} />
          <SummaryCard label="免费矿机数" value={overview?.teamFreeMinerCount ?? 0} />
          <SummaryCard label="团队奖励" value={`${formatAmount(overview?.teamReward ?? '0', { display: true })} SPACE`} />
        </section>

        <section className="detail-section team-chain-section">
          <div className="panel-head">
            <h3>上级链</h3>
            <span>{overview ? `${overview.superiorChain.length} 个上级` : '加载中'}</span>
          </div>
          {overview && overview.superiorChain.length === 0 ? (
            <p className="status">该用户暂无上级。</p>
          ) : (
            <div className="team-chain">
              {overview?.superiorChain.map((superior) => (
                <div className="team-chain-node" key={superior.accountId} title={superior.address}>
                  <span>上 {superior.level}</span>
                  <button
                    type="button"
                    className="team-chain-address"
                    onClick={() => void copyAddress(superior.address)}
                    title={`点击复制 ${superior.address}`}
                  >
                    {shortAddress(superior.address)}
                  </button>
                  <small>
                    VIP {Math.max(superior.vipLevel, superior.manualVipLevel)} · 节点 {superior.nodeLevel}
                  </small>
                </div>
              ))}
              <div className="team-chain-node current" title={user.address}>
                <span>当前用户</span>
                <button
                  type="button"
                  className="team-chain-address"
                  onClick={() => void copyAddress(user.address)}
                  title={`点击复制 ${user.address}`}
                >
                  {shortAddress(user.address)}
                </button>
                <small>ID {user.id}</small>
              </div>
            </div>
          )}
        </section>

        <section className="detail-section team-market-stats-section">
          <div className="panel-head">
            <h3>团队矿机购买统计</h3>
            <span>
              {minerPurchaseStats
                ? `${formatRangeLabel(minerPurchaseStatsRange)} · ${minerPurchaseStats.purchaseCount} 笔`
                : '包含自己和全部下级'}
            </span>
          </div>
          <div className="detail-filters team-market-stats-form">
            <div className="field compact">
              <label htmlFor="team-miner-purchase-stats-from">开始时间</label>
              <input
                id="team-miner-purchase-stats-from"
                type="datetime-local"
                value={minerPurchaseStatsFrom}
                onChange={(event) => setMinerPurchaseStatsFrom(event.target.value)}
                disabled={minerPurchaseStatsBusy}
              />
            </div>
            <div className="field compact">
              <label htmlFor="team-miner-purchase-stats-to">结束时间</label>
              <input
                id="team-miner-purchase-stats-to"
                type="datetime-local"
                value={minerPurchaseStatsTo}
                onChange={(event) => setMinerPurchaseStatsTo(event.target.value)}
                disabled={minerPurchaseStatsBusy}
              />
            </div>
            <button type="button" className="primary" onClick={handleQueryMinerPurchaseStats} disabled={minerPurchaseStatsBusy}>
              {minerPurchaseStatsBusy ? '查询中' : '查询'}
            </button>
          </div>
          {(minerPurchaseStatsLocalError || minerPurchaseStatsError) && (
            <p className="status error">{minerPurchaseStatsLocalError || minerPurchaseStatsError}</p>
          )}
          <div className={minerPurchaseStatsBusy ? 'summary-row loading-scope is-loading' : 'summary-row loading-scope'}>
            <LoadingOverlay loading={minerPurchaseStatsBusy} />
            <SummaryCard
              label="总矿机价值"
              value={`${formatAmount(minerPurchaseStats?.totalMinerPrice ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="SPACE 支付矿机价值"
              value={`${formatAmount(minerPurchaseStats?.spacePaidMinerPrice ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="USDT 支付矿机价值"
              value={`${formatAmount(minerPurchaseStats?.usdtPaidMinerSpacePrice ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard label="购买记录数" value={minerPurchaseStats?.purchaseCount ?? 0} />
            <SummaryCard label="购买人数" value={minerPurchaseStats?.buyerCount ?? 0} />
          </div>
        </section>

        <section className="detail-section team-market-stats-section">
          <div className="panel-head">
            <h3>团队市场成交统计</h3>
            <span>
              {marketStats
                ? `${marketStats.accountCount} 个地址 · ${marketStats.tradeCount} 笔成交`
                : '包含自己和全部下级'}
            </span>
          </div>
          <div className="detail-filters team-market-stats-form">
            <div className="field compact">
              <label htmlFor="team-market-stats-from">开始时间</label>
              <input
                id="team-market-stats-from"
                type="datetime-local"
                value={marketStatsFrom}
                onChange={(event) => setMarketStatsFrom(event.target.value)}
                disabled={marketStatsBusy}
              />
            </div>
            <div className="field compact">
              <label htmlFor="team-market-stats-to">结束时间</label>
              <input
                id="team-market-stats-to"
                type="datetime-local"
                value={marketStatsTo}
                onChange={(event) => setMarketStatsTo(event.target.value)}
                disabled={marketStatsBusy}
              />
            </div>
            <button type="button" className="primary" onClick={handleQueryMarketStats} disabled={marketStatsBusy}>
              {marketStatsBusy ? '查询中' : '查询'}
            </button>
          </div>
          {(marketStatsLocalError || marketStatsError) && (
            <p className="status error">{marketStatsLocalError || marketStatsError}</p>
          )}
          <div className={marketStatsBusy ? 'summary-row loading-scope is-loading' : 'summary-row loading-scope'}>
            <LoadingOverlay loading={marketStatsBusy} />
            <SummaryCard
              label="总卖出"
              value={`${formatAmount(marketStats?.totalSellSpaceAmount ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="主动卖出"
              value={`${formatAmount(marketStats?.activeSellSpaceAmount ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="被动卖出"
              value={`${formatAmount(marketStats?.passiveSellSpaceAmount ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="总买入"
              value={`${formatAmount(marketStats?.totalBuySpaceAmount ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="主动买入"
              value={`${formatAmount(marketStats?.activeBuySpaceAmount ?? '0', { display: true })} SPACE`}
            />
            <SummaryCard
              label="被动买入"
              value={`${formatAmount(marketStats?.passiveBuySpaceAmount ?? '0', { display: true })} SPACE`}
            />
          </div>
        </section>

        <section className="detail-section">
          <div className="panel-head">
            <h3>直推分支</h3>
            <span>{busy ? '刷新中' : `${totalBranches} 条`}</span>
          </div>
          <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
            <LoadingOverlay loading={busy} />
            <table>
              <thead>
                <tr>
                  <th>地址</th>
                  <th>推荐码</th>
                  <th>VIP</th>
                  <th>节点</th>
                  <th>分支人数</th>
                  <th>分支业绩</th>
                  <th>矿机数</th>
                  <th>注册时间</th>
                </tr>
              </thead>
              <tbody>
                {branches.map((branch) => (
                  <tr key={branch.accountId}>
                    <td>{branch.address}</td>
                    <td>{branch.refCode || '-'}</td>
                    <td>{Math.max(branch.vipLevel, branch.manualVipLevel)}</td>
                    <td>{branch.nodeLevel}</td>
                    <td>{branch.branchTeamCount}</td>
                    <td>{formatAmount(branch.branchPerformance, { display: true })}</td>
                    <td>{branch.branchMinerCount}</td>
                    <td>{formatTime(branch.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={branchFilters.page}
            totalPages={branchTotalPages}
            busy={busy}
            variant="modal"
            onPageChange={onBranchPageChange}
          />
        </section>

        <section className="detail-section">
          <div className="panel-head">
            <h3>团队成员</h3>
            <span>{busy ? '刷新中' : `${totalMembers} 条`}</span>
          </div>
          <div className="detail-filters">
            <div className="field compact">
              <label htmlFor="team-member-address">地址</label>
              <input
                id="team-member-address"
                value={memberFilters.address}
                onChange={(event) => onMemberFiltersChange({ ...memberFilters, address: event.target.value, page: 1 })}
                placeholder="模糊查询"
                disabled={busy}
              />
            </div>
            <div className="field compact">
              <label htmlFor="team-member-level">层级</label>
              <input
                id="team-member-level"
                inputMode="numeric"
                value={memberFilters.level}
                onChange={(event) => onMemberFiltersChange({ ...memberFilters, level: event.target.value, page: 1 })}
                placeholder="全部"
                disabled={busy}
              />
            </div>
          </div>
          <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
            <LoadingOverlay loading={busy} />
            <table>
              <thead>
                <tr>
                  <th>地址</th>
                  <th>层级</th>
                  <th>上级</th>
                  <th>VIP</th>
                  <th>节点</th>
                  <th>业绩</th>
                  <th>普通矿机</th>
                  <th>免费矿机</th>
                  <th>注册时间</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.accountId}>
                    <td>{member.address}</td>
                    <td>{member.level}</td>
                    <td>{member.superiorAddress ?? '-'}</td>
                    <td>{Math.max(member.vipLevel, member.manualVipLevel)}</td>
                    <td>{member.nodeLevel}</td>
                    <td>{formatAmount(member.performance, { display: true })}</td>
                    <td>{member.minerCount}</td>
                    <td>{member.freeMinerCount}</td>
                    <td>{formatTime(member.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={memberFilters.page}
            totalPages={memberTotalPages}
            busy={busy}
            variant="modal"
            onPageChange={onMemberPageChange}
          />
        </section>
        {toastMessage && <div className="copy-toast" role="status">{toastMessage}</div>}
      </section>
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function formatRangeLabel(range: TeamMinerPurchaseStatsRange) {
  if (range.from === 0) return `所有时间 - ${formatTime(range.to)}`
  return `${formatTime(range.from)} - ${formatTime(range.to)}`
}
