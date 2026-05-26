import type { DividendRule } from '../../api'
import { formatDividendBp, formatDividendCategory } from '../../lib/dividends'
import { formatTime } from '../../lib/format'

type DividendRuleTableProps = {
  rules: DividendRule[]
  busy: boolean
  onEdit: (rule: DividendRule) => void
}

export function DividendRuleTable({ rules, busy, onEdit }: DividendRuleTableProps) {
  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>分红规则</h2>
        <span>{busy ? '刷新中' : `${rules.length} 条`}</span>
      </div>

      {rules.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无分红规则。</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>规则类型</th>
                <th>Token</th>
                <th>等级</th>
                <th>比例 BP</th>
                <th>比例</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.id}</td>
                  <td>{formatDividendCategory(rule.category)}</td>
                  <td>{rule.token}</td>
                  <td>{rule.level}</td>
                  <td>{rule.bp}</td>
                  <td>{formatDividendBp(rule.bp)}</td>
                  <td>{formatTime(rule.updatedAt || rule.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary small" onClick={() => onEdit(rule)}>
                        编辑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
