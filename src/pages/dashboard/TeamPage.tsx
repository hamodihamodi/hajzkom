import { useState, type FormEvent } from 'react'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Link2,
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
  updateAccountRoleAndLocation,
  removeAccountFromBusiness,
  emailTaken,
  normalizeEmail,
  seedDefaultMembers,
} from '../../utils/accounts'
import {
  createInvitation,
  revokeInvitation,
  getBusinessInvitations,
  roleDisplay,
  displayStatus,
  INVITATION_STATUS_AR,
} from '../../utils/invites'
import type { Business } from '../../utils/business'
import { staffLimitForPlan } from '../../utils/business'
import type { Invitation, InvitationDisplayStatus } from '../../utils/invites'
import { ConfirmDialog, EmptyStateView } from '../../components/ui/UiStates'

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

const INV_STATUS_TONE: Record<InvitationDisplayStatus, { bg: string; text: string; border?: string }> = {
  pending: { bg: 'var(--color-warning-background)', text: 'var(--color-warning-text)' },
  accepted: { bg: 'var(--color-info-background)', text: 'var(--color-info)' },
  expired: { bg: 'var(--color-surface-muted)', text: 'var(--color-text-disabled)' },
  revoked: { bg: 'var(--color-error-background)', text: 'var(--color-error-text)' },
  not_found: { bg: 'transparent', text: 'var(--color-text-disabled)', border: '1px dashed var(--color-border-default)' },
}

interface TeamPageProps {
  session: Session
  business: Business
  onRefresh: () => void
}

type ModalState =
  | null
  | { kind: 'invite' }
  | { kind: 'edit-member'; account: Account }
  | { kind: 'confirm-remove'; account: Account }

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

  const [members, setMembers] = useState<Account[]>(() =>
    seedDefaultMembers(business.id, business.locations[0]?.id, business.locations[0]?.name),
  )
  const [invitations, setInvitations] = useState<Invitation[]>(() => getBusinessInvitations(business.id, business.name))
  const [modal, setModal] = useState<ModalState>(null)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'staff'>('staff')
  const [inviteLocId, setInviteLocId] = useState(business.locations[0]?.id ?? '')
  const [inviteError, setInviteError] = useState('')
  const [loading, setLoading] = useState(false)
  const [editRole, setEditRole] = useState<'admin' | 'staff'>('staff')
  const [editLocId, setEditLocId] = useState('')
  const [editError, setEditError] = useState('')

  const staffCount = members.filter((a) => a.role === 'staff').length
  const staffLimit = staffLimitForPlan(business.plan)
  const staffAtLimit = Number.isFinite(staffLimit) && staffCount >= staffLimit

  const refresh = () => {
    setMembers(getTeamMembers(business.id))
    setInvitations(getBusinessInvitations(business.id, business.name))
    onRefresh()
  }

  const resetInvite = () => {
    setInviteEmail('')
    setInviteRole('staff')
    setInviteLocId(business.locations[0]?.id ?? '')
    setInviteError('')
    setModal(null)
    setLoading(false)
  }

  const handleInvite = (e: FormEvent) => {
    e.preventDefault()
    if (inviteRole === 'staff' && staffAtLimit) {
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

  const openEdit = (account: Account) => {
    setEditRole(account.role === 'owner' ? 'admin' : (account.role === 'staff' ? 'staff' : 'admin'))
    setEditLocId(account.locationId || business.locations[0]?.id || '')
    setEditError('')
    setModal({ kind: 'edit-member', account })
  }

  const handleSaveEdit = (account: Account) => {
    if (editRole === 'staff' && editLocId && !business.locations.some((l) => l.id === editLocId)) {
      setEditError('يرجى اختيار موقع صحيح.')
      return
    }
    const loc = business.locations.find((l) => l.id === editLocId)
    setLoading(true)
    window.setTimeout(() => {
      updateAccountRoleAndLocation(
        account.id,
        editRole,
        editRole === 'staff' ? { locationId: loc?.id, locationName: loc?.name } : undefined,
      )
      toast('تم حفظ التغييرات.')
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

  const handleCopyInvite = (inv: Invitation) => {
    const url = `${window.location.origin}${window.location.pathname}#/invite/${inv.id}`
    window.navigator.clipboard?.writeText(url).then(
      () => toast('تم نسخ رابط الدعوة.'),
      () => toast('انسخ الرابط يدوياً: ' + url, false),
    )
  }

  const ghostInvite: Invitation = {
    id: 'inv-not-found-demo',
    businessId: business.id,
    businessName: business.name,
    role: 'staff',
    status: 'pending',
    createdAt: Date.now() - 2 * 86400000,
    expiresAt: Date.now() - 86400000,
    email: 'deleted@example.com',
  }

  const inviteRows: { key: string; inv: Invitation; status: InvitationDisplayStatus }[] = [
    ...invitations.map((inv) => ({ key: inv.id, inv, status: displayStatus(inv) })),
    { key: ghostInvite.id, inv: ghostInvite, status: 'not_found' },
  ]

  const statusCounts = { pending: 0, accepted: 0, expired: 0, revoked: 0, not_found: 0 } as Record<InvitationDisplayStatus, number>
  inviteRows.forEach((row) => { statusCounts[row.status] += 1 })
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
              {inviteRole === 'staff' && staffAtLimit ? (
                <div className="team-upgrade">
                  <span className="team-upgrade-ic"><Crown /></span>
                  <div>
                    <h4>وصلت حد الموظفين</h4>
                    <p>
                      خطتك الحالية ({business.plan === 'free' ? 'المجانية' : business.plan === 'pro' ? 'الاحترافية' : 'ماكس'}) تسمح بـ {staffLimit} {staffLimit === 1 ? 'موظف' : 'موظفين'}. قم بالترقية لإضافة المزيد.
                    </p>
                    <button className="btn btn-primary" type="button" onClick={() => { toast('الترقية قيد التطوير.'); }} style={upgradeBtnS}>
                      <Crown /> ترقية الخطة
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {inviteRole === 'staff' && business.locations.length > 0 && (
                    <div style={{ marginBottom: 14 }}>
                      <label style={labelS}>الموقع *</label>
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
                </>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ── Edit member modal ── */}
      {modal?.kind === 'edit-member' && (
        <div className="dash-overlay open" onClick={() => setModal(null)}>
          <div className="dash-section" style={{ position: 'relative', width: '100%', maxWidth: 440, margin: '10vh auto', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
            <div className="dash-section-head">
              <span className="dash-section-title"><Pencil /> تعديل العضو</span>
              <button className="dash-section-action" type="button" onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X /></button>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
                تعديل بيانات <strong>{modal.account.fullName}</strong>
              </p>

              <div style={{ marginBottom: 14 }}>
                <label style={labelS}>الدور</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['admin', 'staff'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setEditRole(r); setEditError('') }}
                      disabled={loading}
                      style={{
                        flex: 1, padding: '10px 12px', borderRadius: 10, border: `1px solid ${editRole === r ? 'var(--color-primary)' : 'var(--color-border-default)'}`,
                        background: editRole === r ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                        color: editRole === r ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {ROLE_AR[r]}
                    </button>
                  ))}
                </div>
              </div>

              {editRole === 'staff' && business.locations.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelS}>الموقع</label>
                  <select value={editLocId} onChange={(e) => { setEditLocId(e.target.value); setEditError('') }} style={inputS(editError)}>
                    {business.locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                  {editError && <span style={errS}>{editError}</span>}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" type="button" disabled={loading} onClick={() => handleSaveEdit(modal.account)} style={primaryBtnS}>
                  {loading ? <><Loader2 className="auth-spin" /> جارٍ الحفظ...</> : <><CheckCircle2 /> حفظ</>}
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setModal(null)} disabled={loading} style={secondaryBtnS}>إلغاء</button>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle)', margin: '18px 0 14px' }} />
              <button
                type="button"
                disabled={loading}
                onClick={() => setModal({ kind: 'confirm-remove', account: modal.account })}
                className="team-remove-btn"
              >
                <Trash2 size={14} /> إزالة من النشاط
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Remove confirmation modal ── */}
      {modal?.kind === 'confirm-remove' && (
        <ConfirmDialog
          open
          title="إزالة العضو"
          tone="danger"
          confirmLabel="نعم، إزالة"
          cancelLabel="تراجع"
          loading={loading}
          showIcon={<Trash2 size={16} />}
          onConfirm={() => handleRemove(modal.account)}
          onCancel={() => setModal({ kind: 'edit-member', account: modal.account })}
          message={
            <p style={{ margin: 0 }}>
              هل أنت متأكد من إزالة "<strong>{modal.account.fullName}</strong>" من النشاط؟ سيتم إلغاء وصوله إلى لوحة التحكم.
            </p>
          }
        />
      )}

      {/* ── Team invitations (all states) ── */}
      {canManage && (
        <div className="dash-section" style={{ marginBottom: 20 }}>
          <div className="dash-section-head">
            <span className="dash-section-title"><Mail /> دعوات الفريق ({inviteRows.length})</span>
          </div>

          <div className="team-inv-legend">
            {(Object.keys(INVITATION_STATUS_AR) as InvitationDisplayStatus[]).map((key) => (
              <span key={key} className="team-inv-legend-chip">
                <span className="team-inv-status" style={INV_STATUS_TONE[key]}>{INVITATION_STATUS_AR[key]}</span>
                <span className="team-inv-legend-count">{statusCounts[key]}</span>
              </span>
            ))}
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
                  <th>الحالة</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {inviteRows.map((row) => (
                  <tr key={row.key}>
                    <td style={row.status === 'not_found' ? { color: 'var(--color-text-disabled)', textDecoration: 'line-through' } : undefined}>
                      {row.inv.email ?? 'دعوة عامة'}
                    </td>
                    <td>
                      <span className="team-role-chip" style={{ background: ROLE_BG[row.inv.role] || 'var(--color-surface-subtle)', color: ROLE_COLOR[row.inv.role] || 'var(--color-text-secondary)' }}>
                        {roleDisplay(row.inv.role)}
                      </span>
                    </td>
                    <td>{row.inv.locationName || '—'}</td>
                    <td>
                      <span className="team-expiry"><Clock size={12} /> {row.status === 'not_found' ? '—' : fmtExpiry(row.inv.expiresAt)}</span>
                    </td>
                    <td>
                      <span className="team-inv-status" style={INV_STATUS_TONE[row.status]}>{INVITATION_STATUS_AR[row.status]}</span>
                    </td>
                    <td>
                      {row.status === 'pending' && (
                        <div className="team-inv-actions">
                          <button type="button" title="نسخ رابط الدعوة" onClick={() => handleCopyInvite(row.inv)} className="team-copy-btn"><Copy size={13} /> نسخ الرابط</button>
                          <button type="button" onClick={() => handleRevoke(row.inv)} className="team-revoke-btn">إلغاء الدعوة</button>
                        </div>
                      )}
                      {row.status === 'not_found' && (
                        <a className="team-inv-link" href={`#/invite/${row.inv.id}`} title="عرض رسالة هذه الحالة">
                          <Link2 size={13} /> عرض رسالة الحالة
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="team-invite-cards">
            {inviteRows.map((row) => (
              <div className="team-invite-card" key={row.key}>
                <div className="team-invite-card-top">
                  <span className="team-role-chip" style={{ background: ROLE_BG[row.inv.role] || 'var(--color-surface-subtle)', color: ROLE_COLOR[row.inv.role] || 'var(--color-text-secondary)' }}>
                    {roleDisplay(row.inv.role)}
                  </span>
                  {row.status === 'pending' && (
                    <div className="team-inv-actions">
                      <button type="button" title="نسخ رابط الدعوة" onClick={() => handleCopyInvite(row.inv)} className="team-copy-btn"><Copy size={13} /></button>
                      <button type="button" onClick={() => handleRevoke(row.inv)} className="team-revoke-btn">إلغاء الدعوة</button>
                    </div>
                  )}
                  {row.status === 'not_found' && (
                    <a className="team-inv-link" href={`#/invite/${row.inv.id}`} title="عرض رسالة هذه الحالة">
                      <Link2 size={13} /> عرض رسالة الحالة
                    </a>
                  )}
                </div>
                <div className="team-invite-card-row"><Mail size={13} /> {row.inv.email ?? 'دعوة عامة'}</div>
                {row.inv.locationName && <div className="team-invite-card-row"><MapPin size={13} /> {row.inv.locationName}</div>}
                <div className="team-invite-card-row"><Clock size={13} /> {row.status === 'not_found' ? '—' : fmtExpiry(row.inv.expiresAt)}</div>
                <div className="team-invite-card-row">
                  <span className="team-inv-status" style={INV_STATUS_TONE[row.status]}>{INVITATION_STATUS_AR[row.status]}</span>
                </div>
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
          <EmptyStateView
            icon={<UserCog size={22} />}
            title="لا يوجد أعضاء في الفريق بعد"
            message="ابدأ بإرسال دعوة إلى فريقك للانضمام إلى نشاطك."
          />
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
                            <button type="button" title="تعديل العضو" onClick={() => openEdit(m)} className="team-action-btn">
                              <Pencil size={14} />
                            </button>
                            <button type="button" title="إزالة" onClick={() => setModal({ kind: 'confirm-remove', account: m })} className="team-action-btn danger">
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
                        <button type="button" title="تعديل العضو" onClick={() => openEdit(m)} className="team-action-btn">
                          <Pencil size={14} />
                        </button>
                        <button type="button" title="إزالة" onClick={() => setModal({ kind: 'confirm-remove', account: m })} className="team-action-btn danger">
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
const upgradeBtnS: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: 4 }

export default TeamPage