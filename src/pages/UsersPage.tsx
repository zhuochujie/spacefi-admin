import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { UserRecord } from '../api'
import { accelerateUserMiner, addUserSystemReward, updateUserLevels } from '../api'
import {
  useUserBalanceLogsQuery,
  useUserMarketOrdersQuery,
  useUserAccountMarketTradesQuery,
  useUserAccountMarketTradeStatsQuery,
  useUserMinersQuery,
  useUsersQuery,
  type BalanceFilters,
  type MarketOrderFilters,
  type UserFilters,
} from '../hooks/useAdminData'
import { UserDataModal } from '../components/users/UserDataModal'
import { UserFilters as UserFiltersPanel } from '../components/users/UserFilters'
import { UserLevelModal } from '../components/users/UserLevelModal'
import { UserSystemRewardModal } from '../components/users/UserSystemRewardModal'
import { UserTable } from '../components/users/UserTable'
import { useAdminOutlet } from '../hooks/useAdminOutlet'

const defaultUserFilters: UserFilters = {
  page: 1,
  pageSize: 10,
  address: '',
  vipLevel: '',
  nodeLevel: '',
  sortBy: 'createdAt',
  sortOrder: 'DESC',
}

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

type ModalState = {
  mode: 'balance-logs' | 'miners' | 'market-orders'
  user: UserRecord
} | null

export function UsersPage() {
  const { token, profile } = useAdminOutlet()
  const isAdminUser = profile.username === 'admin'
  const [draftFilters, setDraftFilters] = useState<UserFilters>(defaultUserFilters)
  const [userFilters, setUserFilters] = useState<UserFilters>(defaultUserFilters)
  const [draftBalanceFilters, setDraftBalanceFilters] = useState<BalanceFilters>(defaultBalanceFilters)
  const [balanceFilters, setBalanceFilters] = useState<BalanceFilters>(defaultBalanceFilters)
  const [marketOrderFilters, setMarketOrderFilters] = useState<MarketOrderFilters>(defaultMarketOrderFilters)
  const [balanceSearchKey, setBalanceSearchKey] = useState(0)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [rewardUser, setRewardUser] = useState<UserRecord | null>(null)

  const usersQuery = useUsersQuery(token, userFilters, Boolean(token))
  const users = usersQuery.data?.list ?? []
  const activeUserId = modalState?.user.id ?? null

  const updateUserLevelsMutation = useMutation({
    mutationFn: async ({
      accountId,
      manualVipLevel,
      nodeLevel,
    }: {
      accountId: number
      manualVipLevel?: number
      nodeLevel?: number
    }) => {
      return updateUserLevels(token, accountId, {
        ...(manualVipLevel == null ? {} : { manualVipLevel }),
        ...(nodeLevel == null ? {} : { nodeLevel }),
      })
    },
    onSuccess: async () => {
      await usersQuery.refetch()
      setEditUser(null)
    },
  })

  const accelerateMinerMutation = useMutation({
    mutationFn: async ({
      accountId,
      accountMinerId,
      amount,
    }: {
      accountId: number
      accountMinerId: number
      amount: string
    }) => accelerateUserMiner(token, accountId, accountMinerId, { amount }),
    onSuccess: async () => {
      await Promise.all([
        minersQuery.refetch(),
        usersQuery.refetch(),
      ])
    },
  })

  const systemRewardMutation = useMutation({
    mutationFn: async ({
      accountId,
      rewardToken,
      amount,
    }: {
      accountId: number
      rewardToken: 'SPACE' | 'USDT'
      amount: string
    }) => addUserSystemReward(token, accountId, { token: rewardToken, amount }),
    onSuccess: async (_data, variables) => {
      const refetches: Promise<unknown>[] = [usersQuery.refetch()]
      if (
        modalState?.mode === 'balance-logs' &&
        modalState.user.id === variables.accountId &&
        balanceSearchKey > 0
      ) {
        refetches.push(balanceLogsQuery.refetch())
      }

      await Promise.all(refetches)
      setRewardUser(null)
    },
  })

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
    modalState?.mode === 'market-orders',
  )

  const totalUsers = usersQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalUsers / userFilters.pageSize))
  const modalError =
    modalState?.mode === 'miners'
      ? minersQuery.error?.message
      : modalState?.mode === 'market-orders'
        ? marketOrderFilters.view === 'orders'
          ? marketOrdersQuery.error?.message
          : accountMarketTradesQuery.error?.message
        : balanceLogsQuery.error?.message

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">User Management</p>
        <h1>用户管理</h1>
      </header>

      <UserFiltersPanel
        value={draftFilters}
        busy={usersQuery.isFetching}
        onChange={setDraftFilters}
        onSearch={() => {
          setUserFilters(draftFilters)
        }}
      />

      <section className="summary-row">
        <div className="summary-card">
          <span>用户总数</span>
          <strong>{totalUsers}</strong>
        </div>
        <div className="summary-card">
          <span>当前页</span>
          <strong>
            {userFilters.page} / {totalPages}
          </strong>
        </div>
      </section>

      <section>
        <UserTable
          users={users}
          busy={usersQuery.isFetching}
          total={totalUsers}
          page={userFilters.page}
          pageSize={userFilters.pageSize}
          sortBy={userFilters.sortBy}
          sortOrder={userFilters.sortOrder}
          showSystemReward={isAdminUser}
          showMarketOrders={isAdminUser}
          onPageChange={(page) => {
            setDraftFilters((state) => ({ ...state, page }))
            setUserFilters((state) => ({ ...state, page }))
          }}
          onSortChange={(sortBy) => {
            const sortOrder = userFilters.sortBy === sortBy && userFilters.sortOrder === 'DESC' ? 'ASC' : 'DESC'
            setDraftFilters((state) => ({ ...state, page: 1, sortBy, sortOrder }))
            setUserFilters((state) => ({ ...state, page: 1, sortBy, sortOrder }))
          }}
          onOpenEditLevels={(user: UserRecord) => setEditUser(user)}
          onOpenSystemReward={(user: UserRecord) => setRewardUser(user)}
          onOpenBalanceLogs={(user: UserRecord) => {
            setModalState({ mode: 'balance-logs', user })
            setDraftBalanceFilters(defaultBalanceFilters)
            setBalanceFilters(defaultBalanceFilters)
            setBalanceSearchKey((value) => value + 1)
          }}
          onOpenMiners={(user: UserRecord) => setModalState({ mode: 'miners', user })}
          onOpenMarketOrders={(user: UserRecord) => {
            setModalState({ mode: 'market-orders', user })
            setMarketOrderFilters(defaultMarketOrderFilters)
          }}
        />
      </section>

      <UserLevelModal
        key={editUser?.id ?? 'closed'}
        open={Boolean(editUser)}
        user={editUser}
        busy={updateUserLevelsMutation.isPending}
        error={updateUserLevelsMutation.error?.message}
        onClose={() => {
          setEditUser(null)
          updateUserLevelsMutation.reset()
        }}
        onSubmit={({ manualVipLevel, nodeLevel }) => {
          if (!editUser) return

          updateUserLevelsMutation.mutate({
            accountId: editUser.id,
            manualVipLevel,
            nodeLevel,
          })
        }}
      />

      <UserSystemRewardModal
        key={rewardUser?.id ?? 'closed'}
        open={Boolean(rewardUser)}
        user={rewardUser}
        busy={systemRewardMutation.isPending}
        error={systemRewardMutation.error?.message}
        onClose={() => {
          setRewardUser(null)
          systemRewardMutation.reset()
        }}
        onSubmit={({ token: rewardToken, amount }) => {
          if (!rewardUser) return

          systemRewardMutation.mutate({
            accountId: rewardUser.id,
            rewardToken,
            amount,
          })
        }}
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
        filters={draftBalanceFilters}
        marketOrderFilters={marketOrderFilters}
        totalLogs={balanceLogsQuery.data?.total ?? 0}
        totalMarketOrders={marketOrderFilters.view === 'orders' ? marketOrdersQuery.data?.total ?? 0 : accountMarketTradesQuery.data?.total ?? 0}
        searched={balanceSearchKey > 0}
        busy={balanceLogsQuery.isFetching || minersQuery.isFetching || marketOrdersQuery.isFetching || accountMarketTradesQuery.isFetching || accountMarketTradeStatsQuery.isFetching}
        error={modalError}
        accelerateBusy={accelerateMinerMutation.isPending}
        accelerateError={accelerateMinerMutation.error?.message}
        showAccelerate={isAdminUser}
        onClose={() => setModalState(null)}
        onFiltersChange={setDraftBalanceFilters}
        onMarketOrderFiltersChange={setMarketOrderFilters}
        onPageChange={(page) => {
          setDraftBalanceFilters((state) => ({ ...state, page }))
          setBalanceFilters((state) => ({ ...state, page }))
        }}
        onMarketOrderPageChange={(page) => {
          setMarketOrderFilters((state) => ({ ...state, page }))
        }}
        onSearch={() => {
          setBalanceFilters(draftBalanceFilters)
          setBalanceSearchKey((value) => value + 1)
        }}
        onAccelerateMiner={async (miner, amount) => {
          if (!modalState?.user) return

          await accelerateMinerMutation.mutateAsync({
            accountId: modalState.user.id,
            accountMinerId: miner.id,
            amount,
          })
        }}
      />
    </div>
  )
}
