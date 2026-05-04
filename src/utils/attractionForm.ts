export interface TicketDraft {
  id: string
  ticketName: string
  ticketType: number
  price: number
  validDays: number
  description: string
  totalCount: number
}

export const TICKET_TYPE_OPTIONS = [
  { label: '成人票', value: 1 },
  { label: '儿童票', value: 2 },
  { label: '学生票', value: 3 },
  { label: '老人票', value: 4 },
  { label: '团体票', value: 5 },
  { label: '优惠票', value: 6 }
]

export const getTicketTypeLabel = (ticketType?: number) =>
  TICKET_TYPE_OPTIONS.find(item => item.value === ticketType)?.label || '其他票种'

export const createTicketDraft = (): TicketDraft => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  ticketName: '',
  ticketType: 1,
  price: 0,
  validDays: 1,
  description: '',
  totalCount: 0
})

export const parseOpenTimeRange = (openTime?: string) => {
  if (!openTime) return []
  const values = openTime
    .split('-')
    .map(item => item.trim())
    .filter(Boolean)
  return values.length === 2 ? values : []
}

export const formatOpenTimeRange = (value?: string[]) => {
  if (!value || value.length !== 2) return ''
  return `${value[0]}-${value[1]}`
}
