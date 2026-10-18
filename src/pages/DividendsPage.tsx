import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  updateDividendRuleGroup,
  type DividendRoundSummary,
  type DividendRuleGroup,
  type DividendRuleGroupPayload,
} from '../api'
import { DividendRoundDetailModal } from '../components/dividends/DividendRoundDetailModal'
import { DividendRoundTable } from '../components/dividends/DividendRoundTable'
import { DividendRuleModal } from '../components/dividends/DividendRuleModal'
import { DividendRuleTable } from '../components/dividends/DividendRuleTable'
import { useAdminOutlet } from '../hooks/useAdminOutlet'
import { useDividendRoundDetailQuery, useDividendRoundsQuery, useDividendRulesQuery, type DividendRoundFilters } from '../hooks/useAdminData'

const defaultRoundFilters: DividendRoundFilters = {
  page: 1,
  pageSize: 10,
}

export function DividendsPage() {
  const { token } = useAdminOutlet()
  const [editingGroup, setEditingGroup] = useState<DividendRuleGroup | null>(null)
  const [roundFilters, setRoundFilters] = useState<DividendRoundFilters>(defaultRoundFilters)
  const [detailRound, setDetailRound] = useState<DividendRoundSummary | null>(null)

  const rulesQuery = useDividendRulesQuery(token, Boolean(token))
  const ruleGroups = rulesQuery.data ?? []
  const vipGroups = ruleGroups.filter((group) => group.category === 'vip')
  const nodeGroups = ruleGroups.filter((group) => group.category === 'node')
  const roundsQuery = useDividendRoundsQuery(token, roundFilters, Boolean(token))
  const roundResponse = roundsQuery.data
  const detailQuery = useDividendRoundDetailQuery(token, detailRound?.roundAt ?? null, Boolean(detailRound))

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

      <DividendRoundTable
        rounds={roundResponse?.list ?? []}
        total={roundResponse?.total ?? 0}
        page={roundFilters.page}
        pageSize={roundFilters.pageSize}
        busy={roundsQuery.isFetching}
        onPageChange={(page) => setRoundFilters((state) => ({ ...state, page }))}
        onOpenDetail={(round) => setDetailRound(round)}
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

      <DividendRoundDetailModal
        open={Boolean(detailRound)}
        round={detailRound}
        stats={detailQuery.data?.list ?? []}
        busy={detailQuery.isFetching}
        error={detailQuery.error?.message}
        onClose={() => setDetailRound(null)}
      />
    </div>
  )
}
