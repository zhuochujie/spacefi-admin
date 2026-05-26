import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { updateAdminConfig, type AdminConfigItem } from '../api'
import { ConfigModal } from '../components/configs/ConfigModal'
import { ConfigTable } from '../components/configs/ConfigTable'
import { useAdminConfigsQuery } from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'

export function ConfigsPage() {
  const { token } = useAdminOutlet()
  const [editingConfig, setEditingConfig] = useState<AdminConfigItem | null>(null)

  const configsQuery = useAdminConfigsQuery(token, Boolean(token))
  const configs = configsQuery.data ?? []

  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return updateAdminConfig(token, key, value)
    },
    onSuccess: async () => {
      await configsQuery.refetch()
      setEditingConfig(null)
    },
  })

  return (
    <div className="page-stack">
      <header className="page-header">
        <p className="eyebrow">Config Management</p>
        <h1>配置管理</h1>
      </header>

      <section className="summary-row">
        <div className="summary-card">
          <span>配置总数</span>
          <strong>{configs.length}</strong>
        </div>
      </section>

      <ConfigTable
        configs={configs}
        busy={configsQuery.isFetching}
        onEdit={(config) => {
          updateConfigMutation.reset()
          setEditingConfig(config)
        }}
      />

      <ConfigModal
        key={editingConfig?.key ?? 'closed'}
        open={Boolean(editingConfig)}
        config={editingConfig}
        busy={updateConfigMutation.isPending}
        error={updateConfigMutation.error?.message}
        onClose={() => {
          setEditingConfig(null)
          updateConfigMutation.reset()
        }}
        onSubmit={(value) => {
          if (!editingConfig) return
          updateConfigMutation.mutate({ key: editingConfig.key, value })
        }}
      />
    </div>
  )
}
