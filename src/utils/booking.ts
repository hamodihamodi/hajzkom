import type { BusinessInfo, BusinessLocationInfo } from '../types'
import {
  dateKey,
  generateSlotTimes,
  isSlotSeedTaken,
  sameDay,
  timeToMinutes,
  toTimeKey,
} from './datetime'

export interface BookingSelection {
  serviceId: string
  locationId: string
  date: Date
  time: string
}

export interface SlotInfo {
  time: string
  available: boolean
  past: boolean
  booked: boolean
}

// حد يومي للطاقة الاستيعابية (محاكاة محلية)
export const DAILY_CAPACITY = 5

// حد شهري إجمالي للحجوزات (محاكاة محلية)
export const MONTHLY_LIMIT = 120

export function isBusinessOpen(location: BusinessLocationInfo, date: Date): boolean {
  const dayName = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][date.getDay()]
  const day = location.hours.find((h) => h.day === dayName)
  return Boolean(day && day.open && day.close)
}

export function getDayHours(location: BusinessLocationInfo, date: Date): { open: string; close: string } | null {
  const dayName = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'][date.getDay()]
  const day = location.hours.find((h) => h.day === dayName)
  if (!day || !day.open || !day.close) return null
  return { open: day.open, close: day.close }
}

export function previousSlotsTaken(date: Date, time: string): number {
  // عدد الحجوزات السابقة في نفس اليوم قبل هذا الوقت (محاكاة محلية)
  const seed = dateKey(date) + ':' + time
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return hash % DAILY_CAPACITY
}

export function buildSlots(
  location: BusinessLocationInfo,
  date: Date,
  selectedTime: string | null,
): SlotInfo[] {
  const hours = getDayHours(location, date)
  if (!hours) return []

  const now = new Date()
  const today = sameDay(date, now)
  const slotTimes = generateSlotTimes(hours.open, hours.close, 30)

  return slotTimes.map((time) => {
    const timeMin = timeToMinutes(time)
    const nowMin = now.getHours() * 60 + now.getMinutes()
    const past = today && timeMin <= nowMin
    const seed = location.id + ':' + dateKey(date) + ':' + time
    const booked = isSlotSeedTaken(seed)
    const available = !past && !booked
    const isSelected = selectedTime === time
    return {
      time,
      past,
      booked,
      // يُظهر الموقع المختار ممتلئاً حتى لو كان متاحاً
      available: available && !isSelected,
    }
  })
}

export function slotsFullyBooked(slots: SlotInfo[]): boolean {
  return slots.length > 0 && slots.every((s) => !s.available)
}

export function isDateClosed(location: BusinessLocationInfo, date: Date): boolean {
  return !isBusinessOpen(location, date)
}

export function buildUpcomingDates(count = 14): Date[] {
  const dates: Date[] = []
  const today = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function formatSlot12h(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h < 12 ? 'صباحاً' : h === 12 ? 'ظهراً' : 'مساءً'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// رسالة مساعدة للـ validation
export function validateCustomer(
  fullName: string,
  phone: string,
  email: string,
): { fullName?: string; phone?: string; email?: string } {
  const errors: { fullName?: string; phone?: string; email?: string } = {}
  if (!fullName.trim()) {
    errors.fullName = 'الرجاء إدخال الاسم الكامل'
  }
  if (!phone.trim()) {
    errors.phone = 'الرجاء إدخال رقم الهاتف'
  } else if (!/^[0-9+\s-]{8,15}$/.test(phone.trim())) {
    errors.phone = 'الرجاء إدخال رقم هاتف صحيح'
  }
  if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = 'البريد الإلكتروني غير صحيح'
  }
  return errors
}

export interface BookingReference {
  ref: string
  dateKey: string
  time: string
}

export function generateBookingRef(): string {
  const date = new Date()
  const d = dateKey(date).replace(/-/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${d}-${rand}`
}

export function apiDelay(ms = 900): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function cumulativeMinutes(serviceDurationMin: number, startTime: string): number {
  return timeToMinutes(startTime) + serviceDurationMin
}

export function toEndTimeKey(startTime: string, durationMin: number): string {
  return toTimeKey(cumulativeMinutes(durationMin, startTime))
}

export function filterBusinessSlots(business: BusinessInfo): void {
  void business
}
