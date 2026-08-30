export type AccountRole = 'owner' | 'admin' | 'staff'

export type AccountStatus = 'active' | 'pending' | 'deactivated'

export interface Account {
  id: string
  fullName: string
  email: string
  password: string
  role: AccountRole
  status: AccountStatus
  businessId: string
  createdAt: number
}

export interface Session {
  accountId: string
  fullName: string
  email: string
  role: AccountRole
  loggedInAt: number
}

type Result<T> = { ok: true; value: T } | { ok: false; error: string }

const ACCOUNTS_KEY = 'hajzkom:accounts'
const SESSION_KEY = 'hajzkom:session'

export function loadAccounts(): Account[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Account[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
}

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function emailTaken(email: string, excludeId?: string): boolean {
  const normalized = normalizeEmail(email)
  return loadAccounts().some((a) => a.email === normalized && a.id !== excludeId)
}

export interface SignUpInput {
  fullName: string
  email: string
  password: string
  role?: AccountRole
  businessId?: string
}

export function signUp(input: SignUpInput): Result<Account> {
  const email = normalizeEmail(input.email)
  if (!input.fullName.trim()) return { ok: false, error: 'يرجى إدخال الاسم الكامل.' }
  if (!email) return { ok: false, error: 'يرجى إدخال البريد الإلكتروني.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'صيغة البريد الإلكتروني غير صحيحة.' }
  if (input.password.length < 8) return { ok: false, error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' }
  if (emailTaken(email)) return { ok: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً. جرّب تسجيل الدخول.' }

  const accounts = loadAccounts()
  const account: Account = {
    id: makeId(),
    fullName: input.fullName.trim(),
    email,
    password: input.password,
    role: input.role ?? 'owner',
    status: 'active',
    businessId: input.businessId ?? '',
    createdAt: Date.now(),
  }
  accounts.push(account)
  saveAccounts(accounts)
  return { ok: true, value: account }
}

export type LoginResult = Result<Account> & { needsReactivation?: boolean }

export function login(email: string, password: string): LoginResult {
  const normalized = normalizeEmail(email)
  const account = loadAccounts().find((a) => a.email === normalized)
  if (!account) return { ok: false, error: 'لا يوجد حساب بهذا البريد. أنشئ حساباً جديداً.' }
  if (account.password !== password)
    return { ok: false, error: 'كلمة المرور غير صحيحة. حاول مرة أخرى.' }
  if (account.status === 'deactivated') {
    return { ok: false, error: 'تم تعطيل هذا الحساب.', needsReactivation: true }
  }
  if (account.status === 'pending') {
    return { ok: false, error: 'لم يتم تفعيل هذا الحساب بعد.' }
  }
  return { ok: true, value: account }
}

export function reactivateAccount(email: string): Result<Account> {
  const normalized = normalizeEmail(email)
  const accounts = loadAccounts()
  const account = accounts.find((a) => a.email === normalized)
  if (!account) return { ok: false, error: 'الحساب غير موجود.' }
  account.status = 'active'
  saveAccounts(accounts)
  return { ok: true, value: account }
}

export function resolveDashboard(role: AccountRole): string {
  switch (role) {
    case 'owner':
      return '#/dashboard'
    case 'admin':
      return '#/dashboard'
    case 'staff':
      return '#/schedule'
    default:
      return '#/dashboard'
  }
}

export function startSession(account: Account): Session {
  const session: Session = {
    accountId: account.id,
    fullName: account.fullName,
    email: account.email,
    role: account.role,
    loggedInAt: Date.now(),
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function getAccountByEmail(email: string): Account | null {
  const normalized = normalizeEmail(email)
  return loadAccounts().find((a) => a.email === normalized) ?? null
}

export function attachInvitation(accountId: string, role: AccountRole, businessId: string): Account | null {
  const accounts = loadAccounts()
  const account = accounts.find((a) => a.id === accountId)
  if (!account) return null
  account.role = role
  account.businessId = businessId
  saveAccounts(accounts)
  return account
}

export function getTeamMembers(businessId: string): Account[] {
  return loadAccounts().filter((a) => a.businessId === businessId)
}

export function updateAccountRole(accountId: string, role: AccountRole): Account | null {
  const accounts = loadAccounts()
  const account = accounts.find((a) => a.id === accountId)
  if (!account) return null
  account.role = role
  saveAccounts(accounts)
  return account
}

export function removeAccountFromBusiness(accountId: string): Account | null {
  const accounts = loadAccounts()
  const account = accounts.find((a) => a.id === accountId)
  if (!account) return null
  account.businessId = ''
  account.role = 'owner'
  saveAccounts(accounts)
  return account
}
