import {
  getAppointmentsForBusiness,
  type Appointment,
} from './appointments'
import type { Business } from './business'

export interface CustomerSummary {
  key: string
  name: string
  phone: string
  email: string
  bookings: number
  firstDate: string
  lastDate: string
  lastNotes: string
}

export function customerKeyOf(a: Appointment): string {
  const phone = a.customerPhone.trim()
  const email = a.customerEmail.trim()
  const name = a.customerName.trim()
  if (phone) return `p:${phone}`
  if (email) return `e:${email}`
  if (name) return `n:${name}`
  return ''
}

export function customerAppointmentsForBusiness(business: Business): Appointment[] {
  return getAppointmentsForBusiness(
    business.id,
    business.locations[0]?.id,
    business.locations[0]?.name,
  ).filter((a) => a.status !== 'cancelled')
}

export function appointmentsForCustomer(business: Business, key: string): Appointment[] {
  return customerAppointmentsForBusiness(business)
    .filter((a) => customerKeyOf(a) === key)
    .sort((x, y) => y.date.localeCompare(x.date) || y.time.localeCompare(x.time))
}

export function buildCustomers(business: Business): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>()

  for (const a of customerAppointmentsForBusiness(business)) {
    const key = customerKeyOf(a)
    if (!key) continue

    const existing = map.get(key)
    if (existing) {
      existing.bookings += 1
      if (a.date < existing.firstDate) existing.firstDate = a.date
      if (a.date > existing.lastDate) existing.lastDate = a.date
      if (a.customerNotes.trim() && a.date === existing.lastDate) existing.lastNotes = a.customerNotes.trim()
    } else {
      map.set(key, {
        key,
        name: a.customerName.trim(),
        phone: a.customerPhone.trim(),
        email: a.customerEmail.trim(),
        bookings: 1,
        firstDate: a.date,
        lastDate: a.date,
        lastNotes: a.customerNotes.trim(),
      })
    }
  }

  return Array.from(map.values()).sort((x, y) =>
    y.lastDate.localeCompare(x.lastDate) || x.name.localeCompare(y.name),
  )
}

export function customerSummaryFromAppointments(list: Appointment[]): CustomerSummary | null {
  if (list.length === 0) return null
  const sorted = [...list].sort((x, y) => x.date.localeCompare(y.date) || x.time.localeCompare(y.time))
  const first = sorted[0]
  const last = sorted[sorted.length - 1]
  return {
    key: customerKeyOf(last),
    name: last.customerName.trim(),
    phone: last.customerPhone.trim(),
    email: last.customerEmail.trim(),
    bookings: list.length,
    firstDate: first.date,
    lastDate: last.date,
    lastNotes: last.customerNotes.trim(),
  }
}