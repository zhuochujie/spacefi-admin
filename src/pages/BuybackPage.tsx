import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState, type FormEvent } from 'react'
import { parseUnits } from 'viem'
import copy from 'copy-to-clipboard'
import { useNavigate } from 'react-router'
import {
  addBuybackPoolUsdt,
  getBuybackAdminOverview,
  getBuybackSignatures,
  getBuybackTrades,
} from '../api'
import { LoadingOverlay } from '../components/common/LoadingOverlay'
import { Pagination } from '../components/common/Pagination'
import { useAdminOutlet } from '../hooks/useAdminOutlet'
import { formatAmount, formatTime, shortAddress } from '../lib/format'

const pageSize = 10

export default function BuybackPage() {
  const { token, profile } = useAdminOutlet()
  const navigate = useNavigate()
  const [tradePage, setTradePage] = useState(1)
  const [signaturePage, setSignaturePage] = useState(1)
  const [poolUsdtAmount, setPoolUsdtAmount] = useState('')
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [toastMessage, setToastMessage] = useState('')
  const enabled = profile.username === 'admin'

  const overviewQuery = useQuery({
    queryKey: ['admin', 'buyback', 'overview'],
    queryFn: () => getBuybackAdminOverview(token),
    enabled,
  })
  const tradesQuery = useQuery({
    queryKey: ['admin', 'buyback', 'trades', tradePage],
    queryFn: () => getBuybackTrades(token, tradePage, pageSize),
    enabled,
  })
  const signaturesQuery = useQuery({
    queryKey: ['admin', 'buyback', 'signatures', signaturePage],
    queryFn: () => getBuybackSignatures(token, signaturePage, pageSize),
    enabled,
  })

  const addPoolUsdtMutation = useMutation({
    mutationFn: (amount: string) => addBuybackPoolUsdt(token, amount),
    onSuccess: async () => {
      setPoolUsdtAmount('')
      setSuccessMessage('回购池 USDT 额度增加成功。')
      await overviewQuery.refetch()
    },
  })

  useEffect(() => {
    if (!toastMessage) return
    const timer = window.setTimeout(() => setToastMessage(''), 1800)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  if (!enabled) {
    return <section className="panel"><p className="status error">当前账号没有回购管理权限。</p></section>
  }

  const overview = overviewQuery.data
  const queryError = overviewQuery.error || tradesQuery.error || signaturesQuery.error
  const tradeTotalPages = Math.max(1, Math.ceil((tradesQuery.data?.total ?? 0) / pageSize))
  const signatureTotalPages = Math.max(1, Math.ceil((signaturesQuery.data?.total ?? 0) / pageSize))

  function submitPoolUsdt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLocalError('')
    setSuccessMessage('')
    try {
      const amount = parseUnits(poolUsdtAmount.trim(), 18)
      if (amount <= 0n) throw new Error()
      addPoolUsdtMutation.mutate(amount.toString())
    } catch {
      setLocalError('请输入有效的 USDT 数量。')
    }
  }

  async function copyValue(value: string) {
    setToastMessage(await copy(value, { fallbackToPrompt: true }) ? '已复制' : '复制失败')
  }

  return (
    <div className="page-stack">
      {toastMessage && <div className="copy-toast" role="status">{toastMessage}</div>}
      <header className="page-titlebar">
        <div className="page-header">
          <p className="eyebrow">Buyback Management</p>
          <h1>回购管理</h1>
        </div>
        <div className="button-row">
          <button type="button" className="secondary" onClick={() => navigate('/configs')}>配置管理</button>
          <button
            type="button"
            className="secondary"
            disabled={overviewQuery.isFetching || tradesQuery.isFetching || signaturesQuery.isFetching}
            onClick={() => void Promise.all([overviewQuery.refetch(), tradesQuery.refetch(), signaturesQuery.refetch()])}
          >
            刷新数据
          </button>
        </div>
      </header>
      {queryError && <p className="status error">{queryError.message}</p>}

      <div className={overviewQuery.isFetching ? 'loading-scope is-loading' : 'loading-scope'}>
        <LoadingOverlay loading={overviewQuery.isFetching} />
        <section className="summary-row">
          <div className="summary-card overview-card"><span>回购状态</span><strong>{overview?.enabled ? '已开启' : '已关闭'}</strong><small>业务日期：{overview?.businessDate || '-'}</small></div>
          <div className="summary-card overview-card"><span>回购池 SPACE</span><strong>{formatAmount(overview?.availableSpace, { display: true })}</strong><small>今日用户卖出：{formatAmount(overview?.dailySellSpace, { display: true })}</small></div>
          <div className="summary-card overview-card"><span>回购池 USDT</span><strong>{formatAmount(overview?.availableUsdt, { display: true })}</strong><small>今日做市商买入：{formatAmount(overview?.dailyMakerBuySpace, { display: true })} SPACE</small></div>
          <div className="summary-card overview-card"><span>待处理签名</span><strong>{overview?.pendingSignatureCount ?? 0}</strong><small>累计成交：{overview?.tradeCount ?? 0} 笔</small></div>
        </section>
      </div>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-head"><h2>价格与费率</h2><span>更新时间：{formatTime(overview?.updatedAt)}</span></div>
          <dl className="buyback-detail-grid">
            <div><dt>用户卖出价格</dt><dd>{formatAmount(overview?.sellPrice)} USDT</dd></div>
            <div><dt>卖出手续费</dt><dd>{Number(overview?.sellFeeBp ?? 0) / 100}%</dd></div>
            <div><dt>做市商买入价格</dt><dd>{formatAmount(overview?.makerPrice)} USDT</dd></div>
            <div><dt>手续费补贴</dt><dd>{overview?.makerFeeSubsidyEnabled ? `${Number(overview.makerFeeSubsidyBp) / 100}%` : '已关闭'}</dd></div>
            <div><dt>1/6 接收账户</dt><dd>{overview?.receiverAddress ? <button type="button" className="copy-cell-button" title={overview.receiverAddress} onClick={() => copyValue(overview.receiverAddress)}>{shortAddress(overview.receiverAddress)}</button> : '-'}</dd></div>
            <div><dt>接收账户回购 USDT</dt><dd>{formatAmount(overview?.receiverUsdtBalance, { display: true })}</dd></div>
          </dl>
        </div>

        <div className="panel">
          <div className="panel-head"><h2>增加回购池 USDT</h2><span>在当前账面额度上增加</span></div>
          <p className="muted">当前额度：{formatAmount(overview?.availableUsdt, { display: true })} USDT</p>
          <p className="status warning">设置的是回购池账面可用额度，不会转入链上 USDT。请先确认 Mining 合约拥有足够 USDT，否则用户提现可能失败。</p>
          <form className="field buyback-fund-form" onSubmit={submitPoolUsdt}>
            <label htmlFor="buyback-pool-usdt-amount">本次增加数量</label>
            <div className="input-with-action">
              <input id="buyback-pool-usdt-amount" value={poolUsdtAmount} inputMode="decimal" placeholder="请输入要增加的 USDT 数量" onChange={(event) => setPoolUsdtAmount(event.target.value)} />
              <button type="submit" className="primary" disabled={addPoolUsdtMutation.isPending}> {addPoolUsdtMutation.isPending ? '增加中...' : '确认增加'} </button>
            </div>
          </form>
          {(localError || addPoolUsdtMutation.error) && <p className="status error">{localError || addPoolUsdtMutation.error?.message}</p>}
          {successMessage && <p className="status success">{successMessage}</p>}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><h2>回购成交记录</h2><span>共 {tradesQuery.data?.total ?? 0} 笔</span></div>
        <div className={tradesQuery.isFetching ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={tradesQuery.isFetching} />
          <table>
            <thead><tr><th>ID</th><th>用户</th><th>类型</th><th>购买/卖出 SPACE</th><th>补贴 SPACE</th><th>成交 USDT</th><th>手续费</th><th>1/6 分成</th><th>用户到账/池入账</th><th>平均价格</th><th>时间</th></tr></thead>
            <tbody>
              {(tradesQuery.data?.list.length ?? 0) === 0 && !tradesQuery.isFetching ? <tr><td colSpan={11} className="empty-state">暂无回购成交记录。</td></tr> : null}
              {(tradesQuery.data?.list ?? []).map((trade) => <tr key={trade.id}>
                <td>{trade.id}</td><td><button type="button" className="copy-cell-button" title={trade.address} onClick={() => copyValue(trade.address)}>{shortAddress(trade.address)}</button></td><td>{trade.type === 'user_sell' ? '用户卖出' : '做市商买入'}</td>
                <td>{formatAmount(trade.spaceAmount, { display: true })}</td><td>{formatAmount(trade.subsidyAmount, { display: true })}</td><td>{formatAmount(trade.usdtAmount, { display: true })}</td>
                <td>{formatAmount(trade.feeAmount, { display: true })}</td><td>{formatAmount(trade.receiverAmount, { display: true })}</td><td>{formatAmount(trade.settledUsdtAmount, { display: true })}</td><td>{formatAmount(trade.price, { display: true })}</td><td>{formatTime(trade.createdAt)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <Pagination page={tradePage} totalPages={tradeTotalPages} busy={tradesQuery.isFetching} extraInfo={`共 ${tradesQuery.data?.total ?? 0} 条`} onPageChange={setTradePage} />
      </section>

      <section className="panel">
        <div className="panel-head"><h2>充值与提现签名</h2><span>共 {signaturesQuery.data?.total ?? 0} 条</span></div>
        <div className={signaturesQuery.isFetching ? 'table-wrap loading-scope is-loading' : 'table-wrap loading-scope'}>
          <LoadingOverlay loading={signaturesQuery.isFetching} />
          <table>
            <thead><tr><th>ID</th><th>用户</th><th>业务</th><th>币种</th><th>数量</th><th>状态</th><th>Nonce</th><th>创建时间</th><th>截止时间</th></tr></thead>
            <tbody>
              {(signaturesQuery.data?.list.length ?? 0) === 0 && !signaturesQuery.isFetching ? <tr><td colSpan={9} className="empty-state">暂无充值或提现签名。</td></tr> : null}
              {(signaturesQuery.data?.list ?? []).map((item) => <tr key={item.id}>
                <td>{item.id}</td><td><button type="button" className="copy-cell-button" title={item.account} onClick={() => copyValue(item.account)}>{shortAddress(item.account)}</button></td><td>{item.kind === 'deposit' ? '充值' : '提现'}</td><td>{item.token}</td>
                <td>{formatAmount(item.amount, { display: true })}</td><td>{item.status === 'pending' ? '待确认' : item.status === 'used' ? '已完成' : '已失效'}</td>
                <td><button type="button" className="copy-cell-button" title={item.nonce} onClick={() => copyValue(item.nonce)}>{item.nonce}</button></td><td>{formatTime(item.createdAt)}</td><td>{formatTime(item.deadline)}</td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <Pagination page={signaturePage} totalPages={signatureTotalPages} busy={signaturesQuery.isFetching} extraInfo={`共 ${signaturesQuery.data?.total ?? 0} 条`} onPageChange={setSignaturePage} />
      </section>
    </div>
  )
}
