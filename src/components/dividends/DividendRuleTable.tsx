import type { DividendRuleGroup } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { formatDividendBp, formatDividendCategory } from '../../lib/dividends'
import { formatTime } from '../../lib/format'

type DividendRuleTableProps = {
  groups: DividendRuleGroup[]
  busy: boolean
  onEdit: (group: DividendRuleGroup) => void
}

export function DividendRuleTable({ groups, busy, onEdit }: DividendRuleTableProps) {
  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>分红规则</h2>
        <span>{busy ? '刷新中' : `${groups.length} 组`}</span>
      </div>

      {groups.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无分红规则。</div>
      ) : (
        <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={busy} />
          <table>
            <thead>
              <tr>
                <th>规则类型</th>
                <th>Token</th>
                <th>总 BP</th>
                <th>总比例</th>
                <th>等级规则</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => {
                const latestUpdatedAt = Math.max(...group.rules.map((rule) => rule.updatedAt || rule.createdAt))

                return (
                <tr key={`${group.category}-${group.token}`}>
                  <td>{formatDividendCategory(group.category)}</td>
                  <td>{group.token}</td>
                  <td>{group.totalBp}</td>
                  <td>{formatDividendBp(group.totalBp)}</td>
                  <td className="cell-clip">
                    {group.rules
                      .slice()
                      .sort((left, right) => left.level - right.level)
                      .map((rule) => `L${rule.level}: ${formatDividendBp(rule.bp)}`)
                      .join(' / ')}
                  </td>
                  <td>{formatTime(Number.isFinite(latestUpdatedAt) ? latestUpdatedAt : undefined)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary small" onClick={() => onEdit(group)}>
                        编辑分组
                      </button>
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
