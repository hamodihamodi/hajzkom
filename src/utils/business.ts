import type { DayHours, ServiceInfo, BusinessLocationInfo } from '../types'

const KEY = 'hajzkom:businesses'

export type PlanTier = 'free' | 'pro' | 'max'

export interface Business {
  id: string
  name: string
  description: string
  logoDataUrl: string | null
  coverDataUrl: string | null
  bookingWindowDays: number
  whatsappNumber: string
  telegramUsername: string
  contactEmail: string
  facebookUrl: string
  instagramUrl: string
  tiktokUrl: string
  websiteUrl: string
  ownerId: string
  plan: PlanTier
  locations: BusinessLocationInfo[]
  services: ServiceInfo[]
  createdAt: number
}

function loadAll(): Business[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map((b: Business) => ({
      ...b,
      plan: b.plan ?? 'free',
      locations: b.locations ?? [],
      services: b.services ?? [],
    }))
  } catch {
    return []
  }
}

function saveAll(list: Business[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function getBusinessByOwner(ownerId: string): Business | null {
  return loadAll().find((b) => b.ownerId === ownerId) ?? null
}

export function getBusinessById(id: string): Business | null {
  return loadAll().find((b) => b.id === id) ?? null
}

export function createBusiness(input: Omit<Business, 'id' | 'createdAt' | 'plan' | 'locations' | 'services'>): Business {
  const list = loadAll()
  const biz: Business = {
    ...input,
    plan: 'free',
    locations: [],
    services: [],
    id: makeId(),
    createdAt: Date.now(),
  }
  list.push(biz)
  saveAll(list)
  return biz
}

export function updateBusiness(id: string, patch: Partial<Business>): Business | null {
  const list = loadAll()
  const idx = list.findIndex((b) => b.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  saveAll(list)
  return list[idx]
}

export function deleteBusiness(id: string): boolean {
  const list = loadAll()
  const idx = list.findIndex((b) => b.id === id)
  if (idx === -1) return false
  list.splice(idx, 1)
  saveAll(list)
  return true
}

export function locationLimitForPlan(plan: PlanTier): number {
  switch (plan) {
    case 'max':
      return Infinity
    default:
      return 1
  }
}

export function appointmentLimitForPlan(plan: PlanTier): number {
  switch (plan) {
    case 'free':
      return 200
    case 'pro':
      return 1000
    default:
      return Infinity
  }
}

export function staffLimitForPlan(plan: PlanTier): number {
  switch (plan) {
    case 'free':
      return 1
    case 'pro':
      return 5
    default:
      return Infinity
  }
}

export function canAddStaff(business: Business, currentStaffCount: number): boolean {
  return currentStaffCount < staffLimitForPlan(business.plan)
}

const ACTIVE_LOC_KEY = 'hajzkom:activeLocation'

export function getActiveLocationId(businessId: string): string | null {
  try {
    return localStorage.getItem(`${ACTIVE_LOC_KEY}:${businessId}`)
  } catch {
    return null
  }
}

export function setActiveLocationId(businessId: string, locationId: string): void {
  try {
    localStorage.setItem(`${ACTIVE_LOC_KEY}:${businessId}`, locationId)
  } catch {
    /* ignore */
  }
}

export function canAddLocation(business: Business): boolean {
  return business.locations.length < locationLimitForPlan(business.plan)
}

export function addLocation(businessId: string, input: Omit<BusinessLocationInfo, 'id'>): BusinessLocationInfo | null {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return null
  if (!canAddLocation(biz)) return null
  const loc: BusinessLocationInfo = { ...input, id: makeId() }
  biz.locations.push(loc)
  saveAll(list)
  return loc
}

export function updateLocation(businessId: string, locationId: string, patch: Partial<BusinessLocationInfo>): BusinessLocationInfo | null {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return null
  const loc = biz.locations.find((l) => l.id === locationId)
  if (!loc) return null
  Object.assign(loc, patch)
  saveAll(list)
  return loc
}

export function updateLocationHours(businessId: string, locationId: string, hours: DayHours[]): boolean {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return false
  const loc = biz.locations.find((l) => l.id === locationId)
  if (!loc) return false
  loc.hours = hours
  saveAll(list)
  return true
}

export function removeLocation(businessId: string, locationId: string): boolean {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return false
  const idx = biz.locations.findIndex((l) => l.id === locationId)
  if (idx === -1) return false
  biz.locations.splice(idx, 1)
  if (biz.locations.length > 0) {
    const activeId = localStorage.getItem(`${ACTIVE_LOC_KEY}:${businessId}`)
    if (activeId === locationId || !biz.locations.some((l) => l.id === activeId)) {
      localStorage.setItem(`${ACTIVE_LOC_KEY}:${businessId}`, biz.locations[0].id)
    }
  } else {
    localStorage.removeItem(`${ACTIVE_LOC_KEY}:${businessId}`)
  }
  saveAll(list)
  return true
}

export function addService(businessId: string, input: Omit<ServiceInfo, 'id'>): ServiceInfo | null {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return null
  const svc: ServiceInfo = { ...input, id: makeId() }
  biz.services.push(svc)
  saveAll(list)
  return svc
}

export function updateService(businessId: string, serviceId: string, patch: Partial<ServiceInfo>): ServiceInfo | null {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return null
  const svc = biz.services.find((s) => s.id === serviceId)
  if (!svc) return null
  Object.assign(svc, patch)
  saveAll(list)
  return svc
}

export function deleteService(businessId: string, serviceId: string): boolean {
  const list = loadAll()
  const biz = list.find((b) => b.id === businessId)
  if (!biz) return false
  const idx = biz.services.findIndex((s) => s.id === serviceId)
  if (idx === -1) return false
  biz.services.splice(idx, 1)
  saveAll(list)
  return true
}

export function getOnboardingStatus(business: Business): {
  hasLocation: boolean
  hasHours: boolean
  hasService: boolean
  complete: boolean
} {
  const hasLocation = business.locations.length > 0
  const hasHours =
    hasLocation &&
    business.locations.some((loc) => loc.hours.some((h) => !h.closed && h.open && h.close))
  const hasService = business.services.length > 0
  return { hasLocation, hasHours, hasService, complete: hasLocation && hasHours && hasService }
}
