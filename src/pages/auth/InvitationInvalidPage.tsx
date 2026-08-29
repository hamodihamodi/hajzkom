import { AlarmClock, Ban, CheckCircle2, Lock, SearchX, Send } from 'lucide-react'
import { AuthShell } from './AuthShell'
import { getInviteInvalidReason, type Invitation } from '../../utils/invites'

interface InvitationInvalidPageProps {
  invitation: Invitation | null
}

const CONTENT = {
  expired: {
    icon: AlarmClock,
    title: 'انتهت صلاحية الدعوة',
    text: 'هذه الدعوة انتهت صلاحيتها. الدعوات صالحة لمدة يوم واحد فقط. اطلب من مدير النشاط إرسال دعوة جديدة.',
  },
  accepted: {
    icon: CheckCircle2,
    title: 'تم قبول هذه الدعوة',
    text: 'تم استخدام هذه الدعوة سابقاً وقبولها. يمكنك تسجيل الدخول للوصول إلى لوحة التحكم مباشرة.',
  },
  revoked: {
    icon: Ban,
    title: 'أُلغيَت هذه الدعوة',
    text: 'تم إلغاء هذه الدعوة من قبل مدير النشاط. تواصل معهم إذا كنت تعتقد أن هذا خطأ.',
  },
  'not-found': {
    icon: SearchX,
    title: 'الدعوة غير موجودة',
    text: 'لم نتمكن من العثور على هذه الدعوة. تأكد من صحة الرابط أو تواصل مع النشاط.',
  },
}

export function InvitationInvalidPage({ invitation }: InvitationInvalidPageProps) {
  const reason = getInviteInvalidReason(invitation)
  const { icon: Icon, title, text } = CONTENT[reason]
  const businessName = invitation?.businessName

  return (
    <AuthShell
      title={title}
      subtitle={businessName ? `الدعوة الخاصة بـ ${businessName}` : 'دعوة الانضمام'}
      footer={
        <p>
          ليس لديك حساب؟{' '}
          <a href="#/signup" className="auth-link">
            أنشئ حساب نشاطك
          </a>
        </p>
      }
    >
      <div className="auth-success">
        <span className="auth-suc-ic invalid-ic">
          <Icon />
        </span>
        <p>{text}</p>
        <a className="btn btn-primary btn-block" href="#/login">
          <Lock /> تسجيل الدخول
        </a>
        <button
          className="btn btn-ghost btn-block"
          type="button"
          style={{ marginTop: 10 }}
          onClick={() => {
            window.location.hash = '#/'
          }}
        >
          <Send /> تواصل مع النشاط
        </button>
      </div>
    </AuthShell>
  )
}

export default InvitationInvalidPage
