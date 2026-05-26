import { notifyAuthExpired } from './lib/session'

const ADMIN_API_PREFIX = '/nzpunvnojj'

export type AdminProfile = {
  id: number
  address: string
  isAdmin: boolean
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
  isAdmin: boolean
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
  remainingQuantity: number
  isPurchasable: boolean
}

export type CreateMinerPayload = {
  id: string
  name: string
  price: string
  expectedReward: string
  remainingQuantity: number
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

export type DividendRulePayload = {
  bp?: number
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

export type NoticeItem = {
  id: number
  title: string
  content: string
  englishTitle?: string
  englishContent?: string
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

export type TodayMarketTradesStat = {
  spaceVolume: string
  tradingVolume: string
  tradeCount: string | number
  startAt: number
  endAt: number
}

export type AdminStats = {
  todayMinerPurchaseSpace: TodayMinerPurchaseSpaceStat
  activeUsers: CountStat
  miners: CountStat
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
  globalExtendedTime: number
  rewardPerSecond: string
  createdAt: number
  miner: {
    id: string
    name: string
    price: string
    desc: string
    expectedReward: string
    remainingQuantity: number
    isPurchasable: boolean
  }
}

type ApiSuccess<T> = {
  success?: boolean
  code?: number
  data?: T
  message?: string
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

  if (text) {
    try {
      payload = JSON.parse(text) as ApiSuccess<T>
    } catch {
      if (response.status === 401) {
        notifyAuthExpired()
      }

      throw new Error(text || `请求失败: ${response.status}`)
    }
  }

  if (response.status === 401 || payload.code === 401) {
    notifyAuthExpired()
    throw new Error(payload.message || `请求失败: ${response.status}`)
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `请求失败: ${response.status}`)
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

export async function loginWithSignature(address: string, signature: string) {
  return apiRequest<{ access_token: string }>('/auth/login', {
    public: true,
    method: 'POST',
    body: { address, signature },
  })
}

export async function getNonce(address: string) {
  return apiRequest<string>(`/nonce/${address}`, { public: true })
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
  return apiRequest<MarketOpenSpaceStat>(`${ADMIN_API_PREFIX}/stats/market-open-space`, { token })
}

export async function getTodayMarketTradesStat(token: string) {
  return apiRequest<TodayMarketTradesStat>(`${ADMIN_API_PREFIX}/stats/today-market-trades`, { token })
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const [todayMinerPurchaseSpace, activeUsers, miners, marketOpenSpace, todayMarketTrades] = await Promise.all([
    getTodayMinerPurchaseSpaceStat(token),
    getActiveUsersStat(token),
    getMinersStat(token),
    getMarketOpenSpaceStat(token),
    getTodayMarketTradesStat(token),
  ])

  return {
    todayMinerPurchaseSpace,
    activeUsers,
    miners,
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
  return apiRequest<DividendRule[]>(`${ADMIN_API_PREFIX}/dividend-rules`, { token })
}

export async function updateDividendRule(
  token: string,
  ruleId: number,
  payload: Required<DividendRulePayload>,
) {
  return apiRequest<DividendRule>(`${ADMIN_API_PREFIX}/dividend-rules/${ruleId}`, {
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
