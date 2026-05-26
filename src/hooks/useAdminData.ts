import { useQuery } from '@tanstack/react-query'
import {
  getAdminProfile,
  getAdminStats,
  getAdminMiners,
  getAdminUsers,
  getAdminConfigs,
  getAdminNotices,
  getBalanceLogs,
  getDividendLogs,
  getDividendRules,
  getUserMiners,
  type AdminConfigItem,
  type AdminMiner,
  type AdminStats,
  type BalanceLogResponse,
  type DividendLogResponse,
  type DividendRule,
  type MinerResponse,
  type NoticeListResponse,
  type UserListResponse,
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

export type DividendLogFilters = {
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

export function buildDividendLogSearchParams(filters: DividendLogFilters) {
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
    queryKey: ['admin-balance-logs', token, accountId, searchKey],
    queryFn: () => getBalanceLogs(token, accountId!, buildBalanceSearchParams(filters)),
    enabled: enabled && accountId != null && searchKey > 0,
  })
}

export function useUserMinersQuery(token: string, accountId: number | null, enabled: boolean) {
  return useQuery<MinerResponse>({
    queryKey: ['admin-miners', token, accountId],
    queryFn: () => getUserMiners(token, accountId!),
    enabled: enabled && accountId != null,
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
  return useQuery<DividendRule[]>({
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

export function useAdminConfigsQuery(token: string, enabled: boolean) {
  return useQuery<AdminConfigItem[]>({
    queryKey: ['admin-configs', token],
    queryFn: () => getAdminConfigs(token),
    enabled,
    placeholderData: (previous) => previous,
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
