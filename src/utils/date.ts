export type DateInput = string | number | Date | Array<string | number> | null | undefined

const pad = (value: number) => String(value).padStart(2, '0')

const normalizeTimestamp = (input: number) => {
  const timestamp = Math.abs(input) < 10000000000 ? input * 1000 : input
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? null : date
}

export const normalizeDate = (input: DateInput): Date | null => {
  if (input == null || input === '') return null

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }

  if (Array.isArray(input)) {
    const values = input.map((item) => Number(item))
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = values
    if (!year || !month || !day || values.some((item) => Number.isNaN(item))) return null
    const date = new Date(year, month - 1, day, hour, minute, second)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof input === 'number') {
    return normalizeTimestamp(input)
  }

  const text = String(input).trim()
  if (!text || text === 'Invalid Date') return null

  if (/^-?\d+$/.test(text)) {
    return normalizeTimestamp(Number(text))
  }

  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return normalizeDate(parsed)
      }
    } catch {
      return null
    }
  }

  if (/^\d{4},\d{1,2},\d{1,2}(,\d{1,2}){0,4}$/.test(text)) {
    return normalizeDate(text.split(','))
  }

  const normalizedText = text.includes('T') ? text : text.replace(/-/g, '/')
  const date = new Date(normalizedText)
  return Number.isNaN(date.getTime()) ? null : date
}

export const isValidDateInput = (input: DateInput) => {
  return normalizeDate(input) !== null
}

const format = (date: Date, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())

  return pattern
    .replace(/YYYY/g, String(year))
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hour)
    .replace(/mm/g, minute)
    .replace(/ss/g, second)
}

export const formatDateTime = (input: DateInput, fallback = '-', pattern = 'YYYY-MM-DD HH:mm:ss') => {
  const date = normalizeDate(input)
  return date ? format(date, pattern) : fallback
}

export const formatDateOnly = (input: DateInput, fallback = '-') => {
  const date = normalizeDate(input)
  return date ? format(date, 'YYYY-MM-DD') : fallback
}

export const toTimestamp = (input: DateInput) => {
  const date = normalizeDate(input)
  return date ? date.getTime() : 0
}
