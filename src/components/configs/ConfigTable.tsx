import type { AdminConfigItem } from '../../api'

type ConfigTableProps = {
  configs: AdminConfigItem[]
  busy: boolean
  onEdit: (config: AdminConfigItem) => void
}

export function ConfigTable({ configs, busy, onEdit }: ConfigTableProps) {
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
                  <td>{config.value}</td>
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
