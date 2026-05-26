import type { AdminMiner } from '../../api'
import { formatTokenAmount } from '../../lib/format'

type MinerTableProps = {
  miners: AdminMiner[]
  busy: boolean
  onEdit: (miner: AdminMiner) => void
}

export function MinerTable({ miners, busy, onEdit }: MinerTableProps) {
  return (
    <section className="panel list-panel">
      <div className="panel-head">
        <h2>矿机列表</h2>
        <span>{busy ? '刷新中' : `${miners.length} 台`}</span>
      </div>

      {miners.length === 0 && !busy ? (
        <div className="empty-state inline-empty">暂无矿机数据。</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>价格</th>
                <th>预期奖励</th>
                <th>剩余数量</th>
                <th>购买状态</th>
                <th>描述</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {miners.map((miner) => (
                <tr key={miner.id}>
                  <td>{miner.id}</td>
                  <td>{miner.name}</td>
                  <td>{formatTokenAmount(miner.price)}</td>
                  <td>{formatTokenAmount(miner.expectedReward)}</td>
                  <td>{miner.remainingQuantity}</td>
                  <td>
                    <span className={miner.isPurchasable ? 'status success' : 'status'}>
                      {miner.isPurchasable ? '可购买' : '已下架'}
                    </span>
                  </td>
                  <td className="cell-clip">{miner.desc || '-'}</td>
                  <td>
                    <div className="table-actions">
                      <button type="button" className="secondary small" onClick={() => onEdit(miner)}>
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
