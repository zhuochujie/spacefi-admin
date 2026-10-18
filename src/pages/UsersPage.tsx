import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { UserRecord } from '../api'
import {
  accelerateUserMiner,
  addUserSystemReward,
  batchAccelerateAccountMiners,
  deleteUser,
  getTeamMarketTradeStats,
  getUserTeamAddresses,
  transferUserBalance,
  updateMarketMakerWhitelist,
  updateUserLevels,
} from '../api'
import {
  useUserBalanceLogsQuery,
  useUserMarketOrdersQuery,
  useUserAccountMarketTradesQuery,
  useUserAccountMarketTradeStatsQuery,
  useUserMinersQuery,
  useUserTeamBranchesQuery,
  useUserTeamMembersQuery,
  useUserTeamMinerPurchaseStatsQuery,
  useUserTeamOverviewQuery,
  useUsersQuery,
  type BalanceFilters,
  type MarketOrderFilters,
  type MarketTradeStatsRange,
  type TeamBranchFilters,
  type TeamMemberFilters,
  type TeamMinerPurchaseStatsRange,
  type UserFilters,
} from '../hooks/useAdminData'
import { UserDataModal } from '../components/users/UserDataModal'
import { UserFilters as UserFiltersPanel } from '../components/users/UserFilters'
import { UserLevelModal } from '../components/users/UserLevelModal'
import { UserSystemRewardModal } from '../components/users/UserSystemRewardModal'
import { UserTransferModal } from '../components/users/UserTransferModal'
import { UserTeamModal } from '../components/users/UserTeamModal'
import { UserTable } from '../components/users/UserTable'
import { BatchAccelerateMinersModal } from '../components/users/BatchAccelerateMinersModal'
import { UserDeleteModal } from '../components/users/UserDeleteModal'
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
  const [marketTradeStatsRange, setMarketTradeStatsRange] = useState<MarketTradeStatsRange>(getDefaultMarketTradeStatsRange)
  const [balanceSearchKey, setBalanceSearchKey] = useState(0)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)
  const [rewardUser, setRewardUser] = useState<UserRecord | null>(null)
  const [transferUser, setTransferUser] = useState<UserRecord | null>(null)
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserRecord | null>(null)
  const [teamUser, setTeamUser] = useState<UserRecord | null>(null)
  const [teamBranchFilters, setTeamBranchFilters] = useState<TeamBranchFilters>(defaultTeamBranchFilters)
  const [teamMemberFilters, setTeamMemberFilters] = useState<TeamMemberFilters>(defaultTeamMemberFilters)
  const [teamMinerPurchaseStatsRange, setTeamMinerPurchaseStatsRange] = useState<TeamMinerPurchaseStatsRange>(
    getDefaultTeamMinerPurchaseStatsRange,
  )
  const [batchAccelerateOpen, setBatchAccelerateOpen] = useState(false)

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

  const marketMakerWhitelistMutation = useMutation({
    mutationFn: ({ accountId, enabled }: { accountId: number; enabled: boolean }) =>
      updateMarketMakerWhitelist(token, accountId, enabled),
    onSuccess: async () => {
      await usersQuery.refetch()
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

  const transferMutation = useMutation({
    mutationFn: async ({
      accountId,
      toAddress,
      transferToken,
      amount,
    }: {
      accountId: number
      toAddress: string
      transferToken: 'SPACE' | 'USDT'
      amount: string
    }) => transferUserBalance(token, accountId, { toAddress, token: transferToken, amount }),
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
    },
  })

  const batchAccelerateMutation = useMutation({
    mutationFn: async (addresses: string[]) => batchAccelerateAccountMiners(token, { addresses }),
    onSuccess: async () => {
      await usersQuery.refetch()
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: async ({
      accountId,
      confirmAddress,
    }: {
      accountId: number
      confirmAddress: string
    }) => deleteUser(token, accountId, confirmAddress),
    onSuccess: async (_data, variables) => {
      await usersQuery.refetch()
      if (modalState?.user.id === variables.accountId) {
        setModalState(null)
      }
      if (teamUser?.id === variables.accountId) {
        setTeamUser(null)
      }
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

      {marketMakerWhitelistMutation.error && (
        <div className="alert error">{marketMakerWhitelistMutation.error.message}</div>
      )}

      <UserFiltersPanel
        value={draftFilters}
        busy={usersQuery.isFetching}
        onChange={setDraftFilters}
        onSearch={() => {
          setUserFilters(draftFilters)
        }}
      />

      {isAdminUser && (
        <div className="toolbar">
          <div className="field compact toolbar-action">
            <label aria-hidden="true">&nbsp;</label>
            <button
              type="button"
              className="primary"
              onClick={() => {
                batchAccelerateMutation.reset()
                setBatchAccelerateOpen(true)
              }}
            >
              批量加速矿机
            </button>
          </div>
        </div>
      )}

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
          showTransfer={isAdminUser}
          showMarketOrders={isAdminUser}
          showTeam={isAdminUser}
          showDelete={isAdminUser}
          showMarketMakerWhitelist={isAdminUser}
          marketMakerWhitelistBusyId={
            marketMakerWhitelistMutation.isPending
              ? marketMakerWhitelistMutation.variables?.accountId
              : undefined
          }
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
          onOpenTransfer={(user: UserRecord) => {
            transferMutation.reset()
            setTransferUser(user)
          }}
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
            setMarketTradeStatsRange(getDefaultMarketTradeStatsRange())
          }}
          onOpenTeam={(user: UserRecord) => {
            setTeamUser(user)
            setTeamBranchFilters(defaultTeamBranchFilters)
            setTeamMemberFilters(defaultTeamMemberFilters)
            setTeamMinerPurchaseStatsRange(getDefaultTeamMinerPurchaseStatsRange())
            teamMarketStatsMutation.reset()
          }}
          onOpenDelete={(user: UserRecord) => {
            deleteUserMutation.reset()
            setDeleteTargetUser(user)
          }}
          onToggleMarketMakerWhitelist={(user: UserRecord) => {
            marketMakerWhitelistMutation.mutate({
              accountId: user.id,
              enabled: !user.marketMakerWhitelisted,
            })
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

      <UserTransferModal
        key={transferUser?.id ?? 'closed'}
        open={Boolean(transferUser)}
        user={transferUser}
        busy={transferMutation.isPending}
        error={transferMutation.error?.message}
        result={transferMutation.data ?? null}
        onClose={() => {
          setTransferUser(null)
          transferMutation.reset()
        }}
        onSubmit={({ toAddress, token: transferToken, amount }) => {
          if (!transferUser) return

          transferMutation.mutate({
            accountId: transferUser.id,
            toAddress,
            transferToken,
            amount,
          })
        }}
      />

      <UserDeleteModal
        key={deleteTargetUser?.id ?? 'closed'}
        open={Boolean(deleteTargetUser)}
        user={deleteTargetUser}
        busy={deleteUserMutation.isPending}
        error={deleteUserMutation.error?.message}
        result={deleteUserMutation.data ?? null}
        onClose={() => {
          setDeleteTargetUser(null)
          deleteUserMutation.reset()
        }}
        onSubmit={(confirmAddress) => {
          if (!deleteTargetUser) return

          deleteUserMutation.mutate({
            accountId: deleteTargetUser.id,
            confirmAddress,
          })
        }}
      />

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
        busy={balanceLogsQuery.isFetching || minersQuery.isFetching || marketOrdersQuery.isFetching || accountMarketTradesQuery.isFetching || accountMarketTradeStatsQuery.isFetching}
        error={modalError}
        accelerateBusy={accelerateMinerMutation.isPending}
        accelerateError={accelerateMinerMutation.error?.message}
        showAccelerate={isAdminUser}
        onClose={() => setModalState(null)}
        onFiltersChange={setDraftBalanceFilters}
        onMarketOrderFiltersChange={setMarketOrderFilters}
        onMarketTradeStatsSearch={setMarketTradeStatsRange}
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

      <BatchAccelerateMinersModal
        open={batchAccelerateOpen}
        busy={batchAccelerateMutation.isPending}
        error={batchAccelerateMutation.error?.message}
        result={batchAccelerateMutation.data ?? null}
        onClose={() => {
          setBatchAccelerateOpen(false)
          batchAccelerateMutation.reset()
        }}
        onSubmit={(addresses) => {
          batchAccelerateMutation.mutate(addresses)
        }}
      />
    </div>
  )
}
