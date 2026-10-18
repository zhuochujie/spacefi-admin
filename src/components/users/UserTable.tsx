import type { UserRecord } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { Pagination } from '../common/Pagination'
import { formatAmount, formatTime } from '../../lib/format'

type UserTableProps = {
  users: UserRecord[]
  busy: boolean
  total: number
  page: number
  pageSize: number
  sortBy: string
  sortOrder: string
  showSystemReward: boolean
  showTransfer: boolean
  showMarketOrders: boolean
  showTeam: boolean
  showDelete: boolean
  showMarketMakerWhitelist: boolean
  marketMakerWhitelistBusyId?: number
  onPageChange: (page: number) => void
  onSortChange: (sortBy: string) => void
  onOpenEditLevels: (user: UserRecord) => void
  onOpenSystemReward: (user: UserRecord) => void
  onOpenTransfer: (user: UserRecord) => void
  onOpenBalanceLogs: (user: UserRecord) => void
  onOpenMiners: (user: UserRecord) => void
  onOpenMarketOrders: (user: UserRecord) => void
  onOpenTeam: (user: UserRecord) => void
  onOpenDelete: (user: UserRecord) => void
  onToggleMarketMakerWhitelist: (user: UserRecord) => void
}

export function UserTable({
  users,
  busy,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  showSystemReward,
  showTransfer,
  showMarketOrders,
  showTeam,
  showDelete,
  showMarketMakerWhitelist,
  marketMakerWhitelistBusyId,
  onPageChange,
  onSortChange,
  onOpenEditLevels,
  onOpenSystemReward,
  onOpenTransfer,
  onOpenBalanceLogs,
  onOpenMiners,
  onOpenMarketOrders,
  onOpenTeam,
  onOpenDelete,
  onToggleMarketMakerWhitelist,
}: UserTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const sortLabel = sortOrder === 'ASC' ? '升序' : '降序'

  return (
    <div className="panel list-panel">
      <div className="panel-head">
        <h2>用户列表</h2>
        <span>{busy ? '刷新中' : `${users.length} 条`}</span>
      </div>
      <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
        <LoadingOverlay loading={busy} />
        <table className="user-table">
          <thead>
            <tr>
              <SortableTh field="id" label="ID" sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
              <th>地址</th>
              <th>推荐码</th>
              <SortableTh field="vipLevel" label="VIP等级" sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableTh
                field="manualVipLevel"
                label="指定VIP等级"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <SortableTh field="nodeLevel" label="节点等级" sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
              <th>做市白名单</th>
              <SortableTh field="balance" label="SPACE" sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableTh field="usdtBalance" label="USDT" sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableTh field="teamCount" label="团队人数" sortBy={sortBy} sortOrder={sortOrder} onSortChange={onSortChange} />
              <SortableTh
                field="teamPerformance"
                label="团队业绩"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <SortableTh
                field="createdAt"
                label="创建时间"
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={onSortChange}
              />
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.address}</td>
                <td>{user.refCode || '-'}</td>
                <td>{user.vipLevel}</td>
                <td>{user.manualVipLevel}</td>
                <td>{user.nodeLevel}</td>
                <td>{user.marketMakerWhitelisted ? '是' : '否'}</td>
                <td>{formatAmount(user.balance, { display: true })}</td>
                <td>{formatAmount(user.usdtBalance, { display: true })}</td>
                <td>{user.teamCount ?? 0}</td>
                <td>{formatAmount(user.teamPerformance ?? '0', { display: true })}</td>
                <td>{formatTime(user.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button type="button" className="secondary small" onClick={() => onOpenEditLevels(user)}>
                      修改等级
                    </button>
                    {showSystemReward && (
                      <button type="button" className="secondary small" onClick={() => onOpenSystemReward(user)}>
                        系统奖励
                      </button>
                    )}
                    {showTransfer && (
                      <button type="button" className="secondary small" onClick={() => onOpenTransfer(user)}>
                        转账
                      </button>
                    )}
                    <button type="button" className="secondary small" onClick={() => onOpenBalanceLogs(user)}>
                      资金记录
                    </button>
                    <button type="button" className="secondary small" onClick={() => onOpenMiners(user)}>
                      矿机
                    </button>
                    {showMarketOrders && (
                      <button type="button" className="secondary small" onClick={() => onOpenMarketOrders(user)}>
                        市场订单
                      </button>
                    )}
                    {showTeam && (
                      <button type="button" className="secondary small" onClick={() => onOpenTeam(user)}>
                        团队
                      </button>
                    )}
                    {showMarketMakerWhitelist && (
                      <button
                        type="button"
                        className="secondary small"
                        disabled={marketMakerWhitelistBusyId === user.id}
                        onClick={() => onToggleMarketMakerWhitelist(user)}
                      >
                        {marketMakerWhitelistBusyId === user.id
                          ? '处理中...'
                          : user.marketMakerWhitelisted
                            ? '移出做市白名单'
                            : '加入做市白名单'}
                      </button>
                    )}
                    {showDelete && (
                      <button
                        type="button"
                        className="danger small"
                        onClick={() => onOpenDelete(user)}
                        disabled={(user.teamCount ?? 0) > 0}
                        title={(user.teamCount ?? 0) > 0 ? '该用户存在下级，不能删除' : '删除用户'}
                      >
                        删除
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={page}
        totalPages={totalPages}
        busy={busy}
        extraInfo={`${formatSortName(sortBy)} ${sortLabel}`}
        onPageChange={onPageChange}
      />
    </div>
  )
}

function SortableTh({
  field,
  label,
  sortBy,
  sortOrder,
  onSortChange,
}: {
  field: string
  label: string
  sortBy: string
  sortOrder: string
  onSortChange: (sortBy: string) => void
}) {
  const active = sortBy === field
  const nextOrder = active && sortOrder === 'DESC' ? 'ASC' : 'DESC'

  return (
    <th>
      <button
        type="button"
        className={active ? 'th-sort active' : 'th-sort'}
        onClick={() => onSortChange(field)}
        aria-label={`${label}排序，${active ? `当前${sortOrder === 'ASC' ? '升序' : '降序'}，点击切换为${nextOrder === 'ASC' ? '升序' : '降序'}` : '点击按此字段排序'}`}
      >
        <span>{label}</span>
        <span aria-hidden="true" className="sort-indicator">
          {active ? (sortOrder === 'ASC' ? '↑' : '↓') : '↕'}
        </span>
      </button>
    </th>
  )
}

function formatSortName(sortBy: string) {
  const names: Record<string, string> = {
    id: '用户ID',
    createdAt: '创建时间',
    balance: 'SPACE',
    usdtBalance: 'USDT',
    vipLevel: 'VIP等级',
    manualVipLevel: '指定VIP等级',
    nodeLevel: '节点等级',
    teamCount: '团队人数',
    teamPerformance: '团队业绩',
  }

  return names[sortBy] ?? sortBy
}
