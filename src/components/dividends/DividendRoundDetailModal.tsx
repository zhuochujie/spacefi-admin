import type { DividendLevelStat, DividendRoundSummary } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { formatDividendBp, formatDividendCategory } from '../../lib/dividends'
import { formatAmount, formatTime } from '../../lib/format'

type DividendRoundDetailModalProps = {
  open: boolean
  round: DividendRoundSummary | null
  stats: DividendLevelStat[]
  busy: boolean
  error?: string
  onClose: () => void
}

export function DividendRoundDetailModal({
  open,
  round,
  stats,
  busy,
  error,
  onClose,
}: DividendRoundDetailModalProps) {
  if (!open || !round) return null

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dividend-round-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{formatTime(round.roundAt)}</p>
            <h2 id="dividend-round-detail-title">分红轮次详情</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose} disabled={busy}>
            关闭
          </button>
        </header>

        <section className="summary-row">
          <div className="summary-card">
            <span>VIP SPACE</span>
            <strong>{formatAmount(round.vipSpaceAmount, { display: true })}</strong>
          </div>
          <div className="summary-card">
            <span>节点 SPACE</span>
            <strong>{formatAmount(round.nodeSpaceAmount, { display: true })}</strong>
          </div>
          <div className="summary-card">
            <span>节点 USDT</span>
            <strong>{formatAmount(round.nodeUsdtAmount, { display: true })}</strong>
          </div>
        </section>

        {error && <p className="status error">{error}</p>}

        <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={busy} />
          <table>
            <thead>
              <tr>
                <th>类型</th>
                <th>Token</th>
                <th>等级</th>
                <th>BP</th>
                <th>人数</th>
                <th>人均</th>
                <th>总数</th>
                <th>Fallback</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.id}>
                  <td>{formatDividendCategory(stat.category)}</td>
                  <td>{stat.token}</td>
                  <td>{formatLevel(stat)}</td>
                  <td>{formatDividendBp(stat.bp)}</td>
                  <td>{stat.recipientCount}</td>
                  <td>{formatAmount(stat.perUserAmount, { display: true })}</td>
                  <td>{formatAmount(stat.totalAmount, { display: true })}</td>
                  <td>{stat.fallbackUsed ? '是' : '否'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function formatLevel(stat: DividendLevelStat) {
  return stat.category === 'vip' ? `VIP${stat.level}` : `节点${stat.level}`
}
