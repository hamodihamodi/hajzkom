import type { AccountRole } from './accounts'

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export interface Invitation {
  id: string
  businessId: string
  businessName: string
  role: 'admin' | 'staff'
  locationId?: string
  locationName?: string
  email?: string
  status: InvitationStatus
  createdAt: number
  expiresAt: number
}

const INVITES_KEY = 'hajzkom:invitations'

const DAY = 24 * 60 * 60 * 1000

function seed(): Invitation[] {
  const now = Date.now()
  return [
    {
      id: 'inv-admin-1',
      businessId: 'business-1',
      businessName: 'صالون لمسة جمال',
      role: 'admin',
      status: 'pending',
      createdAt: now,
      expiresAt: now + DAY,
    },
    {
      id: 'inv-staff-1',
      businessId: 'business-1',
      businessName: 'صالون لمسة جمال',
      role: 'staff',
      locationId: 'karada',
      locationName: 'فرع الكرادة',
      status: 'pending',
      createdAt: now,
      expiresAt: now + DAY,
    },
    {
      id: 'inv-exp-1',
      businessId: 'business-1',
      businessName: 'صالون لمسة جمال',
      role: 'staff',
      locationId: 'jadriya',
      locationName: 'فرع الجادرية',
      status: 'pending',
      createdAt: now - 2 * DAY,
      expiresAt: now - DAY,
    },
    {
      id: 'inv-rev-1',
      businessId: 'business-1',
      businessName: 'صالون لمسة جمال',
      role: 'admin',
      status: 'revoked',
      createdAt: now - 3 * DAY,
      expiresAt: now - 2 * DAY,
    },
    {
      id: 'inv-acc-1',
      businessId: 'business-1',
      businessName: 'صالون لمسة جمال',
      role: 'staff',
      locationName: 'فرع الكرادة',
      status: 'accepted',
      createdAt: now - 1 * DAY,
      expiresAt: now + 1 * DAY,
    },
  ]
}

export function loadInvitations(): Invitation[] {
  try {
    const raw = localStorage.getItem(INVITES_KEY)
    if (!raw) {
      localStorage.setItem(INVITES_KEY, JSON.stringify(seed()))
      return loadInvitations()
    }
    const parsed = JSON.parse(raw) as Invitation[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return seed()
  }
}

function saveInvitations(list: Invitation[]): void {
  localStorage.setItem(INVITES_KEY, JSON.stringify(list))
}

function effectiveStatus(inv: Invitation): InvitationStatus {
  if (inv.status === 'pending' && Date.now() > inv.expiresAt) return 'expired'
  return inv.status
}

/**
 * Resolves an invitation to its effective (live) status. Returns the invitation
 * object with a possibly-corrected status. `null` when not found.
 */
export function lookupInvitation(id: string): Invitation | null {
  const list = loadInvitations()
  const found = list.find((i) => i.id === id)
  if (!found) return null
  return { ...found, status: effectiveStatus(found) }
}

export function isInviteValid(inv: Invitation): boolean {
  return inv.status === 'pending'
}

export function getInviteInvalidReason(
  inv: Invitation | null,
): 'not-found' | 'expired' | 'accepted' | 'revoked' {
  if (!inv) return 'not-found'
  const status = inv.status === 'pending' ? 'not-found' : inv.status
  return status === 'not-found' ? 'not-found' : status
}

export function markInvitationAccepted(id: string): Invitation | null {
  const list = loadInvitations()
  const found = list.find((i) => i.id === id)
  if (!found) return null
  found.status = 'accepted'
  saveInvitations(list)
  return found
}

export function roleDisplay(role: AccountRole): string {
  switch (role) {
    case 'admin':
      return 'مشرف'
    case 'staff':
      return 'موظف'
    default:
      return 'مالك'
  }
}

export function createInvitation(
  businessId: string,
  businessName: string,
  role: 'admin' | 'staff',
  email?: string,
  locationId?: string,
  locationName?: string,
): Invitation {
  const list = loadInvitations()
  const inv: Invitation = {
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    businessId,
    businessName,
    role,
    email,
    locationId,
    locationName,
    status: 'pending',
    createdAt: Date.now(),
    expiresAt: Date.now() + DAY,
  }
  list.push(inv)
  saveInvitations(list)
  return inv
}

export function revokeInvitation(id: string): Invitation | null {
  const list = loadInvitations()
  const found = list.find((i) => i.id === id)
  if (!found) return null
  found.status = 'revoked'
  saveInvitations(list)
  return { ...found, status: 'revoked' }
}

export function getBusinessInvitations(businessId: string): Invitation[] {
  return loadInvitations().filter((i) => i.businessId === businessId)
}
