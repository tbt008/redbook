import dayjs from 'dayjs'

type DateValue = string | number | Date | Array<string | number> | null | undefined

const buildFromParts = (parts: Array<string | number>) => {
  const values = parts.map((item) => Number(item))
  const [year, month, date, hour = 0, minute = 0, second = 0] = values

  if (!year || !month || !date || values.some((item) => Number.isNaN(item))) {
    return null
  }

  const parsed = dayjs(new Date(year, month - 1, date, hour, minute, second))
  return parsed.isValid() ? parsed : null
}

const resolveDate = (value: DateValue) => {
  if (value == null || value === '') {
    return null
  }

  if (Array.isArray(value)) {
    return buildFromParts(value)
  }

  if (value instanceof Date) {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed : null
  }

  if (typeof value === 'number') {
    const parsed = dayjs(value)
    return parsed.isValid() ? parsed : null
  }

  const text = String(value).trim()
  if (!text) {
    return null
  }

  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      const parsed = JSON.parse(text)
      if (Array.isArray(parsed)) {
        return buildFromParts(parsed)
      }
    } catch {
      return null
    }
  }

  if (/^\d{4},\d{1,2},\d{1,2}(,\d{1,2}){0,3}$/.test(text)) {
    return buildFromParts(text.split(','))
  }

  const parsed = dayjs(text)
  return parsed.isValid() ? parsed : null
}

export const formatDateTime = (
  value: DateValue,
  format = 'YYYY-MM-DD HH:mm:ss',
  fallback = '-'
) => {
  const parsed = resolveDate(value)
  return parsed ? parsed.format(format) : fallback
}
