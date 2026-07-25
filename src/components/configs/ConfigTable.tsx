import type { AdminConfigItem } from '../../api'
import { LoadingOverlay } from '../common/LoadingOverlay'
import { formatDividendBp } from '../../lib/dividends'
import { formatAmount } from '../../lib/format'

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
    if (config.key === 'FREE_MINER_CAN_INVITE') {
      return config.value === '1' ? '开启 (1)' : '关闭 (0)'
    }

    if (config.key.endsWith('BP') && /^\d+$/.test(config.value)) {
      return `${formatDividendBp(Number(config.value))} (${config.value})`
    }

    if (config.key.endsWith('SECONDS') && /^\d+$/.test(config.value)) {
      return `${formatSecondsAsDays(config.value)} (${config.value})`
    }

    if (!config.key.endsWith('WEI')) return config.value

    const readableValue = formatAmount(config.value, { display: true })
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
        <div className={busy ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={busy} />
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
