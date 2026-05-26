import type { BalanceLogItem, MinerItem, UserRecord } from '../../api'
import type { BalanceFilters } from '../../hooks/useAdminData'
import { formatTime, formatTokenAmount, shortAddress } from '../../lib/format'

const balanceLogTypeOptions = [
  { value: 'miner_reward', label: '矿机奖励' },
  { value: 'team_reward', label: '团队奖励' },
  { value: 'miner_purchase', label: '购买矿机' },
  { value: 'miner_purchase_refund', label: '购买矿机退款' },
  { value: 'withdraw', label: '提现' },
  { value: 'withdraw_refund', label: '提现退款' },
  { value: 'vip_dividend', label: 'VIP 分红' },
  { value: 'node_dividend', label: '节点分红' },
]

type UserDataModalProps = {
  open: boolean
  title: string
  user: UserRecord | null
  mode: 'balance-logs' | 'miners'
  logs: BalanceLogItem[]
  miners: MinerItem[]
  filters: BalanceFilters
  totalLogs: number
  searched: boolean
  busy: boolean
  error?: string
  onClose: () => void
  onFiltersChange: (filters: BalanceFilters) => void
  onSearch: () => void
}

export function UserDataModal({
  open,
  title,
  user,
  mode,
  logs,
  miners,
  filters,
  totalLogs,
  searched,
  busy,
  error,
  onClose,
  onFiltersChange,
  onSearch,
}: UserDataModalProps) {
  if (!open || !user) return null

  const logPages = Math.max(1, Math.ceil(totalLogs / filters.pageSize))

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-data-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <div>
            <p className="eyebrow">{shortAddress(user.address)}</p>
            <h2 id="user-data-modal-title">{title}</h2>
          </div>
          <button type="button" className="secondary" onClick={onClose}>
            关闭
          </button>
        </header>

        {mode === 'balance-logs' ? (
          <section className="detail-section">
            <div className="detail-filters">
              <div className="field compact">
                <label htmlFor="balance-type">类型</label>
                <TypeMultiSelect
                  value={filters.type}
                  onChange={(type) => onFiltersChange({ ...filters, type, page: 1 })}
                />
              </div>
              <div className="field compact">
                <label htmlFor="balance-token">Token</label>
                <select
                  id="balance-token"
                  value={filters.token}
                  onChange={(event) => onFiltersChange({ ...filters, token: event.target.value, page: 1 })}
                >
                  <option value="">全部</option>
                  <option value="SPACE">SPACE</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
              <div className="field compact toolbar-action">
                <label aria-hidden="true">&nbsp;</label>
                <button type="button" className="primary" onClick={onSearch}>
                  查询
                </button>
              </div>
            </div>
            <BalanceLogTable logs={logs} busy={busy} searched={searched} />
            <div className="pager pager-modal">
              <div className="pager-left">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onFiltersChange({ ...filters, page: Math.max(1, filters.page - 1) })}
                  disabled={filters.page <= 1}
                >
                  上一页
                </button>
              </div>
              <div className="pager-center">
                <span>
                  {filters.page} / {logPages}
                </span>
              </div>
              <div className="pager-right">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => onFiltersChange({ ...filters, page: Math.min(logPages, filters.page + 1) })}
                  disabled={filters.page >= logPages}
                >
                  下一页
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="detail-section">
            <MinerList miners={miners} busy={busy} />
          </section>
        )}

        {(busy || error) && <p className={error ? 'status error' : 'status'}>{error || '正在加载...'}</p>}
      </section>
    </div>
  )
}

function TypeMultiSelect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const selectedLabels = balanceLogTypeOptions
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)
  const summary = selectedLabels.length > 0 ? selectedLabels.join('、') : '全部类型'

  function toggleType(type: string) {
    if (value.includes(type)) {
      onChange(value.filter((item) => item !== type))
      return
    }

    onChange([...value, type])
  }

  return (
    <details className={value.length > 0 ? 'multi-select has-value' : 'multi-select'} id="balance-type">
      <summary>{summary}</summary>
      <div className="multi-select-menu">
        {balanceLogTypeOptions.map((option) => {
          const selected = value.includes(option.value)

          return (
            <label key={option.value} className={selected ? 'checkbox-option selected' : 'checkbox-option'}>
              <input
                type="checkbox"
                checked={selected}
                onChange={() => toggleType(option.value)}
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
    </details>
  )
}

function BalanceLogTable({
  logs,
  busy,
  searched,
}: {
  logs: BalanceLogItem[]
  busy: boolean
  searched: boolean
}) {
  if (!busy && logs.length === 0) {
    return (
      <div className="empty-state inline-empty">
        {searched ? '暂无符合条件的资金记录。' : '请选择条件后点击查询查看资金记录。'}
      </div>
    )
  }

  return (
    <div className="table-wrap detail-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>类型</th>
            <th>Token</th>
            <th>数量</th>
            <th>变动前</th>
            <th>变动后</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.type}</td>
              <td>{item.token}</td>
              <td>{formatTokenAmount(item.amount)}</td>
              <td>{formatTokenAmount(item.balanceBefore)}</td>
              <td>{formatTokenAmount(item.balanceAfter)}</td>
              <td>{formatTime(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MinerList({ miners, busy }: { miners: MinerItem[]; busy: boolean }) {
  if (!busy && miners.length === 0) {
    return <div className="empty-state inline-empty">该用户暂无矿机记录。</div>
  }

  return (
    <div className="miner-list">
      {miners.map((miner) => (
        <article key={miner.id} className="miner-item">
          <div className="miner-top">
            <strong>{miner.miner.name}</strong>
            <span>{miner.minerId}</span>
          </div>
          <dl>
            <div>
              <dt>预计收益</dt>
              <dd>{miner.expectedReward}</dd>
            </div>
            <div>
              <dt>已产出</dt>
              <dd>{miner.producedReward}</dd>
            </div>
            <div>
              <dt>周期</dt>
              <dd>{miner.cycle}</dd>
            </div>
            <div>
              <dt>结束时间</dt>
              <dd>{formatTime(miner.cycleEndAt)}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  )
}
