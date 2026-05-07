const DEFAULT_COVER = '/local-images/default-cover.svg'

const stripWrappingQuotes = (value: string) => value.replace(/^['"]|['"]$/g, '').trim()

const cleanImageToken = (value: string) => {
  let text = value.trim()
  text = text.replace(/^\[+/, '').replace(/\]+$/, '').trim()
  text = stripWrappingQuotes(text)
  text = text.replace(/^\[+/, '').replace(/\]+$/, '').trim()
  return stripWrappingQuotes(text)
}

const isBrokenDataImageUrl = (value: string) => /^data:image\//i.test(value) && !value.includes(',')

export const normalizeImageUrl = (value?: unknown, fallback = DEFAULT_COVER): string => {
  if (value == null) return fallback

  const raw = cleanImageToken(String(value))
  if (!raw || raw === 'null' || raw === 'undefined') return fallback
  if (isBrokenDataImageUrl(raw)) return fallback

  if (/^(data:image\/|blob:|https?:\/\/)/i.test(raw)) return raw
  if (raw.startsWith('//')) return `${window.location.protocol}${raw}`
  if (raw.startsWith('/')) return raw

  return `/${raw.replace(/^\/+/, '')}`
}

export const parseImageList = (value?: unknown, fallback?: string): string[] => {
  if (value == null || value === '') return fallback ? [fallback] : []

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => parseImageList(item))
      .filter(Boolean)
  }

  const raw = String(value).trim()
  if (!raw) return fallback ? [fallback] : []
  if (/^data:image\//i.test(raw)) {
    const image = normalizeImageUrl(raw, '')
    return image ? [image] : fallback ? [fallback] : []
  }

  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.map((item) => normalizeImageUrl(item, '')).filter(Boolean)
    }
    if (typeof parsed === 'string') {
      return parseImageList(parsed, fallback)
    }
  } catch (error) {
    // Some legacy rows use comma-separated image strings instead of JSON.
  }

  return raw
    .split(',')
    .map((item) => normalizeImageUrl(item, ''))
    .filter(Boolean)
}

export const getFirstImageUrl = (...values: unknown[]): string => {
  for (const value of values) {
    const images = parseImageList(value)
    if (images.length > 0) return images[0]
  }
  return DEFAULT_COVER
}
