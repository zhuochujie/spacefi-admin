import { useEffect, useMemo, useState, type FormEvent } from 'react'
import copy from 'copy-to-clipboard'
import type { MarketOrder, MarketOrderStatus, MarketTakerTrade } from '../api'
import { LoadingOverlay } from '../components/common/LoadingOverlay'
import {
  useMarketOrderDetailQuery,
  useRecentMarketOrdersQuery,
  useRecentMarketTradesQuery,
} from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'
import { formatAmount, formatTime, shortAddress } from '../lib/format'

const PAGE_SIZE = 10

export function MarketPage() {
  const { profile } = useAdminOutlet()
  const isAdminUser = profile.username === 'admin'
  const [tradePage, setTradePage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [orderIdInput, setOrderIdInput] = useState('')
  const [orderId, setOrderId] = useState('')
  const [toastMessage, setToastMessage] = useState('')

  const recentTradesQuery = useRecentMarketTradesQuery(isAdminUser, tradePage, PAGE_SIZE)
  const recentOrdersQuery = useRecentMarketOrdersQuery(isAdminUser, orderPage, PAGE_SIZE)
  const orderDetailQuery = useMarketOrderDetailQuery(orderId, isAdminUser && Boolean(orderId))
  const refreshing = recentTradesQuery.isFetching || recentOrdersQuery.isFetching || orderDetailQuery.isFetching

  useEffect(() => {
    if (!toastMessage) return

    const timer = window.setTimeout(() => setToastMessage(''), 1600)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const tradeTotalPages = useMemo(
    () => getTotalPages(recentTradesQuery.data?.total ?? 0, PAGE_SIZE),
    [recentTradesQuery.data?.total],
  )
  const orderTotalPages = useMemo(
    () => getTotalPages(recentOrdersQuery.data?.total ?? 0, PAGE_SIZE),
    [recentOrdersQuery.data?.total],
  )

  const refresh = async () => {
    const refetches: Promise<unknown>[] = [
      recentTradesQuery.refetch(),
      recentOrdersQuery.refetch(),
    ]

    if (orderId) {
      refetches.push(orderDetailQuery.refetch())
    }

    await Promise.all(refetches)
  }

  const handleSearchOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextOrderId = orderIdInput.trim()

    if (!nextOrderId) {
      setToastMessage('请输入订单ID')
      return
    }

    setOrderId(nextOrderId)
  }

  if (!isAdminUser) {
    return (
      <div className="page-stack">
        <section className="panel">
          <div className="empty-state inline-empty">当前账号无权限查看市场管理。</div>
        </section>
      </div>
    )
  }

  return (
    <div className="page-stack">
      <header className="page-titlebar">
        <div className="page-header">
          <p className="eyebrow">Market Console</p>
          <h1>市场管理</h1>
        </div>
        <button type="button" className="secondary" disabled={refreshing} onClick={() => void refresh()}>
          {refreshing ? '刷新中...' : '刷新'}
        </button>
      </header>

      {recentTradesQuery.error ? <div className="alert error">{recentTradesQuery.error.message}</div> : null}
      {recentOrdersQuery.error ? <div className="alert error">{recentOrdersQuery.error.message}</div> : null}
      {orderDetailQuery.error ? <div className="alert error">{orderDetailQuery.error.message}</div> : null}

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Order Detail</p>
            <h2>订单详情查询</h2>
          </div>
          <span>根据订单ID查询挂单信息和成交记录</span>
        </div>

        <form className="market-search-form" onSubmit={handleSearchOrder}>
          <label className="field">
            <span>订单ID</span>
            <input
              value={orderIdInput}
              onChange={(event) => setOrderIdInput(event.target.value)}
              placeholder="0x..."
            />
          </label>
          <button type="submit" className="primary" disabled={orderDetailQuery.isFetching}>
            {orderDetailQuery.isFetching ? '查询中...' : '查询'}
          </button>
        </form>

        <div className={orderDetailQuery.isFetching ? 'loading-scope is-loading' : 'loading-scope'}>
          <LoadingOverlay loading={orderDetailQuery.isFetching} label="订单查询中..." />
          <OrderDetailPanel
            order={orderDetailQuery.data?.order ?? null}
            trades={orderDetailQuery.data?.trades ?? []}
            searched={Boolean(orderId)}
            busy={orderDetailQuery.isFetching}
            onToast={setToastMessage}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Recent Trades</p>
            <h2>最近成交记录</h2>
          </div>
          <span>{recentTradesQuery.data ? `共 ${recentTradesQuery.data.total} 笔` : '按成交时间倒序'}</span>
        </div>
        <div className={recentTradesQuery.isFetching ? 'loading-scope is-loading' : 'loading-scope'}>
          <LoadingOverlay loading={recentTradesQuery.isFetching} />
          <MarketTradeTable
            trades={recentTradesQuery.data?.items ?? []}
            busy={recentTradesQuery.isFetching}
            onToast={setToastMessage}
          />
        </div>
        <Pagination
          page={tradePage}
          totalPages={tradeTotalPages}
          onPrev={() => setTradePage((value) => Math.max(1, value - 1))}
          onNext={() => setTradePage((value) => Math.min(tradeTotalPages, value + 1))}
          disabled={recentTradesQuery.isFetching}
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Recent Orders</p>
            <h2>最近挂单记录</h2>
          </div>
          <span>{recentOrdersQuery.data ? `共 ${recentOrdersQuery.data.total} 笔` : '按挂单时间倒序'}</span>
        </div>
        <div className={recentOrdersQuery.isFetching ? 'loading-scope is-loading' : 'loading-scope'}>
          <LoadingOverlay loading={recentOrdersQuery.isFetching} />
          <MarketOrderTable
            orders={recentOrdersQuery.data?.items ?? []}
            busy={recentOrdersQuery.isFetching}
            onToast={setToastMessage}
          />
        </div>
        <Pagination
          page={orderPage}
          totalPages={orderTotalPages}
          onPrev={() => setOrderPage((value) => Math.max(1, value - 1))}
          onNext={() => setOrderPage((value) => Math.min(orderTotalPages, value + 1))}
          disabled={recentOrdersQuery.isFetching}
        />
      </section>

      {toastMessage && <div className="copy-toast" role="status">{toastMessage}</div>}
    </div>
  )
}

function OrderDetailPanel({
  order,
  trades,
  searched,
  busy,
  onToast,
}: {
  order: MarketOrder | null
  trades: MarketTakerTrade[]
  searched: boolean
  busy: boolean
  onToast: (message: string) => void
}) {
  if (!searched) {
    return <div className="empty-state inline-empty">输入订单ID后查看挂单信息和成交记录。</div>
  }

  if (busy && !order) {
    return <div className="empty-state inline-empty">订单查询中...</div>
  }

  if (!order) {
    return null
  }

  return (
    <div className="detail-section">
      <div className="detail-summary">
        <div>
          <label>订单ID</label>
          <strong><CopyValueButton value={order.id} label={shortHash(order.id)} onToast={onToast} /></strong>
        </div>
        <div>
          <label>挂单方</label>
          <strong><CopyValueButton value={order.maker} label={shortAddress(order.maker)} onToast={onToast} /></strong>
        </div>
        <div>
          <label>方向 / 状态</label>
          <strong>{formatOrderSide(order.side)} / {formatOrderStatus(order.status)}</strong>
        </div>
        <div>
          <label>总数量 / 剩余</label>
          <strong>{formatAmount(order.spaceAmount, { display: true })} / {formatAmount(order.remainingSpaceAmount, { display: true })} SPACE</strong>
        </div>
        <div>
          <label>价格 / 总额</label>
          <strong>{formatAmount(order.price, { display: true, fractionDigits: 3 })} / {formatOrderTotal(order)} USDT</strong>
        </div>
        <div>
          <label>挂单时间</label>
          <strong>{formatTime(order.createdAt)}</strong>
        </div>
        <div>
          <label>交易哈希</label>
          <strong><CopyValueButton value={order.transactionHash} label={shortHash(order.transactionHash)} onToast={onToast} /></strong>
        </div>
      </div>
      <div className="panel-head compact-head">
        <div>
          <p className="eyebrow">Order Trades</p>
          <h3>该订单成交记录</h3>
        </div>
        <span>{trades.length} 笔</span>
      </div>
      <MarketTradeTable trades={trades} busy={busy} onToast={onToast} />
    </div>
  )
}

function MarketTradeTable({
  trades,
  busy,
  onToast,
}: {
  trades: MarketTakerTrade[]
  busy: boolean
  onToast: (message: string) => void
}) {
  if (!busy && trades.length === 0) {
    return <div className="empty-state inline-empty">暂无成交记录。</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>成交方向</th>
            <th>成交数量</th>
            <th>价格</th>
            <th>成交金额</th>
            <th>手续费</th>
            <th>挂单方</th>
            <th>吃单方</th>
            <th>订单ID</th>
            <th>交易哈希</th>
          </tr>
        </thead>
        <tbody>
          {trades.map((trade) => (
            <tr key={trade.id}>
              <td>{formatTime(trade.filledAt)}</td>
              <td>{formatTradeDirection(trade.side)}</td>
              <td>{formatAmount(trade.spaceAmount, { display: true })} SPACE</td>
              <td>{formatAmount(trade.price, { display: true, fractionDigits: 3 })} USDT</td>
              <td>{formatAmount(trade.usdtAmount, { display: true, fractionDigits: 3 })} USDT</td>
              <td>{formatTradeFee(trade)} USDT</td>
              <td><CopyValueButton value={trade.maker} label={shortAddress(trade.maker)} onToast={onToast} /></td>
              <td><CopyValueButton value={trade.taker} label={shortAddress(trade.taker)} onToast={onToast} /></td>
              <td><CopyValueButton value={trade.orderId} label={shortHash(trade.orderId)} onToast={onToast} /></td>
              <td><CopyValueButton value={trade.transactionHash} label={shortHash(trade.transactionHash)} onToast={onToast} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
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
    return <div className="empty-state inline-empty">暂无挂单记录。</div>
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>时间</th>
            <th>方向</th>
            <th>状态</th>
            <th>总数量</th>
            <th>剩余数量</th>
            <th>价格</th>
            <th>总额</th>
            <th>显示</th>
            <th>挂单方</th>
            <th>订单ID</th>
            <th>交易哈希</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>{formatTime(order.createdAt)}</td>
              <td>{formatOrderSide(order.side)}</td>
              <td><span className={getOrderStatusClass(order.status)}>{formatOrderStatus(order.status)}</span></td>
              <td>{formatAmount(order.spaceAmount, { display: true })} SPACE</td>
              <td>{formatAmount(order.remainingSpaceAmount, { display: true })} SPACE</td>
              <td>{formatAmount(order.price, { display: true, fractionDigits: 3 })} USDT</td>
              <td>{formatOrderTotal(order)} USDT</td>
              <td>{order.visible ? '显示' : '隐藏'}</td>
              <td><CopyValueButton value={order.maker} label={shortAddress(order.maker)} onToast={onToast} /></td>
              <td><CopyValueButton value={order.id} label={shortHash(order.id)} onToast={onToast} /></td>
              <td><CopyValueButton value={order.transactionHash} label={shortHash(order.transactionHash)} onToast={onToast} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  onPrev,
  onNext,
  disabled,
}: {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
  disabled?: boolean
}) {
  return (
    <div className="pager pager-split">
      <button type="button" className="secondary pager-left" onClick={onPrev} disabled={disabled || page <= 1}>
        上一页
      </button>
      <span className="pager-center">第 {page} / {totalPages} 页</span>
      <button type="button" className="secondary pager-right" onClick={onNext} disabled={disabled || page >= totalPages}>
        下一页
      </button>
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

function getTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}

function shortHash(value: string) {
  if (!value) return '-'
  if (value.length <= 18) return value
  return `${value.slice(0, 10)}...${value.slice(-8)}`
}

function formatTradeDirection(side: MarketTakerTrade['side']) {
  return side === 'sell'
    ? '主动买入 / 被动卖出'
    : '主动卖出 / 被动买入'
}

function formatOrderSide(side: MarketOrder['side']) {
  return side === 'buy' ? '买单' : '卖单'
}

function formatOrderStatus(status: MarketOrderStatus) {
  const map: Record<MarketOrderStatus, string> = {
    open: '挂单中',
    filled: '已成交',
    cancelled: '已撤销',
  }

  return map[status] ?? status
}

function getOrderStatusClass(status: MarketOrderStatus) {
  if (status === 'filled') return 'status success'
  if (status === 'cancelled') return 'status danger'
  return 'status pending'
}

function formatTradeFee(trade: MarketTakerTrade) {
  return formatAmount((BigInt(trade.nodeFee || '0') + BigInt(trade.markerFee || '0')).toString(), { display: true, fractionDigits: 3 })
}

function formatOrderTotal(order: MarketOrder) {
  try {
    return formatAmount(
      ((BigInt(order.spaceAmount) * BigInt(order.price)) / 10n ** 18n).toString(),
      { display: true, fractionDigits: 3 },
    )
  } catch {
    return '-'
  }
}
