import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  updateDividendRuleGroup,
  type DividendRuleGroup,
  type DividendRuleGroupPayload,
} from '../api'
import { DividendLogTable } from '../components/dividends/DividendLogTable'
import { DividendRuleModal } from '../components/dividends/DividendRuleModal'
import { DividendRuleTable } from '../components/dividends/DividendRuleTable'
import { useAdminOutlet } from '../hooks/useAdminOutlet'
import { useDividendLogsQuery, useDividendRulesQuery, type DividendLogFilters } from '../hooks/useAdminData'

const defaultLogFilters: DividendLogFilters = {
  page: 1,
  pageSize: 10,
}

export function DividendsPage() {
  const { token } = useAdminOutlet()
  const [editingGroup, setEditingGroup] = useState<DividendRuleGroup | null>(null)
  const [logFilters, setLogFilters] = useState<DividendLogFilters>(defaultLogFilters)

  const rulesQuery = useDividendRulesQuery(token, Boolean(token))
  const ruleGroups = rulesQuery.data ?? []
  const vipGroups = ruleGroups.filter((group) => group.category === 'vip')
  const nodeGroups = ruleGroups.filter((group) => group.category === 'node')
  const logsQuery = useDividendLogsQuery(token, logFilters, Boolean(token))
  const logResponse = logsQuery.data

  const updateBpMutation = useMutation({
    mutationFn: async ({ group, payload }: { group: DividendRuleGroup; payload: DividendRuleGroupPayload }) => {
      return updateDividendRuleGroup(token, group.category, group.token, payload)
    },
    onSuccess: async () => {
      await rulesQuery.refetch()
      setEditingGroup(null)
    },
  })

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Dividend Management</p>
        <h1>分红管理</h1>
      </header>

      <section className="summary-row">
        <div className="summary-card">
          <span>规则分组</span>
          <strong>{ruleGroups.length}</strong>
        </div>
        <div className="summary-card">
          <span>VIP分组</span>
          <strong>{vipGroups.length}</strong>
        </div>
        <div className="summary-card">
          <span>节点分组</span>
          <strong>{nodeGroups.length}</strong>
        </div>
      </section>

      <DividendRuleTable
        groups={ruleGroups}
        busy={rulesQuery.isFetching}
        onEdit={(group) => {
          updateBpMutation.reset()
          setEditingGroup(group)
        }}
      />

      <DividendLogTable
        logs={logResponse?.list ?? []}
        total={logResponse?.total ?? 0}
        page={logFilters.page}
        pageSize={logFilters.pageSize}
        busy={logsQuery.isFetching}
        onPageChange={(page) => setLogFilters((state) => ({ ...state, page }))}
      />

      <DividendRuleModal
        key={editingGroup ? `${editingGroup.category}-${editingGroup.token}` : 'closed'}
        open={Boolean(editingGroup)}
        group={editingGroup}
        busy={updateBpMutation.isPending}
        error={updateBpMutation.error?.message}
        onClose={() => {
          setEditingGroup(null)
          updateBpMutation.reset()
        }}
        onSubmit={(payload) => {
          if (!editingGroup) return
          updateBpMutation.mutate({ group: editingGroup, payload })
        }}
      />
    </div>
  )
}
