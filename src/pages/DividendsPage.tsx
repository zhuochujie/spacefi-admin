import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { updateDividendRule, type DividendRule } from '../api'
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
  const [editingRule, setEditingRule] = useState<DividendRule | null>(null)
  const [logFilters, setLogFilters] = useState<DividendLogFilters>(defaultLogFilters)

  const rulesQuery = useDividendRulesQuery(token, Boolean(token))
  const rules = rulesQuery.data ?? []
  const vipRules = rules.filter((rule) => rule.category === 'vip')
  const nodeRules = rules.filter((rule) => rule.category === 'node')
  const logsQuery = useDividendLogsQuery(token, logFilters, Boolean(token))
  const logResponse = logsQuery.data

  const updateBpMutation = useMutation({
    mutationFn: async ({ ruleId, bp }: { ruleId: number; bp: number }) => {
      return updateDividendRule(token, ruleId, { bp })
    },
    onSuccess: async () => {
      await rulesQuery.refetch()
      setEditingRule(null)
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
          <span>规则总数</span>
          <strong>{rules.length}</strong>
        </div>
        <div className="summary-card">
          <span>VIP规则</span>
          <strong>{vipRules.length}</strong>
        </div>
        <div className="summary-card">
          <span>节点规则</span>
          <strong>{nodeRules.length}</strong>
        </div>
      </section>

      <DividendRuleTable
        rules={rules}
        busy={rulesQuery.isFetching}
        onEdit={(rule) => {
          updateBpMutation.reset()
          setEditingRule(rule)
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
        key={editingRule?.id ?? 'closed'}
        open={Boolean(editingRule)}
        rule={editingRule}
        busy={updateBpMutation.isPending}
        error={updateBpMutation.error?.message}
        onClose={() => {
          setEditingRule(null)
          updateBpMutation.reset()
        }}
        onSubmit={({ bp }) => {
          if (!editingRule) return
          updateBpMutation.mutate({ ruleId: editingRule.id, bp })
        }}
      />
    </div>
  )
}
