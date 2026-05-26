import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import {
  createAdminMiner,
  updateAdminMiner,
  type AdminMiner,
  type CreateMinerPayload,
  type UpdateMinerPayload,
} from '../api'
import { MinerModal } from '../components/miners/MinerModal'
import { MinerTable } from '../components/miners/MinerTable'
import { useAdminMinersQuery } from '../hooks/useAdminData'
import { useAdminOutlet } from '../hooks/useAdminOutlet'

type ModalState =
  | {
      mode: 'create'
      miner: null
    }
  | {
      mode: 'edit'
      miner: AdminMiner
    }
  | null

export function MinersPage() {
  const { token } = useAdminOutlet()
  const [modalState, setModalState] = useState<ModalState>(null)

  const minersQuery = useAdminMinersQuery(token, Boolean(token))
  const miners = minersQuery.data ?? []
  const purchasableCount = miners.filter((miner) => miner.isPurchasable).length

  const saveMinerMutation = useMutation({
    mutationFn: async (payload: CreateMinerPayload | UpdateMinerPayload) => {
      if (modalState?.mode === 'edit') {
        return updateAdminMiner(token, modalState.miner.id, payload as UpdateMinerPayload)
      }

      return createAdminMiner(token, payload as CreateMinerPayload)
    },
    onSuccess: async () => {
      await minersQuery.refetch()
      setModalState(null)
    },
  })

  return (
    <div className="page-stack">
      <header className="page-titlebar">
        <div className="page-header">
          <p className="eyebrow">Miner Management</p>
          <h1>矿机管理</h1>
        </div>
        <button
          type="button"
          className="primary"
          onClick={() => {
            saveMinerMutation.reset()
            setModalState({ mode: 'create', miner: null })
          }}
        >
          新增矿机
        </button>
      </header>

      <section className="summary-row">
        <div className="summary-card">
          <span>矿机类型</span>
          <strong>{miners.length}</strong>
        </div>
        <div className="summary-card">
          <span>可购买</span>
          <strong>{purchasableCount}</strong>
        </div>
      </section>

      {minersQuery.error ? <p className="status error">{minersQuery.error.message}</p> : null}

      <MinerTable
        miners={miners}
        busy={minersQuery.isFetching}
        onEdit={(miner) => {
          saveMinerMutation.reset()
          setModalState({ mode: 'edit', miner })
        }}
      />

      <MinerModal
        key={modalState?.mode === 'edit' ? modalState.miner.id : modalState?.mode ?? 'closed'}
        open={Boolean(modalState)}
        miner={modalState?.miner ?? null}
        busy={saveMinerMutation.isPending}
        error={saveMinerMutation.error?.message}
        onClose={() => {
          setModalState(null)
          saveMinerMutation.reset()
        }}
        onSubmit={(payload) => saveMinerMutation.mutate(payload)}
      />
    </div>
  )
}
