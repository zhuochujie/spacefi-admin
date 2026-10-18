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
  marketMakerWhitelisted: boolean
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

export type BatchAccelerateMinersPayload = {
  addresses: string[]
}

export type BatchAccelerateMinersResult = {
  inputAddressCount: number
  matchedAccountCount: number
  acceleratedAccountCount: number
  acceleratedMinerCount: number
  totalReward: string
}

export type SystemRewardPayload = {
  token: 'SPACE' | 'USDT'
  amount: string
}

export type UserTransferPayload = {
  toAddress: string
  token: 'SPACE' | 'USDT'
  amount: string
}

export type UserTransferResult = {
  from: Pick<UserRecord, 'id' | 'address' | 'balance' | 'usdtBalance'>
  to: Pick<UserRecord, 'id' | 'address' | 'balance' | 'usdtBalance'>
}

export type DeleteUserResult = {
  accountId: number
  address: string
  deleted: {
    accountBalanceLogs: number
    accountMiners: number
    freeMiners: number
    accountWithdrawSignatures: number
    minerPurchaseSignatures: number
    accountRelations: number
    accounts: number
  }
}

export type UserTeamOverview = {
  accountId: number
  address: string
  refCode: string
  vipLevel: number
  manualVipLevel: number
  nodeLevel: number
  directCount: number
  teamCount: number
  teamPerformance: string
  directPerformance: string
  teamMinerBuyerCount: number
  teamMinerCount: number
  teamFreeMinerCount: number
  teamReward: string
  superiorChain: UserSuperiorChainItem[]
}

export type UserSuperiorChainItem = {
  accountId: number
  address: string
  refCode: string
  level: number
  vipLevel: number
  manualVipLevel: number
  nodeLevel: number
  createdAt: number
}

export type UserTeamBranch = {
  accountId: number
  address: string
  refCode: string
  vipLevel: number
  manualVipLevel: number
  nodeLevel: number
  branchTeamCount: number
  branchPerformance: string
  branchMinerCount: number
  createdAt: number
}

export type UserTeamMember = {
  accountId: number
  address: string
  refCode: string
  level: number
  superiorAddress: string | null
  vipLevel: number
  manualVipLevel: number
  nodeLevel: number
  performance: string
  minerCount: number
  freeMinerCount: number
  createdAt: number
}

export type UserTeamBranchResponse = {
  list: UserTeamBranch[]
  total: number
  page: number
  pageSize: number
}

export type UserTeamMemberResponse = {
  list: UserTeamMember[]
  total: number
  page: number
  pageSize: number
}

export type UserTeamAddressesResponse = {
  addresses: string[]
}

export type UserTeamMinerPurchaseStats = {
  accountId: number
  totalMinerPrice: string
  spacePaidMinerPrice: string
  usdtPaidMinerSpacePrice: string
  purchaseCount: number
  buyerCount: number
  from: number
  to: number
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

export type DividendRoundSummary = {
  roundAt: number
  totalSpaceAmount: string
  totalUsdtAmount: string
  vipSpaceAmount: string
  nodeSpaceAmount: string
  nodeUsdtAmount: string
  fallbackCount: number
  statCount: number
}

export type DividendLevelStat = {
  id: number
  roundAt: number
  category: DividendRuleCategory
  token: DividendRuleToken
  level: number
  bp: number
  recipientCount: number
  perUserAmount: string
  totalAmount: string
  fallbackUsed: boolean
}

export type DividendRoundResponse = {
  list: DividendRoundSummary[]
  total: number
  page: number
  pageSize: number
}

export type DividendRoundDetailResponse = {
  roundAt: number
  list: DividendLevelStat[]
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

export type UserBalanceTotalsStat = {
  spaceBalance: string
  usdtBalance: string
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

export type TeamMarketTradeStats = {
  totalBuySpaceAmount: string
  activeBuySpaceAmount: string
  passiveBuySpaceAmount: string
  totalSellSpaceAmount: string
  activeSellSpaceAmount: string
  passiveSellSpaceAmount: string
  tradeCount: number
  accountCount: number
  from: number
  to: number
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

export type MarketTradeVolumeAdjustment = {
  amount: string
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
  userBalanceTotals: UserBalanceTotalsStat
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

export async function marketApiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`/market-api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
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

export async function getUserBalanceTotalsStat(token: string) {
  return apiRequest<UserBalanceTotalsStat>(`${ADMIN_API_PREFIX}/stats/user-balances`, { token })
}

export async function getMarketOpenSpaceStat(token: string) {
  void token
  return marketApiRequest<MarketOpenSpaceStat>('/stats/market-open-space')
}

export async function getTodayMarketTradesStat(token: string) {
  void token
  return marketApiRequest<TodayMarketTradesStat>('/stats/today-market-trades')
}

export async function getMarketTradeVolumeAdjustment(token: string) {
  return apiRequest<MarketTradeVolumeAdjustment>(
    `${ADMIN_API_PREFIX}/market/trade-volume-adjustment`,
    { token },
  )
}

export async function updateMarketTradeVolumeAdjustment(token: string, amount: string) {
  return apiRequest<MarketTradeVolumeAdjustment>(
    `${ADMIN_API_PREFIX}/market/trade-volume-adjustment`,
    {
      token,
      method: 'PUT',
      body: { amount },
    },
  )
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

export async function getOpenMarketOrders(page = 1, pageSize = 10, side?: MarketOrderSide) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })

  if (side) {
    params.set('side', side)
  }

  return marketApiRequest<MarketOrderResponse>(`/orders/open?${params.toString()}`)
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
    userBalanceTotals,
    estimatedMinerRewards,
    marketOpenSpace,
    todayMarketTrades,
  ] = await Promise.all([
    getTodayMinerPurchaseSpaceStat(token),
    getActiveUsersStat(token),
    getMinersStat(token),
    getUserBalanceTotalsStat(token),
    getEstimatedMinerRewardsStat(token),
    getMarketOpenSpaceStat(token),
    getTodayMarketTradesStat(token),
  ])

  return {
    todayMinerPurchaseSpace,
    activeUsers,
    miners,
    userBalanceTotals,
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

export async function transferUserBalance(
  token: string,
  accountId: number,
  payload: UserTransferPayload,
) {
  return apiRequest<UserTransferResult>(
    `${ADMIN_API_PREFIX}/users/${accountId}/transfer`,
    {
      token,
      method: 'POST',
      body: payload,
    },
  )
}

export async function deleteUser(
  token: string,
  accountId: number,
  confirmAddress: string,
) {
  return apiRequest<DeleteUserResult>(
    `${ADMIN_API_PREFIX}/users/${accountId}`,
    {
      token,
      method: 'DELETE',
      body: { confirmAddress },
    },
  )
}

export async function getUserTeamOverview(token: string, accountId: number) {
  return apiRequest<UserTeamOverview>(`${ADMIN_API_PREFIX}/users/${accountId}/team/overview`, { token })
}

export async function getUserTeamBranches(token: string, accountId: number, searchParams: URLSearchParams) {
  return apiRequest<UserTeamBranchResponse>(`${ADMIN_API_PREFIX}/users/${accountId}/team/branches?${searchParams.toString()}`, { token })
}

export async function getUserTeamMembers(token: string, accountId: number, searchParams: URLSearchParams) {
  return apiRequest<UserTeamMemberResponse>(`${ADMIN_API_PREFIX}/users/${accountId}/team/members?${searchParams.toString()}`, { token })
}

export async function getUserTeamAddresses(token: string, accountId: number) {
  return apiRequest<UserTeamAddressesResponse>(`${ADMIN_API_PREFIX}/users/${accountId}/team/addresses`, { token })
}

export async function getUserTeamMinerPurchaseStats(
  token: string,
  accountId: number,
  range: { from: number; to: number },
) {
  const params = new URLSearchParams({
    from: String(range.from),
    to: String(range.to),
  })

  return apiRequest<UserTeamMinerPurchaseStats>(
    `${ADMIN_API_PREFIX}/users/${accountId}/team/miner-purchase-stats?${params.toString()}`,
    { token },
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

export async function batchAccelerateAccountMiners(
  token: string,
  payload: BatchAccelerateMinersPayload,
) {
  return apiRequest<BatchAccelerateMinersResult>(
    `${ADMIN_API_PREFIX}/miners/batch-accelerate`,
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

export async function getUserAccountMarketTradeStats(
  address: string,
  payload: { from: number; to: number },
) {
  return marketApiRequest<TeamMarketTradeStats>('/trades/accounts/stats', {
    method: 'POST',
    body: {
      accounts: [address],
      from: payload.from,
      to: payload.to,
    },
  })
}

export async function getTeamMarketTradeStats(payload: { accounts: string[]; from: number; to: number }) {
  return marketApiRequest<TeamMarketTradeStats>('/trades/accounts/stats', {
    method: 'POST',
    body: payload,
  })
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

export async function updateMarketMakerWhitelist(
  token: string,
  accountId: number,
  enabled: boolean,
) {
  return apiRequest<{ accountId: number; address: string; enabled: boolean }>(
    `${ADMIN_API_PREFIX}/users/${accountId}/market-maker-whitelist`,
    {
      token,
      method: 'PUT',
      body: { enabled },
    },
  )
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

export async function getDividendRounds(token: string, searchParams: URLSearchParams) {
  return apiRequest<DividendRoundResponse>(`${ADMIN_API_PREFIX}/dividends/rounds?${searchParams.toString()}`, { token })
}

export async function getDividendRoundDetail(token: string, roundAt: number) {
  return apiRequest<DividendRoundDetailResponse>(`${ADMIN_API_PREFIX}/dividends/rounds/${roundAt}`, { token })
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
