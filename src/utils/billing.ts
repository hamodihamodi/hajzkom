import type { PlanTier } from './business'
import { updateBusiness } from './business'

export type BillingCycle = 'm' | 'y'
export type SubscriptionStatus = 'active' | 'past_due'

export interface BillingInfo {
  businessId: string
  plan: PlanTier
  cycle: BillingCycle
  status: SubscriptionStatus
  periodStart: number
  periodEnd: number
  cancelScheduled: boolean
  cancelAt: number
  graceEnd: number
}

export interface PlanPricing {
  key: PlanTier
  name: string
  description: string
  monthly: number
  yearly: number
  features: string[]
}

export const PLAN_PRICING: Record<PlanTier, PlanPricing> = {
  free: {
    key: 'free',
    name: 'مجانية',
    description: 'لتبدأ وتجرّب النظام على نشاطك الصغير',
    monthly: 0,
    yearly: 0,
    features: ['صفحة حجز عامة لزبائنك', 'حتى 100 حجز شهرياً', 'موقع واحد', 'تذكيرات يدوية عبر واتساب'],
  },
  pro: {
    key: 'pro',
    name: 'احترافية',
    description: 'للنشاطات المزدحمة التي تريد تنظيماً كاملاً',
    monthly: 15000,
    yearly: 150000,
    features: [
      'كل مزايا الخطة المجانية',
      'حتى 1,000 حجز شهرياً',
      'فرعان و8 أعضاء',
      'تذكيرات تلقائية',
      'تقارير متقدمة وإحصاءات',
    ],
  },
  max: {
    key: 'max',
    name: 'ماكس',
    description: 'للسلاسل والنشاطات متعددة الفروع — بلا حدود',
    monthly: 36000,
    yearly: 360000,
    features: [
      'كل مزايا برو — بلا حدود',
      'أعضاء وحجوزات وفروع غير محدودة',
      'علامة بيضاء وقوالب تذكير خاصة',
      'مدير حساب ودعم مباشر عبر واتساب',
    ],
  },
}

const KEY = (businessId: string) => `hajzkom:billing:${businessId}`

const DAY = 86400000

function cycleMillis(cycle: BillingCycle): number {
  return cycle === 'y' ? 365 * DAY : 30 * DAY
}

export function loadBilling(businessId: string): BillingInfo | null {
  try {
    const raw = localStorage.getItem(KEY(businessId))
    if (!raw) return null
    return JSON.parse(raw) as BillingInfo
  } catch {
    return null
  }
}

function save(info: BillingInfo): void {
  localStorage.setItem(KEY(info.businessId), JSON.stringify(info))
}

export function getBilling(businessId: string, plan?: PlanTier): BillingInfo {
  const existing = loadBilling(businessId)
  const now = Date.now()
  if (existing) return existing
  const effectivePlan = plan ?? 'free'
  const info: BillingInfo = {
    businessId,
    plan: effectivePlan,
    cycle: 'm',
    status: 'active',
    periodStart: now,
    periodEnd: now + cycleMillis('m'),
    cancelScheduled: false,
    cancelAt: 0,
    graceEnd: now + cycleMillis('m') + 5 * DAY,
  }
  save(info)
  return info
}

export function currentPeriod(bill: BillingInfo): string {
  return `${new Date(bill.periodStart).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })} — ${new Date(bill.periodEnd).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

export function priceForPlan(plan: PlanTier, cycle: BillingCycle): number {
  return cycle === 'y' ? PLAN_PRICING[plan].yearly : PLAN_PRICING[plan].monthly
}

export function setBillingCycle(businessId: string, cycle: BillingCycle): BillingInfo {
  const bill = getBilling(businessId)
  bill.cycle = cycle
  bill.periodEnd = bill.periodStart + cycleMillis(cycle)
  save(bill)
  return bill
}

export function setBillingPlan(businessId: string, plan: PlanTier): BillingInfo {
  const bill = getBilling(businessId)
  const now = Date.now()
  bill.plan = plan
  bill.periodStart = now
  bill.periodEnd = now + cycleMillis(bill.cycle)
  bill.cancelScheduled = false
  bill.cancelAt = 0
  bill.status = 'active'
  bill.graceEnd = now + cycleMillis(bill.cycle) + 5 * DAY
  save(bill)
  updateBusiness(businessId, { plan })
  return bill
}

export function renewBilling(businessId: string): BillingInfo {
  const bill = getBilling(businessId)
  const now = Date.now()
  if (bill.status === 'past_due') {
    bill.status = 'active'
  }
  bill.periodStart = Math.max(now, bill.periodEnd)
  bill.periodEnd = bill.periodStart + cycleMillis(bill.cycle)
  bill.graceEnd = bill.periodEnd + 5 * DAY
  if (bill.cancelScheduled && bill.status !== 'active' && bill.cancelAt <= now) {
    bill.cancelScheduled = false
    bill.cancelAt = 0
  }
  save(bill)
  return bill
}

export function cancelBilling(businessId: string): BillingInfo {
  const bill = getBilling(businessId)
  bill.cancelScheduled = true
  bill.cancelAt = bill.periodEnd
  save(bill)
  return bill
}

export function resumeBilling(businessId: string): BillingInfo {
  const bill = getBilling(businessId)
  bill.cancelScheduled = false
  bill.cancelAt = 0
  save(bill)
  return bill
}

export function markPastDue(businessId: string): BillingInfo {
  const bill = getBilling(businessId)
  bill.status = 'past_due'
  bill.graceEnd = Date.now() + 5 * DAY
  save(bill)
  return bill
}
