import { useState, type FormEvent } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  UserCog,
  X,
} from 'lucide-react'
import { toast } from '../../utils/toast'
import type { Session, Account, AccountRole } from '../../utils/accounts'
import {
  getTeamMembers,
  updateAccountRole,
  removeAccountFromBusiness,
  emailTaken,
  normalizeEmail,
} from '../../utils/accounts'
import {
  createInvitation,
  revokeInvitation,
  getBusinessInvitations,
  roleDisplay,
} from '../../utils/invites'
import type { Business } from '../../utils/business'
import type { Invitation } from '../../utils/invites'

const ROLE_AR: Record<AccountRole, string> = {
  owner: 'مالك النشاط',
  admin: 'مشرف',
  staff: 'موظف',
}

const ROLE_BG: Record<string, string> = {
  owner: 'var(--color-primary-subtle)',
  admin: 'var(--color-info-background)',
  staff: 'var(--color-surface-subtle)',
}

const ROLE_COLOR: Record<string, string> = {
  owner: 'var(--color-primary)',
  admin: 'var(--color-info)',
  staff: 'var(--color-text-secondary)',
}

interface TeamPageProps {
  session: Session
  business: Business
  onRefresh: () => void
}

type ModalState =
  | null
  | { kind: 'invite' }
  | { kind: 'edit-role'; account: Account }
  | { kind: 'remove'; account: Account }

function fmtDate(ts: number): string {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('ar-IQ', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function fmtExpiry(ts: number): string {
  const diff = ts - Date.now()
  if (diff <= 0) return 'منتهية'
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `تنتهي بعد ${days} ${days === 1 ? 'يوم' : 'أيام'}`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `تنتهي بعد ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`
  return 'تنتهي خلال ساعة'
}

function initials(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  return t.charAt(0)
}

export function TeamPage({ session, business, onRefresh }: TeamPageProps) {
  const canManage = session.role === 'owner' || session.role === 'admin'

  const [members, setMembers] = useState<Account[]>(() => getTeamMembers(business.id))
  const [invitations, setInvitations] = useState<Invitation[]>(() => getBusinessInvitations(business.id))
  const [modal, setModal] = useState<ModalState>(null)

  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'staff'>('staff')
  const [inviteLocId, setInviteLocId] = useState(business.locations[0]?.id ?? '')
  const [inviteError, setInviteError] = useState('')
  const [loading, setLoading] = useState(false)

  const refresh = () => {
    setMembers(getTeamMembers(business.id))
    setInvitations(getBusinessInvitations(business.id))
    onRefresh()
  }

  const resetInvite = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteRole('staff')
    setInviteLocId(business.locations[0]?.id ?? '')
    setInviteError('')
    setModal(null)
    setLoading(false)
  }

  const handleInvite = (e: FormEvent) => {
    e.preventDefault()
    if (!inviteName.trim() || inviteName.trim().length < 2) {
      setInviteError('الاسم يجب أن يكون حرفين على الأقل.')
      return
    }
    if (!inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail.trim())) {
      setInviteError('البريد الإلكتروني غير صحيح.')
      return
    }
    if (emailTaken(normalizeEmail(inviteEmail.trim()))) {
      setInviteError('هذا البريد مسجل مسبقاً. أرسل دعوة بريد إلكتروني مختلف.')
      return
    }

    setLoading(true)
    window.setTimeout(() => {
      createInvitation(
        business.id,
        business.name,
        inviteRole,
        inviteEmail.trim(),
        inviteRole === 'staff' ? inviteLocId : undefined,
        inviteRole === 'staff' ? business.locations.find((l) => l.id === inviteLocId)?.name : undefined,
      )
      toast('تم إرسال الدعوة.')
      refresh()
      resetInvite()
    }, 400)
  }

  const handleEditRole = (account: Account, newRole: AccountRole) => {
    if (newRole === 'owner') return
    setLoading(true)
    window.setTimeout(() => {
      updateAccountRole(account.id, newRole)
      toast('تم تحديث الدور.')
      refresh()
      setModal(null)
      setLoading(false)
    }, 300)
  }

  const handleRemove = (account: Account) => {
    setLoading(true)
    window.setTimeout(() => {
      removeAccountFromBusiness(account.id)
      toast('تم إزالة العضو.')
      refresh()
      setModal(null)
      setLoading(false)
    }, 300)
  }

  const handleRevoke = (inv: Invitation) => {
    revokeInvitation(inv.id)
    toast('تم إلغاء الدعوة.')
    refresh()
  }

  const activeInvites = invitations.filter((i) => i.status === 'pending')
  const teamMembers = members.filter((a) => a.role !== 'owner')

  return (
    <>
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          {teamMembers.length} {teamMembers.length === 1 ? 'عضو' : 'أعضاء'}
        </span>
        <div style={{ flex: 1 }} />
        {canManage && (
          <button className="dash-quick-btn primary" type="button" onClick={() => setModal({ kind: 'invite' })}>
            <Plus /> دعوة عضو
          </button>
        )}
      </div>

      {/* ── Invite modal ── */}
      {modal?.kind === 'invite' && (
        <div className="dash-overlay open" onClick={resetInvite}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 480, margin: '8vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Mail /> دعوة عضو</span>
              <button className="dash-section-action" type="button" onClick={resetInvite} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <form onSubmit={handleInvite} noValidate style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelS}>الاسم *</label>
                <input type="text" value={inviteName} onChange={(e) => { setInviteName(e.target.value); if (inviteError) setInviteError('') }} placeholder="الاسم الكامل" style={inputS(inviteError)} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelS}>البريد الإلكتروني *</label>
                <input type="email" value={inviteEmail} onChange={(e) => { setInviteEmail(e.target.value); if (inviteError) setInviteError('') }} placeholder="email@example.com" style={inputS(inviteError)} />
                {inviteError && <span style={errS}>{inviteError}</span>}
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelS}>الدور</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['admin', 'staff'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setInviteRole(r)}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 10, border: `1px solid ${inviteRole === r ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
                        background: inviteRole === r ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                        color: inviteRole === r ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {ROLE_AR[r]}
                    </button>
                  ))}
                </div>
              </div>
              {inviteRole === 'staff' && business.locations.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelS}>الموقع</label>
                  <select value={inviteLocId} onChange={(e) => setInviteLocId(e.target.value)} style={inputS('')}>
                    {business.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="submit" disabled={loading} style={primaryBtnS}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ الإرسال...</> : <><CheckCircle2 /> إرسال الدعوة</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={resetInvite} disabled={loading} style={secondaryBtnS}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit role modal ── */}
      {modal?.kind === 'edit-role' && (
        <div className="dash-overlay open" onClick={() => setModal(null)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Pencil /> تعديل الدور</span>
              <button className="dash-section-action" type="button" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 14px', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                تغيير دور <strong>{modal.account.fullName}</strong>:
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                {(['admin', 'staff'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleEditRole(modal.account, r)}
                    disabled={loading}
                    style={{
                      flex: 1, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--color-border-default)',
                      background: 'var(--color-surface)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {ROLE_AR[r]}
                  </button>
                ))}
              </div>
              <button className="btn btn-secondary" type="button" onClick={() => setModal(null)} style={{ ...secondaryBtnS, width: '100%' }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove modal ── */}
      {modal?.kind === 'remove' && (
        <div className="dash-overlay open" onClick={() => setModal(null)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '12vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head" style={{ borderBottomColor: 'var(--color-error-background)' }}>
              <span className="dash-section-title" style={{ color: 'var(--color-error)' }}><Trash2 /> إزالة العضو</span>
              <button className="dash-section-action" type="button" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 20px', color: 'var(--color-text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                هل أنت متأكد من إزالة "<strong>{modal.account.fullName}</strong>" من الفريق؟
              </p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleRemove(modal.account)}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-error)', color: '#fff' }}
                >
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ...</> : <><Trash2 /> إزالة</>}
                </button>
                <button type="button" onClick={() => setModal(null)} disabled={loading} style={secondaryBtnS}>إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending invitations ── */}
      {canManage && activeInvites.length > 0 && (
        <div className="dash-section" style={{ marginBottom: 20 }}>
          <div className="dash-section-head">
            <span className="dash-section-title"><Mail /> دعوات قيد الانتظار ({activeInvites.length})</span>
          </div>

          {/* Desktop table */}
          <div className="team-invite-table-wrap">
            <table className="team-invite-table">
              <thead>
                <tr>
                  <th>البريد الإلكتروني</th>
                  <th>الدور</th>
                  <th>الموقع</th>
                  <th>الانتهاء</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {activeInvites.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.email ?? 'دعوة عامة'}</td>
                    <td><span className="team-role-chip" style={{ background: ROLE_BG[inv.role] || 'var(--color-surface-subtle)', color: ROLE_COLOR[inv.role] || 'var(--color-text-secondary)' }}>{roleDisplay(inv.role)}</span></td>
                    <td>{inv.locationName || '—'}</td>
                    <td><span className="team-expiry"><Clock size={12} /> {fmtExpiry(inv.expiresAt)}</span></td>
                    <td>
                      <button type="button" onClick={() => handleRevoke(inv)} className="team-revoke-btn">إلغاء الدعوة</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="team-invite-cards">
            {activeInvites.map((inv) => (
              <div className="team-invite-card" key={inv.id}>
                <div className="team-invite-card-top">
                  <span className="team-role-chip" style={{ background: ROLE_BG[inv.role] || 'var(--color-surface-subtle)', color: ROLE_COLOR[inv.role] || 'var(--color-text-secondary)' }}>{roleDisplay(inv.role)}</span>
                  <button type="button" onClick={() => handleRevoke(inv)} className="team-revoke-btn">إلغاء الدعوة</button>
                </div>
                <div className="team-invite-card-row"><Mail size={13} /> {inv.email ?? 'دعوة عامة'}</div>
                {inv.locationName && <div className="team-invite-card-row"><MapPin size={13} /> {inv.locationName}</div>}
                <div className="team-invite-card-row"><Clock size={13} /> {fmtExpiry(inv.expiresAt)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Team members ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><UserCog /> أعضاء الفريق</span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-ic"><UserCog /></span>
            <p>لا يوجد أعضاء في الفريق بعد.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="team-table-wrap">
              <table className="team-table">
                <thead>
                  <tr>
                    <th>العضو</th>
                    <th>البريد الإلكتروني</th>
                    <th>الدور</th>
                    <th>الموقع</th>
                    <th>تاريخ الانضمام</th>
                    {canManage && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="team-member-cell">
                          <span className="team-avatar">{initials(m.fullName)}</span>
                          <span className="team-member-name">{m.fullName}</span>
                        </div>
                      </td>
                      <td dir="ltr">{m.email}</td>
                      <td>
                        <span className="team-role-chip" style={{ background: ROLE_BG[m.role] || 'var(--color-surface-subtle)', color: ROLE_COLOR[m.role] || 'var(--color-text-secondary)' }}>
                          {ROLE_AR[m.role]}
                        </span>
                      </td>
                      <td>{m.locationName || (m.role === 'staff' ? '—' : '—')}</td>
                      <td>{fmtDate(m.createdAt)}</td>
                      {canManage && (
                        <td>
                          <div className="team-actions">
                            <button type="button" title="تعديل الدور" onClick={() => setModal({ kind: 'edit-role', account: m })} className="team-action-btn">
                              <Pencil size={14} />
                            </button>
                            <button type="button" title="إزالة" onClick={() => setModal({ kind: 'remove', account: m })} className="team-action-btn danger">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="team-cards">
              {teamMembers.map((m) => (
                <div className="team-card" key={m.id}>
                  <div className="team-card-top">
                    <div className="team-member-cell">
                      <span className="team-avatar">{initials(m.fullName)}</span>
                      <div>
                        <div className="team-member-name">{m.fullName}</div>
                        <div className="team-card-meta">{ROLE_AR[m.role]}</div>
                      </div>
                    </div>
                    {canManage && (
                      <div className="team-actions">
                        <button type="button" title="تعديل الدور" onClick={() => setModal({ kind: 'edit-role', account: m })} className="team-action-btn">
                          <Pencil size={14} />
                        </button>
                        <button type="button" title="إزالة" onClick={() => setModal({ kind: 'remove', account: m })} className="team-action-btn danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="team-card-rows">
                    <div className="team-card-row"><Mail size={13} /> <span dir="ltr">{m.email}</span></div>
                    {m.locationName && <div className="team-card-row"><MapPin size={13} /> {m.locationName}</div>}
                    <div className="team-card-row"><CalendarDays size={13} /> انضم {fmtDate(m.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

const labelS: React.CSSProperties = { display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-secondary)' }
const inputS = (error: string): React.CSSProperties => ({
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border-default)'}`,
  fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
})
const errS: React.CSSProperties = { display: 'block', marginTop: 4, fontSize: '0.78rem', color: 'var(--color-error)' }
const primaryBtnS: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, border: 'none', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }
const secondaryBtnS: React.CSSProperties = { padding: '10px 20px', borderRadius: 10, border: '1px solid var(--color-border-default)', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', background: 'var(--color-surface)' }

export default TeamPage