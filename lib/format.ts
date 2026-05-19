import { format, formatDistanceToNow } from 'date-fns'
import { he } from 'date-fns/locale'

export function formatDate(date: string | Date) {
  return format(new Date(date), 'd בMMMM yyyy', { locale: he })
}

export function formatTime(time: string) {
  return time.slice(0, 5)
}

export function formatDateTime(date: string | Date, time: string) {
  return `${formatDate(date)} בשעה ${formatTime(time)}`
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: he })
}

export function formatPrice(price: number) {
  return `₪${price.toLocaleString('he-IL')}`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} דקות`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} שעה ו-${m} דקות` : `${h} שעה`
}

export const levelLabels: Record<string, string> = {
  beginner: 'מתחילים',
  intermediate: 'בינוניים',
  advanced: 'מתקדמים',
}

export const statusLabels: Record<string, string> = {
  pending_payment: 'ממתין לתשלום',
  confirmed: 'מאושר',
  cancelled: 'בוטל',
  attended: 'השתתף',
  no_show: 'לא הגיע',
  open: 'פתוח להרשמה',
  full: 'מלא',
  completed: 'הושלם',
}
