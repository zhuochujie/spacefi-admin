import type { AdminConfigItem } from '../../api'
import { formatDividendBp } from '../../lib/dividends'
import { formatTokenAmount } from '../../lib/format'

type ConfigTableProps = {
  configs: AdminConfigItem[]
  busy: boolean
  onEdit: (config: AdminConfigItem) => void
}

export function ConfigTable({ configs, busy, onEdit }: ConfigTableProps) {
  function formatSecondsAsDays(value: string) {
    const days = Number(value) / 86400
    return `${days.toFixed(2).replace(/\.?0+$/, '')}天`
  }

  function formatConfigValue(config: AdminConfigItem) {
    if (config.key.endsWith('BP') && /^\d+$/.test(config.value)) {
      return `${formatDividendBp(Number(config.value))} (${config.value})`
    }

    if (config.key.endsWith('SECONDS') && /^\d+$/.test(config.value)) {
      return `${formatSecondsAsDays(config.value)} (${config.value})`
    }

    if (!config.key.endsWith('WEI')) return config.value

    const readableValue = formatTokenAmount(config.value)
    return `${readableValue} (${config.value})`
  }

  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>配置列表</h2>
        <span>{busy ? '刷新中' : `${configs.length} 条`}</span>
      </div>

      {configs.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无配置数据。</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>配置值</th>
                <th>说明</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.key}>
                  <td>{config.key}</td>
                  <td>{formatConfigValue(config)}</td>
                  <td>{config.desc}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary small" onClick={() => onEdit(config)}>
                        修改
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
