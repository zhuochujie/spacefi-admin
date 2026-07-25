import { useMutation } from '@tanstack/react-query'
import { updateMaintenance } from '../api'
import { useMaintenanceQuery } from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'

export function MaintenancePage() {
  const { token } = useAdminOutlet()
  const maintenanceQuery = useMaintenanceQuery(token, Boolean(token))
  const maintenance = maintenanceQuery.data
  const updateMaintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => updateMaintenance(token, { enabled }),
    onSuccess: async () => {
      await maintenanceQuery.refetch()
    },
  })

  const busy = maintenanceQuery.isFetching || updateMaintenanceMutation.isPending
  const enabled = maintenance?.enabled ?? false

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">System Maintenance</p>
        <h1>系统维护</h1>
      </header>

      <section className="panel">
        <div className="panel-head">
          <h2>维护开关</h2>
          <span>{busy ? '处理中' : enabled ? '维护中' : '正常'}</span>
        </div>
        <div className="summary-row">
          <div className="summary-card">
            <span>当前状态</span>
            <strong>{enabled ? '维护中' : '正常'}</strong>
          </div>
        </div>
        <p className="muted">
          开启后将禁止用户购买/复投矿机、提取免费矿机奖励、SPACE提现和USDT提现；市场操作和链上同步接口不受影响。
        </p>
        <div className="modal-actions">
          <button
            type="button"
            className="primary"
            disabled={busy || enabled}
            onClick={() => updateMaintenanceMutation.mutate(true)}
          >
            开启维护
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy || !enabled}
            onClick={() => updateMaintenanceMutation.mutate(false)}
          >
            关闭维护
          </button>
        </div>
        {maintenanceQuery.error && <p className="status error">{maintenanceQuery.error.message}</p>}
        {updateMaintenanceMutation.error && (
          <p className="status error">{updateMaintenanceMutation.error.message}</p>
        )}
      </section>
    </div>
  )
}
