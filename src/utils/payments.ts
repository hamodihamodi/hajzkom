import type { PlanTier } from './business'
import type { BillingCycle } from './billing'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'expired'

export interface PaymentRecord {
  id: string
  businessId: string
  date: number
  plan: PlanTier
  cycle: BillingCycle
  amount: number
  status: PaymentStatus
  gateway: 'ZainCash'
  paidAt?: number
  transactionId?: string
  checkoutId?: string
  checkoutExpiry?: number
}

const KEY = 'hajzkom:payments'

const PLANS: PlanTier[] = ['pro', 'pro', 'pro', 'max', 'pro']
const CYCLES: BillingCycle[] = ['m', 'm', 'y', 'm', 'm']
const AMOUNTS = [15000, 15000, 150000, 36000, 15000]
const STATUSES: PaymentStatus[] = ['paid', 'pending', 'failed', 'refunded', 'expired']

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function loadPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PaymentRecord[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(list: PaymentRecord[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getPayments(businessId: string): PaymentRecord[] {
  const all = loadPayments()
  if (all.some((p) => p.businessId === businessId)) return all.filter((p) => p.businessId === businessId)
  const seeded = seedForBusiness(businessId)
  return seeded
}

export function seedForBusiness(businessId: string): PaymentRecord[] {
  const all = loadPayments()
  if (all.some((p) => p.businessId === businessId)) return all.filter((p) => p.businessId === businessId)
  const now = Date.now()
  const seeded: PaymentRecord[] = []
  for (let i = 0; i < STATUSES.length; i++) {
    const paid = STATUSES[i] === 'paid'
    const pending = STATUSES[i] === 'pending'
    const daysAgo = (i + 1) * 24
    seeded.push({
      id: makeId(),
      businessId,
      date: now - daysAgo * 3600000,
      plan: PLANS[i],
      cycle: CYCLES[i],
      amount: AMOUNTS[i],
      status: STATUSES[i],
      gateway: 'ZainCash',
      paidAt: paid ? now - daysAgo * 3600000 + 60000 : undefined,
      transactionId: paid ? `ZNC-${(0x100000 + i * 7919).toString(36).toUpperCase()}` : undefined,
      checkoutId: pending ? `CHK-${(0x100000 + i * 104729).toString(36).toUpperCase()}` : undefined,
      checkoutExpiry: pending ? now + 30 * 60000 : undefined,
    })
  }
  save([...all, ...seeded])
  return seeded
}

export function getPaymentById(businessId: string, paymentId: string): PaymentRecord | null {
  return getPayments(businessId).find((p) => p.id === paymentId) ?? null
}

export function addPayment(input: Omit<PaymentRecord, 'id'>): PaymentRecord {
  const rec: PaymentRecord = { ...input, id: makeId() }
  const all = loadPayments()
  all.push(rec)
  save(all)
  return rec
}

export const PAYMENT_STATUS_AR: Record<PaymentStatus, string> = {
  pending: 'قيد الانتظار',
  paid: 'مدفوع',
  failed: 'فشل',
  refunded: 'مسترد',
  expired: 'منتهي',
}

export const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  pending: 'var(--color-warning)',
  paid: 'var(--color-success)',
  failed: 'var(--color-error)',
  refunded: 'var(--color-text-tertiary)',
  expired: 'var(--color-text-tertiary)',
}
