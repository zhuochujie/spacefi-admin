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

export function formatTokenAmount(value: string, decimals = 18) {
  try {
    const formatted = formatUnits(BigInt(value), decimals)
    if (!formatted.includes('.')) return formatted

    const [integerPart, decimalPart = ''] = formatted.split('.')
    const trimmedDecimal = decimalPart.slice(0, 2).replace(/0+$/, '')

    if (!trimmedDecimal) return integerPart

    return `${integerPart}.${trimmedDecimal}`
      .replace(/\.?0+$/, '')
      .replace(/(\.\d*?)0+$/, '$1')
  } catch {
    return value
  }
}

export function formatTokenAmountFixed(value: string, fractionDigits: number, decimals = 18) {
  try {
    const formatted = formatUnits(BigInt(value), decimals)
    const [integerPart, decimalPart = ''] = formatted.split('.')
    const fixedDecimal = decimalPart.padEnd(fractionDigits, '0').slice(0, fractionDigits)

    return fractionDigits > 0 ? `${integerPart}.${fixedDecimal}` : integerPart
  } catch {
    return value
  }
}
