import { useAdminStatsQuery } from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'
import { formatTime, formatTokenAmount } from '../lib/format'

export function OverviewPage() {
  const { token } = useAdminOutlet()
  const statsQuery = useAdminStatsQuery(token, Boolean(token))
  const stats = statsQuery.data

  return (
    <div className="page-stack">
      <header className="page-titlebar">
        <div className="page-header">
          <p className="eyebrow">Platform Overview</p>
          <h1>平台总览</h1>
        </div>
        <button type="button" className="secondary" onClick={() => void statsQuery.refetch()}>
          刷新
        </button>
      </header>

      {statsQuery.error ? <div className="alert error">{statsQuery.error.message}</div> : null}

      <section className="summary-row overview-stats" aria-busy={statsQuery.isFetching}>
        <div className="summary-card overview-card">
          <span>今日 SPACE 购买矿机总额</span>
          <strong>{stats ? formatTokenAmount(stats.todayMinerPurchaseSpace.amount) : '-'}</strong>
          <small>
            {stats
              ? `${formatTime(stats.todayMinerPurchaseSpace.startAt)} 至 ${formatTime(stats.todayMinerPurchaseSpace.endAt)}`
              : '按 Asia/Shanghai 自然日统计'}
          </small>
        </div>
        <div className="summary-card overview-card">
          <span>有效用户数量</span>
          <strong>{stats ? stats.activeUsers.count : '-'}</strong>
          <small>拥有矿机的用户</small>
        </div>
        <div className="summary-card overview-card">
          <span>总矿机数量</span>
          <strong>{stats ? stats.miners.count : '-'}</strong>
          <small>用户拥有的矿机总数</small>
        </div>
        <div className="summary-card overview-card">
          <span>今晚预估矿机奖励(静态)</span>
          <strong>{stats ? formatTokenAmount(stats.estimatedMinerRewards.totalReward) : '-'}</strong>
          <small>
            {stats
              ? `普通 ${stats.estimatedMinerRewards.accountMiner.minerCount} 台 / 免费 ${stats.estimatedMinerRewards.freeMiner.minerCount} 台，${formatTime(stats.estimatedMinerRewards.targetTimestamp)} 发放`
              : '不包含团队奖励'}
          </small>
        </div>
        <div className="summary-card overview-card">
          <span>当前挂单 SPACE 数量</span>
          <strong>
            {stats
              ? `${formatTokenAmount(stats.marketOpenSpace.buySpaceAmount)} / ${formatTokenAmount(stats.marketOpenSpace.sellSpaceAmount)}`
              : '-'}
          </strong>
          <small>买单 / 卖单</small>
        </div>
        <div className="summary-card overview-card">
          <span>今日成交量和成交额</span>
          <strong>
            {stats
              ? `${formatTokenAmount(stats.todayMarketTrades.totalSpaceAmount)} / ${formatTokenAmount(stats.todayMarketTrades.totalUsdtAmount)}`
              : '-'}
          </strong>
          <small>
            {stats
              ? `成交 ${stats.todayMarketTrades.tradeCount} 笔，${formatTime(stats.todayMarketTrades.from)} 至 ${formatTime(stats.todayMarketTrades.to)}`
              : 'SPACE 成交量 / 交易额'}
          </small>
        </div>
      </section>
    </div>
  )
}
