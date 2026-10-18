import { useQuery } from '@tanstack/react-query'
import {
  getAdminProfile,
  getAdminStats,
  getMarketOrderDetail,
  getMarketTradeVolumeAdjustment,
  getOpenMarketOrders,
  getRecentMarketOrders,
  getRecentMarketTrades,
  getAdminMiners,
  getAdminUsers,
  getAdminConfigs,
  getMaintenance,
  getAdminNotices,
  getBalanceLogs,
  getDividendLogs,
  getDividendRoundDetail,
  getDividendRounds,
  getDividendRules,
  getUserMiners,
  getUserTeamBranches,
  getUserTeamMembers,
  getUserTeamMinerPurchaseStats,
  getUserTeamOverview,
  getUserMarketOrders,
  getUserAccountMarketTrades,
  getUserAccountMarketTradeStats,
  type AccountMarketTradeResponse,
  type AdminConfigItem,
  type AdminMiner,
  type AdminStats,
  type BalanceLogResponse,
  type DividendLogResponse,
  type DividendRoundDetailResponse,
  type DividendRoundResponse,
  type DividendRuleGroup,
  type MarketOrderResponse,
  type MarketOrderSide,
  type MarketOrderDetailResponse,
  type MarketTradeResponse,
  type MarketTradeVolumeAdjustment,
  type TeamMarketTradeStats,
  type MaintenanceState,
  type MinerResponse,
  type NoticeListResponse,
  type UserListResponse,
  type UserTeamBranchResponse,
  type UserTeamMinerPurchaseStats,
  type UserTeamMemberResponse,
  type UserTeamOverview,
} from '../api'

export type UserFilters = {
  page: number
  pageSize: number
  address: string
  vipLevel: string
  nodeLevel: string
  sortBy: string
  sortOrder: string
}

export type BalanceFilters = {
  page: number
  pageSize: number
  type: string[]
  token: string
}

export type MarketOrderFilters = {
  page: number
  pageSize: number
  view: 'orders' | 'trades'
  side: string
  status: string
  action: string
}

export type MarketTradeStatsRange = {
  from: number
  to: number
}

export type TeamMinerPurchaseStatsRange = {
  from: number
  to: number
}

export type TeamBranchFilters = {
  page: number
  pageSize: number
}

export type TeamMemberFilters = {
  page: number
  pageSize: number
  level: string
  address: string
}

export type DividendLogFilters = {
  page: number
  pageSize: number
}

export type DividendRoundFilters = {
  page: number
  pageSize: number
}

export type NoticeFilters = {
  page: number
  pageSize: number
}

export function buildUsersSearchParams(filters: UserFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.address.trim()) params.set('address', filters.address.trim())
  if (filters.vipLevel.trim()) params.set('vipLevel', filters.vipLevel.trim())
  if (filters.nodeLevel.trim()) params.set('nodeLevel', filters.nodeLevel.trim())
  if (filters.sortBy) params.set('sortBy', filters.sortBy)
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
  return params
}

export function buildBalanceSearchParams(filters: BalanceFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.type.length > 0) params.set('type', filters.type.join(','))
  if (filters.token.trim()) params.set('token', filters.token.trim().toUpperCase())
  return params
}

export function buildMarketOrderSearchParams(filters: MarketOrderFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.view === 'orders' && filters.side.trim()) params.set('side', filters.side.trim())
  if (filters.view === 'orders' && filters.status.trim()) params.set('status', filters.status.trim())
  if (filters.view === 'trades' && filters.action.trim()) params.set('action', filters.action.trim())
  return params
}

export function buildTeamBranchSearchParams(filters: TeamBranchFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params
}

export function buildTeamMemberSearchParams(filters: TeamMemberFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  if (filters.level.trim()) params.set('level', filters.level.trim())
  if (filters.address.trim()) params.set('address', filters.address.trim())
  return params
}

export function buildDividendLogSearchParams(filters: DividendLogFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params
}

export function buildDividendRoundSearchParams(filters: DividendRoundFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params
}

export function buildNoticeSearchParams(filters: NoticeFilters) {
  const params = new URLSearchParams()
  params.set('page', String(filters.page))
  params.set('pageSize', String(filters.pageSize))
  return params
}

export function useAdminProfileQuery(token: string) {
  return useQuery({
    queryKey: ['admin-profile', token],
    queryFn: () => getAdminProfile(token),
    enabled: Boolean(token),
  })
}

export function useAdminStatsQuery(token: string, enabled: boolean) {
  return useQuery<AdminStats>({
    queryKey: ['admin-stats', token],
    queryFn: () => getAdminStats(token),
    enabled,
  })
}

export function useRecentMarketTradesQuery(enabled: boolean, page = 1, pageSize = 10) {
  return useQuery<MarketTradeResponse>({
    queryKey: ['recent-market-trades', page, pageSize],
    queryFn: () => getRecentMarketTrades(page, pageSize),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useRecentMarketOrdersQuery(enabled: boolean, page = 1, pageSize = 10) {
  return useQuery<MarketOrderResponse>({
    queryKey: ['recent-market-orders', page, pageSize],
    queryFn: () => getRecentMarketOrders(page, pageSize),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useOpenMarketOrdersQuery(enabled: boolean, page = 1, pageSize = 10, side?: MarketOrderSide) {
  return useQuery<MarketOrderResponse>({
    queryKey: ['open-market-orders', side ?? 'all', page, pageSize],
    queryFn: () => getOpenMarketOrders(page, pageSize, side),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useMarketOrderDetailQuery(orderId: string, enabled: boolean) {
  return useQuery<MarketOrderDetailResponse>({
    queryKey: ['market-order-detail', orderId],
    queryFn: () => getMarketOrderDetail(orderId),
    enabled: enabled && Boolean(orderId),
  })
}

export function useMarketTradeVolumeAdjustmentQuery(token: string, enabled: boolean) {
  return useQuery<MarketTradeVolumeAdjustment>({
    queryKey: ['admin-market-trade-volume-adjustment', token],
    queryFn: () => getMarketTradeVolumeAdjustment(token),
    enabled,
  })
}

export function useUsersQuery(token: string, filters: UserFilters, enabled: boolean) {
  return useQuery<UserListResponse>({
    queryKey: ['admin-users', token, filters],
    queryFn: () => getAdminUsers(token, buildUsersSearchParams(filters)),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useUserBalanceLogsQuery(
  token: string,
  accountId: number | null,
  filters: BalanceFilters,
  enabled: boolean,
  searchKey: number,
) {
  return useQuery<BalanceLogResponse>({
    queryKey: ['admin-balance-logs', token, accountId, filters, searchKey],
    queryFn: () => getBalanceLogs(token, accountId!, buildBalanceSearchParams(filters)),
    enabled: enabled && accountId != null && searchKey > 0,
    placeholderData: (previous) => previous,
  })
}

export function useUserMinersQuery(token: string, accountId: number | null, enabled: boolean) {
  return useQuery<MinerResponse>({
    queryKey: ['admin-miners', token, accountId],
    queryFn: () => getUserMiners(token, accountId!),
    enabled: enabled && accountId != null,
  })
}

export function useUserMarketOrdersQuery(
  address: string | null,
  filters: MarketOrderFilters,
  enabled: boolean,
) {
  return useQuery<MarketOrderResponse>({
    queryKey: ['admin-market-orders', address, filters],
    queryFn: () => getUserMarketOrders(address!, buildMarketOrderSearchParams(filters)),
    enabled: enabled && Boolean(address) && filters.view === 'orders',
    placeholderData: (previous) => previous,
  })
}

export function useUserAccountMarketTradesQuery(
  address: string | null,
  filters: MarketOrderFilters,
  enabled: boolean,
) {
  return useQuery<AccountMarketTradeResponse>({
    queryKey: ['admin-account-market-trades', address, filters],
    queryFn: () => getUserAccountMarketTrades(address!, buildMarketOrderSearchParams(filters)),
    enabled: enabled && Boolean(address) && filters.view === 'trades',
    placeholderData: (previous) => previous,
  })
}

export function useUserAccountMarketTradeStatsQuery(
  address: string | null,
  range: MarketTradeStatsRange,
  enabled: boolean,
) {
  return useQuery<TeamMarketTradeStats>({
    queryKey: ['admin-account-market-trade-stats', address, range],
    queryFn: () => getUserAccountMarketTradeStats(address!, range),
    enabled: enabled && Boolean(address),
    placeholderData: (previous) => previous,
  })
}

export function useUserTeamOverviewQuery(token: string, accountId: number | null, enabled: boolean) {
  return useQuery<UserTeamOverview>({
    queryKey: ['admin-user-team-overview', token, accountId],
    queryFn: () => getUserTeamOverview(token, accountId!),
    enabled: enabled && accountId !== null,
    placeholderData: (previous) => previous,
  })
}

export function useUserTeamBranchesQuery(
  token: string,
  accountId: number | null,
  filters: TeamBranchFilters,
  enabled: boolean,
) {
  return useQuery<UserTeamBranchResponse>({
    queryKey: ['admin-user-team-branches', token, accountId, filters],
    queryFn: () => getUserTeamBranches(token, accountId!, buildTeamBranchSearchParams(filters)),
    enabled: enabled && accountId !== null,
    placeholderData: (previous) => previous,
  })
}

export function useUserTeamMembersQuery(
  token: string,
  accountId: number | null,
  filters: TeamMemberFilters,
  enabled: boolean,
) {
  return useQuery<UserTeamMemberResponse>({
    queryKey: ['admin-user-team-members', token, accountId, filters],
    queryFn: () => getUserTeamMembers(token, accountId!, buildTeamMemberSearchParams(filters)),
    enabled: enabled && accountId !== null,
    placeholderData: (previous) => previous,
  })
}

export function useUserTeamMinerPurchaseStatsQuery(
  token: string,
  accountId: number | null,
  range: TeamMinerPurchaseStatsRange,
  enabled: boolean,
) {
  return useQuery<UserTeamMinerPurchaseStats>({
    queryKey: ['admin-user-team-miner-purchase-stats', token, accountId, range],
    queryFn: () => getUserTeamMinerPurchaseStats(token, accountId!, range),
    enabled: enabled && accountId !== null,
    placeholderData: (previous) => previous,
  })
}

export function useAdminMinersQuery(token: string, enabled: boolean) {
  return useQuery<AdminMiner[]>({
    queryKey: ['admin-miner-list', token],
    queryFn: () => getAdminMiners(token),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useDividendRulesQuery(token: string, enabled: boolean) {
  return useQuery<DividendRuleGroup[]>({
    queryKey: ['admin-dividend-rules', token],
    queryFn: () => getDividendRules(token),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useDividendLogsQuery(token: string, filters: DividendLogFilters, enabled: boolean) {
  return useQuery<DividendLogResponse>({
    queryKey: ['admin-dividend-logs', token, filters],
    queryFn: () => getDividendLogs(token, buildDividendLogSearchParams(filters)),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useDividendRoundsQuery(token: string, filters: DividendRoundFilters, enabled: boolean) {
  return useQuery<DividendRoundResponse>({
    queryKey: ['admin-dividend-rounds', token, filters],
    queryFn: () => getDividendRounds(token, buildDividendRoundSearchParams(filters)),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useDividendRoundDetailQuery(token: string, roundAt: number | null, enabled: boolean) {
  return useQuery<DividendRoundDetailResponse>({
    queryKey: ['admin-dividend-round-detail', token, roundAt],
    queryFn: () => getDividendRoundDetail(token, roundAt!),
    enabled: enabled && roundAt !== null,
    placeholderData: (previous) => previous,
  })
}

export function useAdminConfigsQuery(token: string, enabled: boolean) {
  return useQuery<AdminConfigItem[]>({
    queryKey: ['admin-configs', token],
    queryFn: () => getAdminConfigs(token),
    enabled,
    placeholderData: (previous) => previous,
  })
}

export function useMaintenanceQuery(token: string, enabled: boolean) {
  return useQuery<MaintenanceState>({
    queryKey: ['admin-maintenance', token],
    queryFn: () => getMaintenance(token),
    enabled,
  })
}

export function useAdminNoticesQuery(token: string, filters: NoticeFilters, enabled: boolean) {
  return useQuery<NoticeListResponse>({
    queryKey: ['admin-notices', token, filters],
    queryFn: () => getAdminNotices(token, buildNoticeSearchParams(filters)),
    enabled,
    placeholderData: (previous) => previous,
  })
}
