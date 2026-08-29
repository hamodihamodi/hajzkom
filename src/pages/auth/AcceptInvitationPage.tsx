import { useEffect, useState } from 'react'
import { Briefcase, CalendarDays, CheckCircle2, MapPin, ShieldCheck, X } from 'lucide-react'
import { AuthShell } from './AuthShell'
import {
  lookupInvitation,
  isInviteValid,
  markInvitationAccepted,
  roleDisplay,
  type Invitation,
} from '../../utils/invites'
import { attachInvitation, getSession } from '../../utils/accounts'

function readInviteId(): string | null {
  const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  return params.get('invite')
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })
}

interface AcceptInvitationPageProps {
  invitationId?: string
}

export function AcceptInvitationPage({ invitationId }: AcceptInvitationPageProps) {
  const id = invitationId ?? readInviteId()
  const [invitation] = useState<Invitation | null>(() => (id ? lookupInvitation(id) : null))
  const [accepted, setAccepted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!id || accepted) return
    const session = getSession()
    if (!session) {
      window.location.hash = `#/login?invite=${encodeURIComponent(id)}`
      return
    }
    if (!invitation || !isInviteValid(invitation)) {
      window.location.hash = `#/invite/${encodeURIComponent(id)}`
    }
  }, [id, accepted, invitation])

  if (!invitation || !isInviteValid(invitation)) {
    return null
  }

  const handleAccept = () => {
    setBusy(true)
    window.setTimeout(() => {
      const session = getSession()
      if (session) {
        attachInvitation(session.accountId, invitation.role, invitation.businessId)
      }
      markInvitationAccepted(invitation.id)
      setBusy(false)
      setAccepted(true)
    }, 900)
  }

  const handleDecline = () => {
    window.location.hash = '#/login'
  }

  if (accepted) {
    return (
      <AuthShell
        title="تم الانضمام"
        subtitle={`أصبحت الآن من فريق ${invitation.businessName}`}
        footer={
          <button type="button" className="auth-link" onClick={() => (window.location.hash = '#/login')}>
            العودة لتسجيل الدخول
          </button>
        }
      >
        <div className="auth-success">
          <span className="auth-suc-ic">
            <CheckCircle2 />
          </span>
          <p>تم قبول دعوتك. سيظهر لك جدول العمل والمهام الخاصة بدورك فور دخولك إلى لوحة التحكم.</p>
          <a href="#/dashboard" className="btn btn-primary btn-block">
            الانتقال إلى لوحة التحكم
          </a>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="دعوة للانضمام"
      subtitle={`تمت دعوتك للانضمام إلى ${invitation.businessName}`}
      footer={
        <button type="button" className="auth-link" onClick={handleDecline}>
          رفض الدعوة
        </button>
      }
    >
      <div className="invite-detail">
        <div className="invite-biz">
          <span className="invite-biz-logo">{invitation.businessName.charAt(0)}</span>
          <div>
            <strong>{invitation.businessName}</strong>
            <span>دعوة للانضمام لفريق العمل</span>
          </div>
        </div>

        <div className="invite-rows">
          <div className="invite-row">
            <span className="invite-ic">
              <Briefcase />
            </span>
            <span className="invite-k">الدور</span>
            <span className="invite-v">
              <span className="invite-role">
                <ShieldCheck /> {roleDisplay(invitation.role)}
              </span>
            </span>
          </div>
          {invitation.role === 'staff' && (
            <div className="invite-row">
              <span className="invite-ic">
                <MapPin />
              </span>
              <span className="invite-k">الفرع</span>
              <span className="invite-v">{invitation.locationName ?? 'غير محدد'}</span>
            </div>
          )}
          <div className="invite-row">
            <span className="invite-ic">
              <CalendarDays />
            </span>
            <span className="invite-k">تنتهي الدعوة</span>
            <span className="invite-v">{formatDate(invitation.expiresAt)} · صلاحية يوم واحد</span>
          </div>
        </div>

        <button className="btn btn-primary btn-block btn-lg invite-cta" type="button" onClick={handleAccept} disabled={busy}>
          {busy ? (
            <>جارٍ القبول...</>
          ) : (
            <>
              <CheckCircle2 /> قبول الدعوة
            </>
          )}
        </button>
        <button className="btn btn-ghost btn-block" type="button" onClick={handleDecline} disabled={busy}>
          <X /> رفض
        </button>
      </div>
    </AuthShell>
  )
}

export default AcceptInvitationPage
