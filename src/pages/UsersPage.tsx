import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import type { UserRecord } from '../api'
import { updateUserLevels } from '../api'
import {
  useUserBalanceLogsQuery,
  useUserMinersQuery,
  useUsersQuery,
  type BalanceFilters,
  type UserFilters,
} from '../hooks/useAdminData'
import { UserDataModal } from '../components/users/UserDataModal'
import { UserFilters as UserFiltersPanel } from '../components/users/UserFilters'
import { UserLevelModal } from '../components/users/UserLevelModal'
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

type ModalState = {
  mode: 'balance-logs' | 'miners'
  user: UserRecord
} | null

export function UsersPage() {
  const { token } = useAdminOutlet()
  const [draftFilters, setDraftFilters] = useState<UserFilters>(defaultUserFilters)
  const [userFilters, setUserFilters] = useState<UserFilters>(defaultUserFilters)
  const [draftBalanceFilters, setDraftBalanceFilters] = useState<BalanceFilters>(defaultBalanceFilters)
  const [balanceFilters, setBalanceFilters] = useState<BalanceFilters>(defaultBalanceFilters)
  const [balanceSearchKey, setBalanceSearchKey] = useState(0)
  const [modalState, setModalState] = useState<ModalState>(null)
  const [editUser, setEditUser] = useState<UserRecord | null>(null)

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

  const balanceLogsQuery = useUserBalanceLogsQuery(
    token,
    activeUserId,
    balanceFilters,
    modalState?.mode === 'balance-logs',
    balanceSearchKey,
  )
  const minersQuery = useUserMinersQuery(token, activeUserId, modalState?.mode === 'miners')

  const totalUsers = usersQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalUsers / userFilters.pageSize))
  const modalError =
    modalState?.mode === 'miners' ? minersQuery.error?.message : balanceLogsQuery.error?.message

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">User Management</p>
        <h1>用户管理</h1>
      </header>

      <UserFiltersPanel
        value={draftFilters}
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
          onOpenBalanceLogs={(user: UserRecord) => {
            setModalState({ mode: 'balance-logs', user })
            setDraftBalanceFilters(defaultBalanceFilters)
            setBalanceFilters(defaultBalanceFilters)
            setBalanceSearchKey((value) => value + 1)
          }}
          onOpenMiners={(user: UserRecord) => setModalState({ mode: 'miners', user })}
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

      <UserDataModal
        open={Boolean(modalState)}
        title={modalState?.mode === 'miners' ? '用户矿机' : '资金记录'}
        user={modalState?.user ?? null}
        mode={modalState?.mode ?? 'balance-logs'}
        logs={balanceLogsQuery.data?.list ?? []}
        miners={minersQuery.data?.list ?? []}
        filters={draftBalanceFilters}
        totalLogs={balanceLogsQuery.data?.total ?? 0}
        searched={balanceSearchKey > 0}
        busy={balanceLogsQuery.isFetching || minersQuery.isFetching}
        error={modalError}
        onClose={() => setModalState(null)}
        onFiltersChange={setDraftBalanceFilters}
        onPageChange={(page) => {
          setDraftBalanceFilters((state) => ({ ...state, page }))
          setBalanceFilters((state) => ({ ...state, page }))
        }}
        onSearch={() => {
          setBalanceFilters(draftBalanceFilters)
          setBalanceSearchKey((value) => value + 1)
        }}
      />
    </div>
  )
}
