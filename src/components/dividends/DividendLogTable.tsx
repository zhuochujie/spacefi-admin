import type { DividendLogItem } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { Pagination } from '../common/Pagination'
import { formatAmount, formatTime } from '../../lib/format'

type DividendLogTableProps = {
  logs: DividendLogItem[]
  total: number
  page: number
  pageSize: number
  busy: boolean
  onPageChange: (page: number) => void
}

export function DividendLogTable({
  logs,
  total,
  page,
  pageSize,
  busy,
  onPageChange,
}: DividendLogTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>分红记录</h2>
        <span>{busy ? '刷新中' : `${total} 条`}</span>
      </div>

      {logs.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无分红记录。</div>
      ) : (
        <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={busy} />
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户地址</th>
                <th>类型</th>
                <th>Token</th>
                <th>数量</th>
                <th>变动前</th>
                <th>变动后</th>
                <th>VIP等级</th>
                <th>节点等级</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{log.account.address}</td>
                  <td>{formatDividendType(log.type)}</td>
                  <td>{log.token}</td>
                  <td>{formatAmount(log.amount, { display: true })}</td>
                  <td>{formatAmount(log.balanceBefore, { display: true })}</td>
                  <td>{formatAmount(log.balanceAfter, { display: true })}</td>
                  <td>{log.account.vipLevel}</td>
                  <td>{log.account.nodeLevel}</td>
                  <td>{formatTime(log.createdAt)}</td>
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

function formatDividendType(type: string) {
  if (type === 'vip_dividend') return 'VIP 分红'
  if (type === 'node_dividend') return '节点分红'
  return type
}
