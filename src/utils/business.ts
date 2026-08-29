const KEY = 'hajzkom:businesses'

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
  createdAt: number
}

function loadAll(): Business[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAll(list: Business[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getBusinessByOwner(ownerId: string): Business | null {
  return loadAll().find((b) => b.ownerId === ownerId) ?? null
}

export function getBusinessById(id: string): Business | null {
  return loadAll().find((b) => b.id === id) ?? null
}

export function createBusiness(input: Omit<Business, 'id' | 'createdAt'>): Business {
  const list = loadAll()
  const biz: Business = {
    ...input,
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
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
