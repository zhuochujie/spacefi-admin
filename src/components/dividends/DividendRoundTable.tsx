import type { DividendRoundSummary } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { Pagination } from '../common/Pagination'
import { formatAmount, formatTime } from '../../lib/format'

type DividendRoundTableProps = {
  rounds: DividendRoundSummary[]
  total: number
  page: number
  pageSize: number
  busy: boolean
  onPageChange: (page: number) => void
  onOpenDetail: (round: DividendRoundSummary) => void
}

export function DividendRoundTable({
  rounds,
  total,
  page,
  pageSize,
  busy,
  onPageChange,
  onOpenDetail,
}: DividendRoundTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>分红数据</h2>
        <span>{busy ? '刷新中' : `${total} 轮`}</span>
      </div>

      {rounds.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无分红数据。</div>
      ) : (
        <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={busy} />
          <table>
            <thead>
              <tr>
                <th>分红时间</th>
                <th>VIP SPACE</th>
                <th>节点 SPACE</th>
                <th>节点 USDT</th>
                <th>SPACE 总数</th>
                <th>USDT 总数</th>
                <th>Fallback</th>
                <th>统计条数</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rounds.map((round) => (
                <tr key={round.roundAt}>
                  <td>{formatTime(round.roundAt)}</td>
                  <td>{formatAmount(round.vipSpaceAmount, { display: true })}</td>
                  <td>{formatAmount(round.nodeSpaceAmount, { display: true })}</td>
                  <td>{formatAmount(round.nodeUsdtAmount, { display: true })}</td>
                  <td>{formatAmount(round.totalSpaceAmount, { display: true })}</td>
                  <td>{formatAmount(round.totalUsdtAmount, { display: true })}</td>
                  <td>{round.fallbackCount}</td>
                  <td>{round.statCount}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary small" onClick={() => onOpenDetail(round)}>
                        查看详情
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} busy={busy} onPageChange={onPageChange} />
    </section>
  )
}
