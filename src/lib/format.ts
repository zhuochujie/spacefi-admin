import { formatUnits } from 'viem'

export function formatTime(value?: number) {
  if (!value) return '-'
  const time = value < 1e12 ? value * 1000 : value
  return new Date(time).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function shortAddress(address: string) {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

type FormatAmountOptions = {
  decimals?: number
  fractionDigits?: number
  fixed?: boolean
  fallback?: string
  minVisibleAmount?: bigint
  minVisibleText?: string
  display?: boolean
}

function trimTrailingZeros(value: string) {
  return value.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}

function toBigint(value: bigint | string | number | null | undefined) {
  return value === null || value === undefined
    ? 0n
    : typeof value === 'bigint'
      ? value
      : BigInt(value)
}

export function formatAmount(value: bigint | string | number | null | undefined, options: FormatAmountOptions = {}) {
  const {
    decimals = 18,
    fractionDigits = 2,
    fixed = false,
    fallback = '0',
    minVisibleAmount = options.display ? 10n ** 15n : undefined,
    minVisibleText = options.display ? '<0.001' : undefined,
  } = options

  try {
    if (decimals < 0 || !Number.isInteger(decimals)) {
      return fallback
    }

    if (fractionDigits !== undefined && (fractionDigits < 0 || !Number.isInteger(fractionDigits))) {
      return fallback
    }

    const bigintValue = toBigint(value)

    if (minVisibleAmount !== undefined && bigintValue > 0n && bigintValue < minVisibleAmount) {
      return minVisibleText ?? `<${formatUnits(minVisibleAmount, decimals)}`
    }

    const rawAmount = formatUnits(bigintValue, decimals)
    const [integerPart, decimalPart = ''] = rawAmount.split('.')
    const decimal = fractionDigits === undefined
      ? decimalPart
      : decimalPart.slice(0, fractionDigits).padEnd(fixed ? fractionDigits : 0, '0')
    const formatted = decimal ? `${integerPart}.${decimal}` : integerPart

    return fixed ? formatted : trimTrailingZeros(formatted)
  } catch {
    return fallback
  }
}
