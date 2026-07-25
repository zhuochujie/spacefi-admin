import { notifyAuthExpired } from './lib/session'
import { formatApiMessage } from './lib/apiError'

const ADMIN_API_PREFIX = '/admin'

export type AdminProfile = {
  id: number
  username: string
}

export type UserRecord = {
  id: number
  address: string
  refCode: string
  vipLevel: number
  manualVipLevel: number
  balance: string
  usdtBalance: string
  nodeLevel: number
  createdAt: number
  teamCount?: number
  teamPerformance?: string
}

export type UserListResponse = {
  list: UserRecord[]
  total: number
  page: number
  pageSize: number
}

export type UpdateUserLevelsPayload = {
  manualVipLevel?: number
  nodeLevel?: number
}

export type AccelerateMinerPayload = {
  amount: string
}

export type SystemRewardPayload = {
  token: 'SPACE' | 'USDT'
  amount: string
}

export type BalanceLogResponse = {
  list: BalanceLogItem[]
  total: number
  page: number
  pageSize: number
}

export type MinerResponse = {
  list: MinerItem[]
  minerReward: string
  teamReward: string
}

export type AdminMiner = {
  id: string
  name: string
  price: string
  desc?: string
  expectedReward: string
  isPurchasable: boolean
}

export type CreateMinerPayload = {
  id: string
  name: string
  price: string
  expectedReward: string
  desc?: string
  isPurchasable?: boolean
}

export type UpdateMinerPayload = Partial<Omit<CreateMinerPayload, 'id'>>

export type DividendRuleCategory = 'vip' | 'node'
export type DividendRuleToken = 'SPACE' | 'USDT'

export type DividendRule = {
  id: number
  category: DividendRuleCategory
  token: DividendRuleToken
  level: number
  bp: number
  createdAt: number
  updatedAt: number
}

export type DividendRuleGroup = {
  category: DividendRuleCategory
  token: DividendRuleToken
  totalBp: number
  rules: DividendRule[]
}

export type DividendRuleUpdateItem = {
  level: number
  bp: number
}

export type DividendRuleGroupPayload = {
  rules: DividendRuleUpdateItem[]
}

export type DividendLogItem = BalanceLogItem & {
  account: UserRecord
}

export type DividendLogResponse = {
  list: DividendLogItem[]
  total: number
  page: number
  pageSize: number
}

export type AdminConfigItem = {
  key: string
  value: string
  desc: string
}

export type MaintenanceState = {
  enabled: boolean
}

export type NoticeItem = {
  id: number
  title: string
  content: string
  englishTitle?: string
  englishContent?: string
  thaiTitle?: string
  thaiContent?: string
  koreanTitle?: string
  koreanContent?: string
  createTime: number
}

export type NoticeListResponse = {
  list: NoticeItem[]
  total: number
  page: number
  pageSize: number
}

export type NoticePayload = {
  title?: string
  content?: string
  englishTitle?: string
  englishContent?: string
  thaiTitle?: string
  thaiContent?: string
  koreanTitle?: string
  koreanContent?: string
}

export type TodayMinerPurchaseSpaceStat = {
  amount: string
  startAt: number
  endAt: number
}

export type CountStat = {
  count: number
}

export type MarketOpenSpaceStat = {
  buySpaceAmount: string
  sellSpaceAmount: string
}

export type MarketOrderSide = 'buy' | 'sell'
export type MarketOrderStatus = 'open' | 'filled' | 'cancelled'
export type MarketTradeAction = 'active_buy' | 'passive_buy' | 'active_sell' | 'passive_sell'

export type MarketOrder = {
  id: string
  maker: string
  side: MarketOrderSide
  spaceAmount: string
  remainingSpaceAmount: string
  price: string
  status: MarketOrderStatus
  visible: boolean
  transactionHash: string
  logIndex: number
  createdAt: number
}

export type MarketTakerTrade = {
  id: string
  orderId: string
  maker: string
  taker: string
  side: MarketOrderSide
  spaceAmount: string
  price: string
  usdtAmount: string
  nodeFee: string
  markerFee: string
  transactionHash: string
  logIndex: number
  filledAt: number
}

export type AccountMarketTrade = MarketTakerTrade & {
  action: MarketTradeAction
  counterparty: string
}

export type MarketOrderResponse = {
  items: MarketOrder[]
  total: number
  page: number
  pageSize: number
}

export type AccountMarketTradeResponse = {
  items: AccountMarketTrade[]
  total: number
  page: number
  pageSize: number
}

export type AccountMarketTradeStats = {
  buySpaceAmount: string
  sellSpaceAmount: string
}

export type MarketTradeResponse = {
  items: MarketTakerTrade[]
  total: number
  page: number
  pageSize: number
}

export type MarketOrderDetailResponse = {
  order: MarketOrder
  trades: MarketTakerTrade[]
}

export type TodayMarketTradesStat = {
  tradeCount: number
  totalSpaceAmount: string
  totalUsdtAmount: string
  from: number
  to: number
}

export type EstimatedMinerRewardGroup = {
  minerCount: number
  accountCount: number
  rewardTotal: string
}

export type EstimatedMinerRewardsStat = {
  targetTimestamp: number
  accountMiner: EstimatedMinerRewardGroup
  freeMiner: EstimatedMinerRewardGroup
  totalReward: string
}

export type AdminStats = {
  todayMinerPurchaseSpace: TodayMinerPurchaseSpaceStat
  activeUsers: CountStat
  miners: CountStat
  estimatedMinerRewards: EstimatedMinerRewardsStat
  marketOpenSpace: MarketOpenSpaceStat
  todayMarketTrades: TodayMarketTradesStat
}

export type BalanceLogItem = {
  id: number
  accountId: number
  type: string
  token: string
  amount: string
  balanceBefore: string
  balanceAfter: string
  createdAt: number
}

export type MinerItem = {
  id: number
  minerId: string
  accountId: number
  expectedReward: string
  producedReward: string
  cycle: number
  cycleEndAt: number
  lastRewardAt: number
  rewardPerSecond: string
  createdAt: number
  miner: {
    id: string
    name: string
    price: string
    desc: string
    expectedReward: string
    isPurchasable: boolean
  }
}

type ApiSuccess<T> = {
  success?: boolean
  code?: number
  data?: T
  message?: string | string[]
}

type RequestOptions = {
  token?: string
  public?: boolean
  method?: string
  body?: unknown
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text()
  let payload: ApiSuccess<T> = {}
  const fallbackMessage = `请求失败: ${response.status}`

  if (text) {
    try {
      payload = JSON.parse(text) as ApiSuccess<T>
    } catch {
      if (response.status === 401) {
        notifyAuthExpired()
      }

      throw new Error(text || fallbackMessage)
    }
  }

  const rawMessage = Array.isArray(payload.message) ? payload.message[0] : payload.message
  if ((response.status === 401 || payload.code === 401) && (!rawMessage || rawMessage === 'UNAUTHORIZED')) {
    notifyAuthExpired()
  }

  if (!response.ok || payload.success === false) {
    throw new Error(formatApiMessage(payload.message, fallbackMessage))
  }

  return (payload.data ?? payload) as T
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.token && !options.public ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  return parseResponse<T>(response)
}

export async function marketApiRequest<T>(path: string): Promise<T> {
  const response = await fetch(`/market-api${path}`)
  return parseResponse<T>(response)
}

export async function loginAdmin(username: string, password: string) {
  return apiRequest<{ access_token: string }>('/admin-auth/login', {
    public: true,
    method: 'POST',
    body: { username, password },
  })
}

export async function changeAdminPassword(token: string, currentPassword: string, newPassword: string) {
  return apiRequest<{ success: boolean }>('/admin-auth/password', {
    token,
    method: 'PATCH',
    body: { currentPassword, newPassword },
  })
}

export async function getAdminProfile(token: string) {
  return apiRequest<AdminProfile>(`${ADMIN_API_PREFIX}/profile`, { token })
}

export async function getTodayMinerPurchaseSpaceStat(token: string) {
  return apiRequest<TodayMinerPurchaseSpaceStat>(`${ADMIN_API_PREFIX}/stats/today-miner-purchase-space`, { token })
}

export async function getActiveUsersStat(token: string) {
  return apiRequest<CountStat>(`${ADMIN_API_PREFIX}/stats/active-users`, { token })
}

export async function getMinersStat(token: string) {
  return apiRequest<CountStat>(`${ADMIN_API_PREFIX}/stats/miners`, { token })
}

export async function getMarketOpenSpaceStat(token: string) {
  void token
  return marketApiRequest<MarketOpenSpaceStat>('/stats/market-open-space')
}

export async function getTodayMarketTradesStat(token: string) {
  void token
  return marketApiRequest<TodayMarketTradesStat>('/stats/today-market-trades')
}

export async function getRecentMarketTrades(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  return marketApiRequest<MarketTradeResponse>(`/trades/recent?${params.toString()}`)
}

export async function getRecentMarketOrders(page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  return marketApiRequest<MarketOrderResponse>(`/orders/recent?${params.toString()}`)
}

export async function getMarketOrderDetail(orderId: string) {
  return marketApiRequest<MarketOrderDetailResponse>(`/orders/${encodeURIComponent(orderId)}/detail`)
}

export async function getEstimatedMinerRewardsStat(token: string) {
  return apiRequest<EstimatedMinerRewardsStat>(`${ADMIN_API_PREFIX}/stats/estimated-miner-rewards`, { token })
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const [
    todayMinerPurchaseSpace,
    activeUsers,
    miners,
    estimatedMinerRewards,
    marketOpenSpace,
    todayMarketTrades,
  ] = await Promise.all([
    getTodayMinerPurchaseSpaceStat(token),
    getActiveUsersStat(token),
    getMinersStat(token),
    getEstimatedMinerRewardsStat(token),
    getMarketOpenSpaceStat(token),
    getTodayMarketTradesStat(token),
  ])

  return {
    todayMinerPurchaseSpace,
    activeUsers,
    miners,
    estimatedMinerRewards,
    marketOpenSpace,
    todayMarketTrades,
  }
}

export async function getAdminUsers(
  token: string,
  searchParams: URLSearchParams,
) {
  return apiRequest<UserListResponse>(`${ADMIN_API_PREFIX}/users?${searchParams.toString()}`, { token })
}

export async function getBalanceLogs(
  token: string,
  accountId: number,
  searchParams: URLSearchParams,
) {
  return apiRequest<BalanceLogResponse>(
    `${ADMIN_API_PREFIX}/users/${accountId}/balance-logs?${searchParams.toString()}`,
    { token },
  )
}

export async function getUserMiners(token: string, accountId: number) {
  return apiRequest<MinerResponse>(`${ADMIN_API_PREFIX}/users/${accountId}/miners`, { token })
}

export async function addUserSystemReward(
  token: string,
  accountId: number,
  payload: SystemRewardPayload,
) {
  return apiRequest<Pick<UserRecord, 'id' | 'address' | 'balance' | 'usdtBalance'>>(
    `${ADMIN_API_PREFIX}/users/${accountId}/system-reward`,
    {
      token,
      method: 'POST',
      body: payload,
    },
  )
}

export async function accelerateUserMiner(
  token: string,
  accountId: number,
  accountMinerId: number,
  payload: AccelerateMinerPayload,
) {
  return apiRequest<MinerResponse>(
    `${ADMIN_API_PREFIX}/users/${accountId}/miners/${accountMinerId}/accelerate`,
    {
      token,
      method: 'POST',
      body: payload,
    },
  )
}

export async function getUserMarketOrders(address: string, searchParams: URLSearchParams) {
  searchParams.set('maker', address)
  return marketApiRequest<MarketOrderResponse>(`/orders/mine?${searchParams.toString()}`)
}

export async function getUserAccountMarketTrades(address: string, searchParams: URLSearchParams) {
  searchParams.set('account', address)
  return marketApiRequest<AccountMarketTradeResponse>(`/trades/account?${searchParams.toString()}`)
}

export async function getUserAccountMarketTradeStats(address: string) {
  const params = new URLSearchParams({ account: address })
  return marketApiRequest<AccountMarketTradeStats>(`/trades/account/stats?${params.toString()}`)
}

export async function getAdminMiners(token: string) {
  return apiRequest<AdminMiner[]>(`${ADMIN_API_PREFIX}/miners`, { token })
}

export async function createAdminMiner(token: string, payload: CreateMinerPayload) {
  return apiRequest<AdminMiner>(`${ADMIN_API_PREFIX}/miners`, {
    token,
    method: 'POST',
    body: payload,
  })
}

export async function updateAdminMiner(token: string, minerId: string, payload: UpdateMinerPayload) {
  return apiRequest<AdminMiner>(`${ADMIN_API_PREFIX}/miners/${encodeURIComponent(minerId)}`, {
    token,
    method: 'PATCH',
    body: payload,
  })
}

export async function updateUserLevels(
  token: string,
  accountId: number,
  payload: UpdateUserLevelsPayload,
) {
  return apiRequest<UserRecord>(`${ADMIN_API_PREFIX}/users/${accountId}/levels`, {
    token,
    method: 'PATCH',
    body: payload,
  })
}

export async function getDividendRules(token: string) {
  return apiRequest<DividendRuleGroup[]>(`${ADMIN_API_PREFIX}/dividend-rules`, { token })
}

export async function updateDividendRuleGroup(
  token: string,
  category: DividendRuleCategory,
  dividendToken: DividendRuleToken,
  payload: DividendRuleGroupPayload,
) {
  return apiRequest<DividendRuleGroup>(`${ADMIN_API_PREFIX}/dividend-rules/${category}/${dividendToken}`, {
    token,
    method: 'PATCH',
    body: payload,
  })
}

export async function getDividendLogs(token: string, searchParams: URLSearchParams) {
  return apiRequest<DividendLogResponse>(`${ADMIN_API_PREFIX}/dividend-logs?${searchParams.toString()}`, { token })
}

export async function getAdminConfigs(token: string) {
  return apiRequest<AdminConfigItem[]>(`${ADMIN_API_PREFIX}/configs`, { token })
}

export async function getMaintenance(token: string) {
  return apiRequest<MaintenanceState>(`${ADMIN_API_PREFIX}/maintenance`, { token })
}

export async function updateMaintenance(token: string, payload: MaintenanceState) {
  return apiRequest<MaintenanceState>(`${ADMIN_API_PREFIX}/maintenance`, {
    token,
    method: 'PUT',
    body: payload,
  })
}

export async function updateAdminConfig(token: string, key: string, value: string) {
  return apiRequest<AdminConfigItem>(`${ADMIN_API_PREFIX}/configs/${encodeURIComponent(key)}`, {
    token,
    method: 'PATCH',
    body: { value },
  })
}

export async function getAdminNotices(token: string, searchParams: URLSearchParams) {
  return apiRequest<NoticeListResponse>(`${ADMIN_API_PREFIX}/notices?${searchParams.toString()}`, { token })
}

export async function createAdminNotice(token: string, payload: Required<Pick<NoticePayload, 'title' | 'content'>> & NoticePayload) {
  return apiRequest<NoticeItem>(`${ADMIN_API_PREFIX}/notices`, {
    token,
    method: 'POST',
    body: payload,
  })
}

export async function updateAdminNotice(token: string, noticeId: number, payload: NoticePayload) {
  return apiRequest<NoticeItem>(`${ADMIN_API_PREFIX}/notices/${noticeId}`, {
    token,
    method: 'PATCH',
    body: payload,
  })
}

export async function deleteAdminNotice(token: string, noticeId: number) {
  return apiRequest<{ id: number }>(`${ADMIN_API_PREFIX}/notices/${noticeId}`, {
    token,
    method: 'DELETE',
  })
}
