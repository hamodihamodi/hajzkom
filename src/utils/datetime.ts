export const WEEKDAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

export const MONTHS_AR_IQ = [
  'كانون الثاني',
  'شباط',
  'آذار',
  'نيسان',
  'أيار',
  'حزيران',
  'تموز',
  'آب',
  'أيلول',
  'تشرين الأول',
  'تشرين الثاني',
  'كانون الأول',
]

export function weekdayName(date: Date): string {
  return WEEKDAYS_AR[date.getDay()]
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function dateKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function formatDateShort(date: Date): string {
  return `${weekdayName(date)} ${date.getDate()} ${MONTHS_AR_IQ[date.getMonth()]}`
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function toTimeKey(minutes: number): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'صباحاً' : h === 12 ? 'ظهراً' : 'مساءً'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

export function generateSlotTimes(open: string, close: string, stepMinutes = 30): string[] {
  const slots: string[] = []
  for (let t = timeToMinutes(open); t < timeToMinutes(close); t += stepMinutes) {
    slots.push(toTimeKey(t))
  }
  return slots
}

export function isSlotSeedTaken(seed: string): boolean {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % 10 < 3
}
