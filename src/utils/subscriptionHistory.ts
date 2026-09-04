import type { PlanTier } from './business'

const PLAN_NAMES: Record<PlanTier, string> = {
  free: 'مجانية',
  pro: 'احترافية',
  max: 'ماكس',
}

export type SubscriptionEventType =
  | 'created'
  | 'upgraded'
  | 'downgraded'
  | 'cancelled'
  | 'extended'
  | 'cancellation_reverted'

export interface SubscriptionEvent {
  id: string
  businessId: string
  type: SubscriptionEventType
  date: number
  fromPlan: PlanTier
  toPlan: PlanTier
  amount?: number
  reason?: string
}

const KEY = 'hajzkom:subscriptionHistory'

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function loadHistory(): SubscriptionEvent[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SubscriptionEvent[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(list: SubscriptionEvent[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

const DAY = 86400000

function seedForBusiness(businessId: string): SubscriptionEvent[] {
  const all = loadHistory()
  if (all.some((e) => e.businessId === businessId)) return all.filter((e) => e.businessId === businessId)
  const now = Date.now()
  const seeded: SubscriptionEvent[] = [
    { id: makeId(), businessId, type: 'created', date: now - 150 * DAY, fromPlan: 'free', toPlan: 'pro', amount: 15000 },
    { id: makeId(), businessId, type: 'extended', date: now - 120 * DAY, fromPlan: 'pro', toPlan: 'pro', amount: 15000 },
    { id: makeId(), businessId, type: 'upgraded', date: now - 90 * DAY, fromPlan: 'pro', toPlan: 'max', amount: 36000 },
    { id: makeId(), businessId, type: 'downgraded', date: now - 50 * DAY, fromPlan: 'max', toPlan: 'pro', reason: 'تقليل النفقات الشهرية' },
    { id: makeId(), businessId, type: 'cancelled', date: now - 30 * DAY, fromPlan: 'pro', toPlan: 'pro' },
    { id: makeId(), businessId, type: 'cancellation_reverted', date: now - 20 * DAY, fromPlan: 'pro', toPlan: 'pro' },
    { id: makeId(), businessId, type: 'extended', date: now - 10 * DAY, fromPlan: 'pro', toPlan: 'pro', amount: 150000 },
  ]
  save([...all, ...seeded])
  return seeded
}

export function getSubscriptionHistory(businessId: string): SubscriptionEvent[] {
  const all = loadHistory()
  if (all.some((e) => e.businessId === businessId)) return all.filter((e) => e.businessId === businessId)
  return seedForBusiness(businessId)
}

export function addSubscriptionEvent(input: Omit<SubscriptionEvent, 'id'>): SubscriptionEvent {
  const ev: SubscriptionEvent = { ...input, id: makeId() }
  const all = loadHistory()
  all.push(ev)
  save(all)
  return ev
}

export const SUBSCRIPTION_EVENT_AR: Record<SubscriptionEventType, string> = {
  created: 'إنشاء الاشتراك',
  upgraded: 'تمت الترقية',
  downgraded: 'تم تخفيض الخطة',
  cancelled: 'تم إلغاء الاشتراك',
  extended: 'تمديد / تجديد',
  cancellation_reverted: 'إلغاء تفعيل الإلغاء',
}

export function planPack(plan: PlanTier): string {
  return PLAN_NAMES[plan]
}