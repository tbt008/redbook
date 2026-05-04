type DateInput = string | number | Date | number[] | null | undefined

const pad = (value: number) => String(value).padStart(2, '0')

const normalizeDate = (input: DateInput): Date | null => {
  if (input == null || input === '') return null

  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }

  if (Array.isArray(input)) {
    const [year, month = 1, day = 1, hour = 0, minute = 0, second = 0] = input
    const date = new Date(year, month - 1, day, hour, minute, second)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? null : date
}

const format = (date: Date, withTime: boolean) => {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  if (!withTime) {
    return `${year}-${month}-${day}`
  }

  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

export const formatDateTime = (input: DateInput, fallback = '-') => {
  const date = normalizeDate(input)
  return date ? format(date, true) : fallback
}

export const formatDateOnly = (input: DateInput, fallback = '-') => {
  const date = normalizeDate(input)
  return date ? format(date, false) : fallback
}

export const toTimestamp = (input: DateInput) => {
  const date = normalizeDate(input)
  return date ? date.getTime() : 0
}
