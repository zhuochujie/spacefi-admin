import { useEffect, useRef, useState } from 'react'
import { parseUnits } from 'viem'
import copy from 'copy-to-clipboard'
import type { AccountMarketTrade, BalanceLogItem, MarketOrder, MinerItem, TeamMarketTradeStats, UserRecord } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { Pagination } from '../common/Pagination'
import type { BalanceFilters, MarketOrderFilters, MarketTradeStatsRange } from '../../hooks/useAdminData'
import { formatAmount, formatTime, shortAddress } from '../../lib/format'

const balanceLogTypeOptions = [
  { value: 'miner_reward', label: '矿机奖励' },
  { value: 'free_miner_claim', label: '体验矿机提取' },
  { value: 'team_reward', label: '团队奖励' },
  { value: 'miner_purchase', label: '购买矿机' },
  { value: 'miner_purchase_refund', label: '购买矿机退款' },
  { value: 'withdraw', label: '提现' },
  { value: 'withdraw_refund', label: '提现退款' },
  { value: 'vip_dividend', label: 'VIP 分红' },
  { value: 'node_dividend', label: '节点分红' },
  { value: 'system_reward', label: '系统奖励' },
  { value: 'admin_transfer_out', label: '后台转出' },
  { value: 'admin_transfer_in', label: '后台转入' },
]

function formatBalanceLogType(type: string) {
  return balanceLogTypeOptions.find((option) => option.value === type)?.label ?? type
}

type UserDataModalProps = {
  open: boolean
  title: string
  user: UserRecord | null
  mode: 'balance-logs' | 'miners' | 'market-orders'
  logs: BalanceLogItem[]
  miners: MinerItem[]
  marketOrders: MarketOrder[]
  marketTrades: AccountMarketTrade[]
  marketTradeStats: TeamMarketTradeStats | null
  marketTradeStatsRange: MarketTradeStatsRange
  marketTradeStatsBusy?: boolean
  marketTradeStatsError?: string
  filters: BalanceFilters
  marketOrderFilters: MarketOrderFilters
  totalLogs: number
  totalMarketOrders: number
  searched: boolean
  busy: boolean
  error?: string
  accelerateBusy?: boolean
  accelerateError?: string
  showAccelerate?: boolean
  onClose: () => void
  onFiltersChange: (filters: BalanceFilters) => void
  onMarketOrderFiltersChange: (filters: MarketOrderFilters) => void
  onMarketTradeStatsSearch: (range: MarketTradeStatsRange) => void
  onPageChange: (page: number) => void
  onMarketOrderPageChange: (page: number) => void
  onSearch: () => void
  onAccelerateMiner: (miner: MinerItem, amount: string) => Promise<void>
}

export function UserDataModal({
  open,
  title,
  user,
  mode,
  logs,
  miners,
  marketOrders,
  marketTrades,
  marketTradeStats,
  marketTradeStatsRange,
  marketTradeStatsBusy = false,
  marketTradeStatsError,
  filters,
  marketOrderFilters,
  totalLogs,
  totalMarketOrders,
  searched,
  busy,
  error,
  accelerateBusy = false,
  accelerateError,
  showAccelerate = false,
  onClose,
  onFiltersChange,
  onMarketOrderFiltersChange,
  onMarketTradeStatsSearch,
  onPageChange,
  onMarketOrderPageChange,
  onSearch,
  onAccelerateMiner,
}: UserDataModalProps) {
  const [accelerateMiner, setAccelerateMiner] = useState<MinerItem | null>(null)
  const [accelerateAmount, setAccelerateAmount] = useState('')
  const [accelerateFormError, setAccelerateFormError] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [marketStatsFrom, setMarketStatsFrom] = useState('')
  const [marketStatsTo, setMarketStatsTo] = useState('')
  const [marketStatsFormError, setMarketStatsFormError] = useState('')

  useEffect(() => {
    if (!toastMessage) return

    const timer = window.setTimeout(() => setToastMessage(''), 1600)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  useEffect(() => {
    if (!open || mode !== 'market-orders') return

    setMarketStatsFrom('')
    setMarketStatsTo('')
    setMarketStatsFormError('')
  }, [open, mode, user?.id])

  if (!open || !user) return null

  const logPages = Math.max(1, Math.ceil(totalLogs / filters.pageSize))
  const marketOrderPages = Math.max(1, Math.ceil(totalMarketOrders / marketOrderFilters.pageSize))

  const closeAccelerateModal = () => {
    if (accelerateBusy) return

    setAccelerateMiner(null)
    setAccelerateAmount('')
    setAccelerateFormError('')
  }

  const handleSubmitAccelerate = async () => {
    if (!accelerateMiner) return

    let amountWei: bigint
    try {
      amountWei = parseUnits(accelerateAmount.trim(), 18)
    } catch {
      setAccelerateFormError('请输入有效的 SPACE 数量。')
      return
    }

    if (amountWei <= 0n) {
      setAccelerateFormError('加速数量必须大于 0。')
      return
    }

    setAccelerateFormError('')
    await onAccelerateMiner(accelerateMiner, amountWei.toString())
    closeAccelerateModal()
  }

  const accelerateAmountWei = getAccelerateAmountWei(accelerateAmount)
  const accelerateRemainingReward = accelerateMiner ? getMinerRemainingReward(accelerateMiner) : 0n
  const shouldShowAccelerateCapHint =
    accelerateAmountWei != null &&
    accelerateRemainingReward > 0n &&
    accelerateAmountWei > accelerateRemainingReward

  const handleSearchMarketStats = () => {
    const hasFrom = marketStatsFrom.trim().length > 0
    const hasTo = marketStatsTo.trim().length > 0

    if (hasFrom !== hasTo) {
      setMarketStatsFormError('请选择完整的开始时间和结束时间，或留空查询所有时间。')
      return
    }

    if (!hasFrom && !hasTo) {
      setMarketStatsFormError('')
      onMarketTradeStatsSearch({ from: 0, to: Math.floor(Date.now() / 1000) })
      return
    }

    const from = Math.floor(new Date(marketStatsFrom).getTime() / 1000)
    const to = Math.floor(new Date(marketStatsTo).getTime() / 1000)

    if (Number.isNaN(from) || Number.isNaN(to)) {
      setMarketStatsFormError('请选择有效的时间区间。')
      return
    }

    if (to <= from) {
      setMarketStatsFormError('结束时间必须大于开始时间。')
      return
    }

    setMarketStatsFormError('')
    onMarketTradeStatsSearch({ from, to })
  }

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
          <section className={busy ? 'detail-section loading-scope is-loading' : 'detail-section loading-scope'}>
            <LoadingOverlay loading={busy} />
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
            <Pagination
              page={filters.page}
              totalPages={logPages}
              busy={busy}
              variant="modal"
              onPageChange={onPageChange}
            />
          </section>
        ) : mode === 'miners' ? (
          <section className={busy ? 'detail-section loading-scope is-loading' : 'detail-section loading-scope'}>
            <LoadingOverlay loading={busy} />
            <MinerList
              miners={miners}
              busy={busy}
              accelerateBusy={accelerateBusy}
              showAccelerate={showAccelerate}
              onOpenAccelerate={(miner) => {
                setAccelerateMiner(miner)
                setAccelerateAmount('')
                setAccelerateFormError('')
              }}
            />
          </section>
        ) : (
          <section className={busy ? 'detail-section loading-scope is-loading' : 'detail-section loading-scope'}>
            <LoadingOverlay loading={busy} />
            <div className="detail-section">
              <div className="panel-head compact-head">
                <div>
                  <p className="eyebrow">Trade Stats</p>
                  <h3>成交数量统计</h3>
                </div>
                <span>
                  {marketTradeStats
                    ? `${formatTime(marketTradeStatsRange.from)} - ${formatTime(marketTradeStatsRange.to)}`
                    : '默认所有时间'}
                </span>
              </div>
              <div className="detail-filters">
                <div className="field compact">
                  <label htmlFor="market-stats-from">开始时间</label>
                  <input
                    id="market-stats-from"
                    type="datetime-local"
                    value={marketStatsFrom}
                    disabled={marketTradeStatsBusy}
                    onChange={(event) => setMarketStatsFrom(event.target.value)}
                    placeholder="留空查询所有时间"
                  />
                </div>
                <div className="field compact">
                  <label htmlFor="market-stats-to">结束时间</label>
                  <input
                    id="market-stats-to"
                    type="datetime-local"
                    value={marketStatsTo}
                    disabled={marketTradeStatsBusy}
                    onChange={(event) => setMarketStatsTo(event.target.value)}
                    placeholder="留空查询所有时间"
                  />
                </div>
                <div className="field compact toolbar-action">
                  <label aria-hidden="true">&nbsp;</label>
                  <button type="button" className="primary" disabled={marketTradeStatsBusy} onClick={handleSearchMarketStats}>
                    {marketTradeStatsBusy ? '查询中' : '查询统计'}
                  </button>
                </div>
              </div>
              {(marketStatsFormError || marketTradeStatsError) && (
                <p className="status error">{marketStatsFormError || marketTradeStatsError}</p>
              )}
              <div className={marketTradeStatsBusy ? 'summary-row loading-scope is-loading' : 'summary-row loading-scope'}>
                <LoadingOverlay loading={marketTradeStatsBusy} />
                <SummaryCard label="总买入" value={`${formatAmount(marketTradeStats?.totalBuySpaceAmount ?? '0', { display: true })} SPACE`} />
                <SummaryCard label="主动买入" value={`${formatAmount(marketTradeStats?.activeBuySpaceAmount ?? '0', { display: true })} SPACE`} />
                <SummaryCard label="被动买入" value={`${formatAmount(marketTradeStats?.passiveBuySpaceAmount ?? '0', { display: true })} SPACE`} />
                <SummaryCard label="总卖出" value={`${formatAmount(marketTradeStats?.totalSellSpaceAmount ?? '0', { display: true })} SPACE`} />
                <SummaryCard label="主动卖出" value={`${formatAmount(marketTradeStats?.activeSellSpaceAmount ?? '0', { display: true })} SPACE`} />
                <SummaryCard label="被动卖出" value={`${formatAmount(marketTradeStats?.passiveSellSpaceAmount ?? '0', { display: true })} SPACE`} />
              </div>
            </div>
            <div className="detail-filters">
              <div className="field compact">
                <label htmlFor="market-order-view">记录类型</label>
                <select
                  id="market-order-view"
                  value={marketOrderFilters.view}
                  onChange={(event) => onMarketOrderFiltersChange({
                    ...marketOrderFilters,
                    view: event.target.value as MarketOrderFilters['view'],
                    side: '',
                    status: '',
                    action: '',
                    page: 1,
                  })}
                >
                  <option value="orders">订单记录</option>
                  <option value="trades">成交记录</option>
                </select>
              </div>
              {marketOrderFilters.view === 'orders' ? (
                <>
                  <div className="field compact">
                    <label htmlFor="market-order-side">方向</label>
                    <select
                      id="market-order-side"
                      value={marketOrderFilters.side}
                      onChange={(event) => onMarketOrderFiltersChange({ ...marketOrderFilters, side: event.target.value, page: 1 })}
                    >
                      <option value="">全部</option>
                      <option value="buy">买单</option>
                      <option value="sell">卖单</option>
                    </select>
                  </div>
                  <div className="field compact">
                    <label htmlFor="market-order-status">状态</label>
                    <select
                      id="market-order-status"
                      value={marketOrderFilters.status}
                      onChange={(event) => onMarketOrderFiltersChange({ ...marketOrderFilters, status: event.target.value, page: 1 })}
                    >
                      <option value="">全部</option>
                      <option value="open">挂单中</option>
                      <option value="filled">已成交</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="field compact">
                  <label htmlFor="market-trade-action">成交类型</label>
                  <select
                    id="market-trade-action"
                    value={marketOrderFilters.action}
                    onChange={(event) => onMarketOrderFiltersChange({ ...marketOrderFilters, action: event.target.value, page: 1 })}
                  >
                    <option value="">全部</option>
                    <option value="active_buy">主动买入</option>
                    <option value="passive_buy">被动买入</option>
                    <option value="active_sell">主动卖出</option>
                    <option value="passive_sell">被动卖出</option>
                  </select>
                </div>
              )}
            </div>
            {marketOrderFilters.view === 'orders' ? (
              <MarketOrderTable orders={marketOrders} busy={busy} onToast={setToastMessage} />
            ) : (
              <MarketTradeTable trades={marketTrades} busy={busy} onToast={setToastMessage} />
            )}
            <Pagination
              page={marketOrderFilters.page}
              totalPages={marketOrderPages}
              busy={busy}
              variant="modal"
              onPageChange={onMarketOrderPageChange}
            />
          </section>
        )}

        {(busy || error) && <p className={error ? 'status error' : 'status'}>{error || '正在加载...'}</p>}
      </section>
      {accelerateMiner && (
        <div className="modal-overlay" role="presentation" onMouseDown={closeAccelerateModal}>
          <section
            className="modal-panel modal-panel-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accelerate-miner-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="modal-header">
              <div>
                <p className="eyebrow">{accelerateMiner.miner.name}</p>
                <h2 id="accelerate-miner-title">加速矿机</h2>
              </div>
              <button type="button" className="secondary" disabled={accelerateBusy} onClick={closeAccelerateModal}>
                关闭
              </button>
            </header>
            <section className="detail-section">
              <div className="field">
                <label htmlFor="accelerate-amount">释放数量（SPACE）</label>
                <input
                  id="accelerate-amount"
                  value={accelerateAmount}
                  disabled={accelerateBusy}
                  placeholder="请输入要释放的 SPACE 数量"
                  onChange={(event) => {
                    setAccelerateAmount(event.target.value)
                    setAccelerateFormError('')
                  }}
                />
              </div>
            <p className="status">
              剩余可释放：{formatAmount(accelerateRemainingReward, { fractionDigits: 5, fixed: true })} SPACE
            </p>
            {shouldShowAccelerateCapHint && (
              <p className="status warning">
                输入数量超过剩余可释放额度，实际将释放 {formatAmount(accelerateRemainingReward, { fractionDigits: 5, fixed: true })} SPACE。
              </p>
            )}
            {(accelerateFormError || accelerateError) && (
              <p className="status error">{accelerateFormError || accelerateError}</p>
            )}
              <div className="modal-actions">
                <button type="button" className="secondary" disabled={accelerateBusy} onClick={closeAccelerateModal}>
                  取消
                </button>
                <button type="button" className="primary" disabled={accelerateBusy} onClick={handleSubmitAccelerate}>
                  {accelerateBusy ? '提交中...' : '确认加速'}
                </button>
              </div>
            </section>
          </section>
        </div>
      )}
      {toastMessage && <div className="copy-toast" role="status">{toastMessage}</div>}
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

const marketOrderSideLabels: Record<string, string> = {
  buy: '买单',
  sell: '卖单',
}

const marketOrderStatusLabels: Record<string, string> = {
  open: '挂单中',
  filled: '已成交',
  cancelled: '已取消',
}

function TypeMultiSelect({
  value,
  onChange,
}: {
  value: string[]
  onChange: (value: string[]) => void
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const selectedLabels = balanceLogTypeOptions
    .filter((option) => value.includes(option.value))
    .map((option) => option.label)
  const summary = selectedLabels.length > 0 ? selectedLabels.join('、') : '全部类型'

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      const details = detailsRef.current
      if (details?.open && !details.contains(event.target as Node)) {
        details.open = false
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && detailsRef.current?.open) {
        detailsRef.current.open = false
        detailsRef.current.querySelector('summary')?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function toggleType(type: string) {
    if (value.includes(type)) {
      onChange(value.filter((item) => item !== type))
      return
    }

    onChange([...value, type])
  }

  return (
    <details
      ref={detailsRef}
      className={value.length > 0 ? 'multi-select has-value' : 'multi-select'}
      id="balance-type"
    >
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
              <td>{formatBalanceLogType(item.type)}</td>
              <td>{item.token}</td>
              <td>{formatAmount(item.amount, { display: true })}</td>
              <td>{formatAmount(item.balanceBefore, { display: true })}</td>
              <td>{formatAmount(item.balanceAfter, { display: true })}</td>
              <td>{formatTime(item.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MinerList({
  miners,
  busy,
  accelerateBusy,
  showAccelerate,
  onOpenAccelerate,
}: {
  miners: MinerItem[]
  busy: boolean
  accelerateBusy: boolean
  showAccelerate: boolean
  onOpenAccelerate: (miner: MinerItem) => void
}) {
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
              <dd>{formatAmount(miner.expectedReward, { fractionDigits: 5, fixed: true })}</dd>
            </div>
            <div>
              <dt>已产出</dt>
              <dd>{formatAmount(miner.producedReward, { fractionDigits: 5, fixed: true })}</dd>
            </div>
            <div>
              <dt>周期</dt>
              <dd>{formatCycleDays(miner.cycle)}</dd>
            </div>
            <div>
              <dt>结束时间</dt>
              <dd>{formatTime(miner.cycleEndAt)}</dd>
            </div>
          </dl>
          {showAccelerate && (
            <button
              type="button"
              className="secondary small"
              disabled={accelerateBusy || getMinerRemainingReward(miner) <= 0n}
              onClick={() => onOpenAccelerate(miner)}
            >
              加速
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

function getMinerRemainingReward(miner: MinerItem) {
  try {
    const expectedReward = BigInt(miner.expectedReward)
    const producedReward = BigInt(miner.producedReward)
    return expectedReward > producedReward ? expectedReward - producedReward : 0n
  } catch {
    return 0n
  }
}

function getAccelerateAmountWei(value: string) {
  const trimmedValue = value.trim()
  if (!trimmedValue) return null

  try {
    return parseUnits(trimmedValue, 18)
  } catch {
    return null
  }
}

function MarketOrderTable({
  orders,
  busy,
  onToast,
}: {
  orders: MarketOrder[]
  busy: boolean
  onToast: (message: string) => void
}) {
  if (!busy && orders.length === 0) {
    return <div className="empty-state inline-empty">该用户暂无市场订单记录。</div>
  }

  return (
    <div className="table-wrap detail-table">
      <table>
        <thead>
          <tr>
            <th>订单ID</th>
            <th>方向</th>
            <th>状态</th>
            <th>总数量</th>
            <th>剩余数量</th>
            <th>价格</th>
            <th>显示</th>
            <th>交易哈希</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td><CopyValueButton value={order.id} label={shortHash(order.id)} onToast={onToast} /></td>
              <td>{marketOrderSideLabels[order.side] ?? order.side}</td>
              <td>{marketOrderStatusLabels[order.status] ?? order.status}</td>
              <td>{formatAmount(order.spaceAmount, { display: true })}</td>
              <td>{formatAmount(order.remainingSpaceAmount, { display: true })}</td>
              <td>{formatAmount(order.price, { display: true, fractionDigits: 3 })}</td>
              <td>{order.visible ? '是' : '否'}</td>
              <td><CopyValueButton value={order.transactionHash} label={shortHash(order.transactionHash)} onToast={onToast} /></td>
              <td>{formatTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const marketTradeActionLabels: Record<string, string> = {
  active_buy: '主动买入',
  passive_buy: '被动买入',
  active_sell: '主动卖出',
  passive_sell: '被动卖出',
}

function MarketTradeTable({
  trades,
  busy,
  onToast,
}: {
  trades: AccountMarketTrade[]
  busy: boolean
  onToast: (message: string) => void
}) {
  if (!busy && trades.length === 0) {
    return <div className="empty-state inline-empty">该用户暂无成交记录。</div>
  }

  return (
    <div className="table-wrap detail-table">
      <table>
        <thead>
          <tr>
            <th>成交ID</th>
            <th>订单ID</th>
            <th>类型</th>
            <th>成交数量</th>
            <th>价格</th>
            <th>成交金额</th>
            <th>手续费</th>
            <th>对手方</th>
            <th>交易哈希</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td><CopyValueButton value={trade.id} label={shortHash(trade.id)} onToast={onToast} /></td>
              <td><CopyValueButton value={trade.orderId} label={shortHash(trade.orderId)} onToast={onToast} /></td>
              <td>{marketTradeActionLabels[trade.action] ?? trade.action}</td>
              <td>{formatAmount(trade.spaceAmount, { display: true })}</td>
              <td>{formatAmount(trade.price, { display: true, fractionDigits: 3 })}</td>
              <td>{formatAmount(trade.usdtAmount, { display: true, fractionDigits: 3 })}</td>
              <td>{formatAmount((BigInt(trade.nodeFee || '0') + BigInt(trade.markerFee || '0')).toString(), { display: true, fractionDigits: 3 })}</td>
              <td><CopyValueButton value={trade.counterparty} label={shortAddress(trade.counterparty)} onToast={onToast} /></td>
              <td><CopyValueButton value={trade.transactionHash} label={shortHash(trade.transactionHash)} onToast={onToast} /></td>
              <td>{formatTime(trade.filledAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CopyValueButton({
  value,
  label,
  onToast,
}: {
  value: string
  label: string
  onToast: (message: string) => void
}) {
  const handleCopy = async () => {
    onToast(await copy(value, { fallbackToPrompt: true }) ? '已复制' : '复制失败')
  }

  return (
    <button type="button" className="copy-cell-button" title={value} onClick={handleCopy}>
      {label}
    </button>
  )
}

function shortHash(value: string) {
  if (!value) return '-'
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function formatCycleDays(cycleSeconds: number) {
  const days = cycleSeconds / 86400
  return `${days.toFixed(2).replace(/\.?0+$/, '')} 天`
}
