import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import copy from 'copy-to-clipboard'
import { formatUnits, parseUnits } from 'viem'
import {
  getAdminUsers,
  getTeamMarketTradeStats,
  getUserTeamAddresses,
  updateMarketTradeVolumeAdjustment,
  type MarketOrder,
  type MarketOrderSide,
  type MarketOrderStatus,
  type MarketTakerTrade,
  type UserRecord,
} from '../api'
import { LoadingOverlay } from '../components/common/LoadingOverlay'
import { Pagination } from '../components/common/Pagination'
import { UserDataModal } from '../components/users/UserDataModal'
import { UserTeamModal } from '../components/users/UserTeamModal'
import {
  useMarketOrderDetailQuery,
  useMarketTradeVolumeAdjustmentQuery,
  useOpenMarketOrdersQuery,
  useRecentMarketOrdersQuery,
  useRecentMarketTradesQuery,
  useUserAccountMarketTradesQuery,
  useUserAccountMarketTradeStatsQuery,
  useUserBalanceLogsQuery,
  useUserMarketOrdersQuery,
  useUserMinersQuery,
  useUserTeamBranchesQuery,
  useUserTeamMembersQuery,
  useUserTeamMinerPurchaseStatsQuery,
  useUserTeamOverviewQuery,
  type BalanceFilters,
  type MarketOrderFilters,
  type MarketTradeStatsRange,
  type TeamBranchFilters,
  type TeamMemberFilters,
  type TeamMinerPurchaseStatsRange,
} from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'
import { formatAmount, formatTime, shortAddress } from '../lib/format'

const PAGE_SIZE = 10
const defaultBalanceFilters: BalanceFilters = {
  page: 1,
  pageSize: 10,
  type: [],
  token: '',
}

const defaultMarketOrderFilters: MarketOrderFilters = {
  page: 1,
  pageSize: 10,
  view: 'orders',
  side: '',
  status: '',
  action: '',
}

const getDefaultMarketTradeStatsRange = (): MarketTradeStatsRange => ({
  from: 0,
  to: Math.floor(Date.now() / 1000),
})

const defaultTeamBranchFilters: TeamBranchFilters = {
  page: 1,
  pageSize: 10,
}

const defaultTeamMemberFilters: TeamMemberFilters = {
  page: 1,
  pageSize: 10,
  level: '',
  address: '',
}

const getDefaultTeamMinerPurchaseStatsRange = (): TeamMinerPurchaseStatsRange => ({
  from: 0,
  to: Math.floor(Date.now() / 1000),
})

type UserModalMode = 'balance-logs' | 'miners' | 'market-orders'
type UserAddressAction = UserModalMode | 'team'

export function MarketPage() {
  const { token, profile } = useAdminOutlet()
  const isAdminUser = profile.username === 'admin'
  const [tradePage, setTradePage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [openOrderPage, setOpenOrderPage] = useState(1)
  const [openOrderSide, setOpenOrderSide] = useState<MarketOrderSide>('buy')
  const [orderIdInput, setOrderIdInput] = useState('')
  const [orderId, setOrderId] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const [volumeAdjustmentInput, setVolumeAdjustmentInput] = useState('')
  const [volumeAdjustmentFormError, setVolumeAdjustmentFormError] = useState('')
  const [activeAddressMenu, setActiveAddressMenu] = useState<string | null>(null)
  const [modalState, setModalState] = useState<{ mode: UserModalMode; user: UserRecord } | null>(null)
  const [teamUser, setTeamUser] = useState<UserRecord | null>(null)
  const [draftBalanceFilters, setDraftBalanceFilters] = useState<BalanceFilters>(defaultBalanceFilters)
  const [balanceFilters, setBalanceFilters] = useState<BalanceFilters>(defaultBalanceFilters)
  const [marketOrderFilters, setMarketOrderFilters] = useState<MarketOrderFilters>(defaultMarketOrderFilters)
  const [marketTradeStatsRange, setMarketTradeStatsRange] = useState<MarketTradeStatsRange>(getDefaultMarketTradeStatsRange)
  const [balanceSearchKey, setBalanceSearchKey] = useState(0)
  const [teamBranchFilters, setTeamBranchFilters] = useState<TeamBranchFilters>(defaultTeamBranchFilters)
  const [teamMemberFilters, setTeamMemberFilters] = useState<TeamMemberFilters>(defaultTeamMemberFilters)
  const [teamMinerPurchaseStatsRange, setTeamMinerPurchaseStatsRange] = useState<TeamMinerPurchaseStatsRange>(
    getDefaultTeamMinerPurchaseStatsRange,
  )

  const openOrdersQuery = useOpenMarketOrdersQuery(isAdminUser, openOrderPage, PAGE_SIZE, openOrderSide)
  const recentTradesQuery = useRecentMarketTradesQuery(isAdminUser, tradePage, PAGE_SIZE)
  const recentOrdersQuery = useRecentMarketOrdersQuery(isAdminUser, orderPage, PAGE_SIZE)
  const orderDetailQuery = useMarketOrderDetailQuery(orderId, isAdminUser && Boolean(orderId))
  const volumeAdjustmentQuery = useMarketTradeVolumeAdjustmentQuery(token, isAdminUser)
  const activeUserId = modalState?.user.id ?? null
  const balanceLogsQuery = useUserBalanceLogsQuery(
    token,
    activeUserId,
    balanceFilters,
    modalState?.mode === 'balance-logs',
    balanceSearchKey,
  )
  const minersQuery = useUserMinersQuery(token, activeUserId, modalState?.mode === 'miners')
  const marketOrdersQuery = useUserMarketOrdersQuery(
    modalState?.user.address ?? null,
    marketOrderFilters,
    modalState?.mode === 'market-orders',
  )
  const accountMarketTradesQuery = useUserAccountMarketTradesQuery(
    modalState?.user.address ?? null,
    marketOrderFilters,
    modalState?.mode === 'market-orders',
  )
  const accountMarketTradeStatsQuery = useUserAccountMarketTradeStatsQuery(
    modalState?.user.address ?? null,
    marketTradeStatsRange,
    modalState?.mode === 'market-orders',
  )
  const teamOverviewQuery = useUserTeamOverviewQuery(token, teamUser?.id ?? null, Boolean(teamUser))
  const teamBranchesQuery = useUserTeamBranchesQuery(token, teamUser?.id ?? null, teamBranchFilters, Boolean(teamUser))
  const teamMembersQuery = useUserTeamMembersQuery(token, teamUser?.id ?? null, teamMemberFilters, Boolean(teamUser))
  const teamMinerPurchaseStatsQuery = useUserTeamMinerPurchaseStatsQuery(
    token,
    teamUser?.id ?? null,
    teamMinerPurchaseStatsRange,
    Boolean(teamUser),
  )
  const refreshing = openOrdersQuery.isFetching || recentTradesQuery.isFetching || recentOrdersQuery.isFetching || orderDetailQuery.isFetching

  useEffect(() => {
    if (!toastMessage) return

    const timer = window.setTimeout(() => setToastMessage(''), 1600)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  useEffect(() => {
    if (!volumeAdjustmentQuery.data) return
    setVolumeAdjustmentInput(formatUnits(BigInt(volumeAdjustmentQuery.data.amount), 18))
  }, [volumeAdjustmentQuery.data])

  const volumeAdjustmentMutation = useMutation({
    mutationFn: (amount: string) => updateMarketTradeVolumeAdjustment(token, amount),
    onSuccess: async (result) => {
      setVolumeAdjustmentInput(formatUnits(BigInt(result.amount), 18))
      setVolumeAdjustmentFormError('')
      setToastMessage('交易量调整值已更新')
      await volumeAdjustmentQuery.refetch()
    },
  })

  const tradeTotalPages = useMemo(
    () => getTotalPages(recentTradesQuery.data?.total ?? 0, PAGE_SIZE),
    [recentTradesQuery.data?.total],
  )
  const openOrderTotalPages = useMemo(
    () => getTotalPages(openOrdersQuery.data?.total ?? 0, PAGE_SIZE),
    [openOrdersQuery.data?.total],
  )
  const orderTotalPages = useMemo(
    () => getTotalPages(recentOrdersQuery.data?.total ?? 0, PAGE_SIZE),
    [recentOrdersQuery.data?.total],
  )

  const refresh = async () => {
    const refetches: Promise<unknown>[] = [
      openOrdersQuery.refetch(),
      recentTradesQuery.refetch(),
      recentOrdersQuery.refetch(),
      volumeAdjustmentQuery.refetch(),
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

  const updateVolumeAdjustment = (value: string) => {
    try {
      const amount = parseUnits(value.trim(), 18)
      setVolumeAdjustmentFormError('')
      volumeAdjustmentMutation.mutate(amount.toString())
    } catch {
      setVolumeAdjustmentFormError('请输入有效数量，最多支持 18 位小数')
    }
  }

  const findUserByAddressMutation = useMutation({
    mutationFn: async ({ address, action }: { address: string; action: UserAddressAction }) => {
      const params = new URLSearchParams({
        page: '1',
        pageSize: '10',
        address,
      })
      const result = await getAdminUsers(token, params)
      const user = result.list.find((item) => item.address.toLowerCase() === address.toLowerCase())

      if (!user) {
        throw new Error('用户不存在')
      }

      return { user, action }
    },
    onSuccess: ({ user, action }) => {
      setActiveAddressMenu(null)

      if (action === 'team') {
        setModalState(null)
        setTeamUser(user)
        setTeamBranchFilters(defaultTeamBranchFilters)
        setTeamMemberFilters(defaultTeamMemberFilters)
        setTeamMinerPurchaseStatsRange(getDefaultTeamMinerPurchaseStatsRange())
        teamMarketStatsMutation.reset()
        return
      }

      setTeamUser(null)
      setModalState({ mode: action, user })

      if (action === 'balance-logs') {
        setDraftBalanceFilters(defaultBalanceFilters)
        setBalanceFilters(defaultBalanceFilters)
        setBalanceSearchKey((value) => value + 1)
      }

      if (action === 'market-orders') {
        setMarketOrderFilters(defaultMarketOrderFilters)
        setMarketTradeStatsRange(getDefaultMarketTradeStatsRange())
      }
    },
    onError: (error) => {
      setToastMessage(error instanceof Error ? error.message : '查询用户失败')
    },
  })

  const teamMarketStatsMutation = useMutation({
    mutationFn: async ({
      accountId,
      from,
      to,
    }: {
      accountId: number
      from: number
      to: number
    }) => {
      const { addresses } = await getUserTeamAddresses(token, accountId)
      return getTeamMarketTradeStats({ accounts: addresses, from, to })
    },
  })

  const openUserAction = (address: string, action: UserAddressAction) => {
    findUserByAddressMutation.mutate({ address, action })
  }

  const modalError =
    modalState?.mode === 'miners'
      ? minersQuery.error?.message
      : modalState?.mode === 'market-orders'
        ? marketOrderFilters.view === 'orders'
          ? marketOrdersQuery.error?.message
          : accountMarketTradesQuery.error?.message
        : balanceLogsQuery.error?.message

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
      {openOrdersQuery.error ? <div className="alert error">{openOrdersQuery.error.message}</div> : null}
      {orderDetailQuery.error ? <div className="alert error">{orderDetailQuery.error.message}</div> : null}
      {volumeAdjustmentQuery.error ? <div className="alert error">{volumeAdjustmentQuery.error.message}</div> : null}

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Market Volume</p>
            <h2>24 小时交易量调整</h2>
          </div>
          <span>
            当前调整：{volumeAdjustmentQuery.data
              ? `${formatAmount(volumeAdjustmentQuery.data.amount, { display: true })} SPACE`
              : '加载中'}
          </span>
        </div>
        <div className="detail-filters">
          <div className="field compact">
            <label htmlFor="market-volume-adjustment">调整数量（SPACE）</label>
            <input
              id="market-volume-adjustment"
              value={volumeAdjustmentInput}
              disabled={volumeAdjustmentMutation.isPending}
              placeholder="支持正数或负数"
              onChange={(event) => setVolumeAdjustmentInput(event.target.value)}
            />
          </div>
          <div className="field compact toolbar-action">
            <label aria-hidden="true">&nbsp;</label>
            <button
              type="button"
              className="primary"
              disabled={volumeAdjustmentMutation.isPending}
              onClick={() => updateVolumeAdjustment(volumeAdjustmentInput)}
            >
              {volumeAdjustmentMutation.isPending ? '保存中...' : '保存调整值'}
            </button>
          </div>
          <div className="field compact toolbar-action">
            <label aria-hidden="true">&nbsp;</label>
            <button
              type="button"
              className="secondary"
              disabled={volumeAdjustmentMutation.isPending}
              onClick={() => updateVolumeAdjustment('0')}
            >
              归零
            </button>
          </div>
        </div>
        {(volumeAdjustmentFormError || volumeAdjustmentMutation.error) && (
          <p className="status error">
            {volumeAdjustmentFormError || volumeAdjustmentMutation.error?.message}
          </p>
        )}
        <p className="status">该值会加到 indexer 返回的真实 24 小时 SPACE 成交量上，并保存在 Redis。</p>
      </section>

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
            activeAddressMenu={activeAddressMenu}
            onToggleAddressMenu={setActiveAddressMenu}
            onOpenUserAction={openUserAction}
          />
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Open Orders</p>
            <h2>当前市场挂单</h2>
          </div>
          <span>{openOrdersQuery.data ? `共 ${openOrdersQuery.data.total} 笔` : '买单/卖单分别查看'}</span>
        </div>
        <div className="market-side-tabs">
          <button
            type="button"
            className={openOrderSide === 'buy' ? 'active' : ''}
            disabled={openOrdersQuery.isFetching}
            onClick={() => {
              setOpenOrderSide('buy')
              setOpenOrderPage(1)
            }}
          >
            买单
          </button>
          <button
            type="button"
            className={openOrderSide === 'sell' ? 'active' : ''}
            disabled={openOrdersQuery.isFetching}
            onClick={() => {
              setOpenOrderSide('sell')
              setOpenOrderPage(1)
            }}
          >
            卖单
          </button>
        </div>
        <div className={openOrdersQuery.isFetching ? 'loading-scope is-loading' : 'loading-scope'}>
          <LoadingOverlay loading={openOrdersQuery.isFetching} />
          <MarketOrderTable
            orders={openOrdersQuery.data?.items ?? []}
            busy={openOrdersQuery.isFetching}
            onToast={setToastMessage}
            activeAddressMenu={activeAddressMenu}
            onToggleAddressMenu={setActiveAddressMenu}
            onOpenUserAction={openUserAction}
          />
        </div>
        <Pagination
          page={openOrderPage}
          totalPages={openOrderTotalPages}
          busy={openOrdersQuery.isFetching}
          onPageChange={setOpenOrderPage}
        />
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
            activeAddressMenu={activeAddressMenu}
            onToggleAddressMenu={setActiveAddressMenu}
            onOpenUserAction={openUserAction}
          />
        </div>
        <Pagination
          page={tradePage}
          totalPages={tradeTotalPages}
          busy={recentTradesQuery.isFetching}
          onPageChange={setTradePage}
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
            activeAddressMenu={activeAddressMenu}
            onToggleAddressMenu={setActiveAddressMenu}
            onOpenUserAction={openUserAction}
          />
        </div>
        <Pagination
          page={orderPage}
          totalPages={orderTotalPages}
          busy={recentOrdersQuery.isFetching}
          onPageChange={setOrderPage}
        />
      </section>

      <UserTeamModal
        open={Boolean(teamUser)}
        user={teamUser}
        overview={teamOverviewQuery.data ?? null}
        branches={teamBranchesQuery.data?.list ?? []}
        members={teamMembersQuery.data?.list ?? []}
        branchFilters={teamBranchFilters}
        memberFilters={teamMemberFilters}
        totalBranches={teamBranchesQuery.data?.total ?? 0}
        totalMembers={teamMembersQuery.data?.total ?? 0}
        marketStats={teamMarketStatsMutation.data ?? null}
        minerPurchaseStats={teamMinerPurchaseStatsQuery.data ?? null}
        minerPurchaseStatsRange={teamMinerPurchaseStatsRange}
        busy={teamOverviewQuery.isFetching || teamBranchesQuery.isFetching || teamMembersQuery.isFetching || teamMinerPurchaseStatsQuery.isFetching}
        marketStatsBusy={teamMarketStatsMutation.isPending}
        minerPurchaseStatsBusy={teamMinerPurchaseStatsQuery.isFetching}
        error={teamOverviewQuery.error?.message || teamBranchesQuery.error?.message || teamMembersQuery.error?.message}
        marketStatsError={teamMarketStatsMutation.error?.message}
        minerPurchaseStatsError={teamMinerPurchaseStatsQuery.error?.message}
        onClose={() => {
          setTeamUser(null)
          teamMarketStatsMutation.reset()
        }}
        onQueryMarketStats={({ from, to }) => {
          if (!teamUser) return
          teamMarketStatsMutation.mutate({ accountId: teamUser.id, from, to })
        }}
        onQueryMinerPurchaseStats={setTeamMinerPurchaseStatsRange}
        onBranchPageChange={(page) => setTeamBranchFilters((state) => ({ ...state, page }))}
        onMemberFiltersChange={setTeamMemberFilters}
        onMemberPageChange={(page) => setTeamMemberFilters((state) => ({ ...state, page }))}
      />

      <UserDataModal
        open={Boolean(modalState)}
        title={modalState?.mode === 'miners' ? '用户矿机' : modalState?.mode === 'market-orders' ? '市场订单' : '资金记录'}
        user={modalState?.user ?? null}
        mode={modalState?.mode ?? 'balance-logs'}
        logs={balanceLogsQuery.data?.list ?? []}
        miners={minersQuery.data?.list ?? []}
        marketOrders={marketOrdersQuery.data?.items ?? []}
        marketTrades={accountMarketTradesQuery.data?.items ?? []}
        marketTradeStats={accountMarketTradeStatsQuery.data ?? null}
        marketTradeStatsRange={marketTradeStatsRange}
        marketTradeStatsBusy={accountMarketTradeStatsQuery.isFetching}
        marketTradeStatsError={accountMarketTradeStatsQuery.error?.message}
        filters={draftBalanceFilters}
        marketOrderFilters={marketOrderFilters}
        totalLogs={balanceLogsQuery.data?.total ?? 0}
        totalMarketOrders={marketOrderFilters.view === 'orders' ? marketOrdersQuery.data?.total ?? 0 : accountMarketTradesQuery.data?.total ?? 0}
        searched={balanceSearchKey > 0}
        busy={balanceLogsQuery.isFetching || minersQuery.isFetching || marketOrdersQuery.isFetching || accountMarketTradesQuery.isFetching || accountMarketTradeStatsQuery.isFetching || findUserByAddressMutation.isPending}
        error={modalError}
        showAccelerate={false}
        onClose={() => setModalState(null)}
        onFiltersChange={setDraftBalanceFilters}
        onMarketOrderFiltersChange={setMarketOrderFilters}
        onMarketTradeStatsSearch={setMarketTradeStatsRange}
        onPageChange={(page) => {
          setDraftBalanceFilters((state) => ({ ...state, page }))
          setBalanceFilters((state) => ({ ...state, page }))
        }}
        onMarketOrderPageChange={(page) => setMarketOrderFilters((state) => ({ ...state, page }))}
        onSearch={() => {
          setBalanceFilters(draftBalanceFilters)
          setBalanceSearchKey((value) => value + 1)
        }}
        onAccelerateMiner={async () => undefined}
      />

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
  activeAddressMenu,
  onToggleAddressMenu,
  onOpenUserAction,
}: {
  order: MarketOrder | null
  trades: MarketTakerTrade[]
  searched: boolean
  busy: boolean
  onToast: (message: string) => void
  activeAddressMenu: string | null
  onToggleAddressMenu: (address: string | null) => void
  onOpenUserAction: (address: string, action: UserAddressAction) => void
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
          <strong>
            <UserAddressMenuButton
              address={order.maker}
              menuKey={`order-detail-${order.id}-maker`}
              activeAddressMenu={activeAddressMenu}
              onToggleAddressMenu={onToggleAddressMenu}
              onOpenUserAction={onOpenUserAction}
              onToast={onToast}
            />
          </strong>
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
      <MarketTradeTable
        trades={trades}
        busy={busy}
        onToast={onToast}
        activeAddressMenu={activeAddressMenu}
        onToggleAddressMenu={onToggleAddressMenu}
        onOpenUserAction={onOpenUserAction}
      />
    </div>
  )
}

function MarketTradeTable({
  trades,
  busy,
  onToast,
  activeAddressMenu,
  onToggleAddressMenu,
  onOpenUserAction,
}: {
  trades: MarketTakerTrade[]
  busy: boolean
  onToast: (message: string) => void
  activeAddressMenu: string | null
  onToggleAddressMenu: (address: string | null) => void
  onOpenUserAction: (address: string, action: UserAddressAction) => void
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
              <td>
                <UserAddressMenuButton
                  address={trade.maker}
                  menuKey={`trade-${trade.id}-maker`}
                  activeAddressMenu={activeAddressMenu}
                  onToggleAddressMenu={onToggleAddressMenu}
                  onOpenUserAction={onOpenUserAction}
                  onToast={onToast}
                />
              </td>
              <td>
                <UserAddressMenuButton
                  address={trade.taker}
                  menuKey={`trade-${trade.id}-taker`}
                  activeAddressMenu={activeAddressMenu}
                  onToggleAddressMenu={onToggleAddressMenu}
                  onOpenUserAction={onOpenUserAction}
                  onToast={onToast}
                />
              </td>
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
  activeAddressMenu,
  onToggleAddressMenu,
  onOpenUserAction,
}: {
  orders: MarketOrder[]
  busy: boolean
  onToast: (message: string) => void
  activeAddressMenu: string | null
  onToggleAddressMenu: (address: string | null) => void
  onOpenUserAction: (address: string, action: UserAddressAction) => void
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
              <td>
                <UserAddressMenuButton
                  address={order.maker}
                  menuKey={`order-${order.id}-maker`}
                  activeAddressMenu={activeAddressMenu}
                  onToggleAddressMenu={onToggleAddressMenu}
                  onOpenUserAction={onOpenUserAction}
                  onToast={onToast}
                />
              </td>
              <td><CopyValueButton value={order.id} label={shortHash(order.id)} onToast={onToast} /></td>
              <td><CopyValueButton value={order.transactionHash} label={shortHash(order.transactionHash)} onToast={onToast} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UserAddressMenuButton({
  address,
  menuKey,
  activeAddressMenu,
  onToggleAddressMenu,
  onOpenUserAction,
  onToast,
}: {
  address: string
  menuKey: string
  activeAddressMenu: string | null
  onToggleAddressMenu: (address: string | null) => void
  onOpenUserAction: (address: string, action: UserAddressAction) => void
  onToast: (message: string) => void
}) {
  const isOpen = activeAddressMenu === menuKey
  const actions: { action: UserAddressAction; label: string }[] = [
    { action: 'balance-logs', label: '资金记录' },
    { action: 'miners', label: '矿机' },
    { action: 'market-orders', label: '市场订单' },
    { action: 'team', label: '团队' },
  ]
  const handleCopy = async () => {
    onToast(await copy(address, { fallbackToPrompt: true }) ? '已复制' : '复制失败')
    onToggleAddressMenu(null)
  }

  return (
    <span className="address-menu-wrap">
      <button
        type="button"
        className="copy-cell-button"
        title={address}
        onClick={() => onToggleAddressMenu(isOpen ? null : menuKey)}
      >
        {shortAddress(address)}
      </button>
      {isOpen && (
        <span className="address-action-menu">
          <button type="button" onClick={handleCopy}>
            复制地址
          </button>
          {actions.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => onOpenUserAction(address, item.action)}
            >
              {item.label}
            </button>
          ))}
        </span>
      )}
    </span>
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
