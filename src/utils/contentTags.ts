const TAG_FIELD_CANDIDATES = [
  'tags',
  'tagList',
  'tagNames',
  'labels',
  'keywords',
  'theme',
  'themes'
]

const normalizeTagValue = (value: unknown): string[] => {
  if (!value) return []

  if (Array.isArray(value)) {
    return value
      .flatMap((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return [String(item)]
        }
        if (item && typeof item === 'object') {
          const tagLike = item as Record<string, unknown>
          return [
            tagLike.tagName,
            tagLike.name,
            tagLike.label,
            tagLike.value
          ]
            .filter((entry): entry is string | number => typeof entry === 'string' || typeof entry === 'number')
            .map((entry) => String(entry))
        }
        return []
      })
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    const raw = value.trim()
    if (!raw) return []

    if ((raw.startsWith('[') && raw.endsWith(']')) || (raw.startsWith('{') && raw.endsWith('}'))) {
      try {
        return normalizeTagValue(JSON.parse(raw))
      } catch {
        // Fallback to delimiter parsing.
      }
    }

    return raw
      .split(/[，,、|/]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return [String(value).trim()].filter(Boolean)
}

export const extractDisplayTags = (
  source: Record<string, unknown> | null | undefined,
  fields: string[] = TAG_FIELD_CANDIDATES
) => {
  if (!source) return []

  const merged = fields.flatMap((field) => normalizeTagValue(source[field]))
  return [...new Set(merged)]
}
