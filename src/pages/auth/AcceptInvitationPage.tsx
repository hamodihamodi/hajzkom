import { useState } from 'react'
import { Briefcase, CalendarDays, CheckCircle2, MapPin, ShieldCheck, X } from 'lucide-react'
import { AuthShell } from './AuthShell'
import {
  lookupInvitation,
  isInviteValid,
  roleDisplay,
  type Invitation,
} from '../../utils/invites'

function readInviteId(): string | null {
  const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '')
  return params.get('invite')
}

const ARABIC_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']

function toArabicIndic(n: number): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  return String(n)
    .split('')
    .map((d) => map[Number(d)] ?? d)
    .join('')
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return `${toArabicIndic(d.getDate())} ${ARABIC_MONTHS[d.getMonth()]} ${toArabicIndic(d.getFullYear())}`
}

interface AcceptInvitationPageProps {
  invitationId?: string
}

export function AcceptInvitationPage({ invitationId }: AcceptInvitationPageProps) {
  const id = invitationId ?? readInviteId()
  const [invitation] = useState<Invitation | null>(() => (id ? lookupInvitation(id) : null))

  if (!invitation || !isInviteValid(invitation)) {
    return null
  }

  const handleAccept = () => {
    window.location.hash = `#/invite/${invitation.id}?login=1`
  }

  const handleDecline = () => {
    window.location.hash = '#/login'
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
            <span className="invite-k">صالحة حتى</span>
            <span className="invite-v">{formatDate(invitation.expiresAt)} · تنتهي خلال يوم</span>
          </div>
        </div>

        <button className="btn btn-primary btn-block btn-lg invite-cta" type="button" onClick={handleAccept}>
          <CheckCircle2 /> قبول الدعوة
        </button>
        <button className="btn btn-ghost btn-block" type="button" onClick={handleDecline}>
          <X /> رفض
        </button>
      </div>
    </AuthShell>
  )
}

export default AcceptInvitationPage
