export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'no-show' | 'cancelled'

export interface Appointment {
  id: string
  businessId: string
  locationId: string
  locationName: string
  serviceId: string
  serviceName: string
  durationMin: number
  date: string
  time: string
  customerName: string
  customerPhone: string
  customerEmail: string
  customerNotes: string
  staffNotes: string
  status: AppointmentStatus
  createdAt: number
}

const KEY = 'hajzkom:appointments'

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dateOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function seed(): Appointment[] {
  const bizId = 'owner-seed'
  return [
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-1', serviceName: 'قص شعر', durationMin: 30,
      date: today(), time: '10:00', customerName: 'أحمد محمد', customerPhone: '+9647701234567',
      customerEmail: 'ahmed@example.com', customerNotes: 'يفضل مقعداً مظللاً',
      staffNotes: '', status: 'confirmed', createdAt: Date.now() - 86400000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-2', serviceName: 'صبغ شعر', durationMin: 90,
      date: today(), time: '11:30', customerName: 'سارة علي', customerPhone: '+9647709876543',
      customerEmail: 'sara@example.com', customerNotes: '',
      staffNotes: 'تفضل اللون البني الفاتح', status: 'pending', createdAt: Date.now() - 72000000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-1', serviceName: 'قص شعر', durationMin: 30,
      date: today(), time: '14:00', customerName: 'محمد حسن', customerPhone: '+9647705551234',
      customerEmail: 'mohammed@example.com', customerNotes: 'قصة رجالي عادية',
      staffNotes: '', status: 'confirmed', createdAt: Date.now() - 50000000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-3', serviceName: 'حلاقة', durationMin: 45,
      date: today(), time: '16:00', customerName: 'خالد عمر', customerPhone: '+9647701112233',
      customerEmail: '', customerNotes: '',
      staffNotes: '', status: 'pending', createdAt: Date.now() - 40000000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-2', serviceName: 'صبغ شعر', durationMin: 90,
      date: dateOffset(1), time: '09:00', customerName: 'نورة حسين', customerPhone: '+9647704445566',
      customerEmail: 'noura@example.com', customerNotes: '',
      staffNotes: '', status: 'confirmed', createdAt: Date.now() - 30000000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-1', serviceName: 'قص شعر', durationMin: 30,
      date: dateOffset(1), time: '11:00', customerName: 'يوسف إبراهيم', customerPhone: '+9647707778899',
      customerEmail: '', customerNotes: 'يحب الأطراف قصيرة',
      staffNotes: '', status: 'confirmed', createdAt: Date.now() - 20000000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-3', serviceName: 'حلاقة', durationMin: 45,
      date: dateOffset(2), time: '13:00', customerName: 'عمر سعيد', customerPhone: '+9647702223344',
      customerEmail: 'omar@example.com', customerNotes: '',
      staffNotes: '', status: 'pending', createdAt: Date.now() - 10000000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-1', serviceName: 'قص شعر', durationMin: 30,
      date: dateOffset(-1), time: '10:30', customerName: 'حسن كريم', customerPhone: '+9647706667788',
      customerEmail: '', customerNotes: '',
      staffNotes: 'تم الإنجاز', status: 'completed', createdAt: Date.now() - 172800000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-2', serviceName: 'صبغ شعر', durationMin: 90,
      date: dateOffset(-1), time: '15:00', customerName: 'ليلى أحمد', customerPhone: '+9647703334455',
      customerEmail: 'layla@example.com', customerNotes: '',
      staffNotes: '', status: 'no-show', createdAt: Date.now() - 172800000,
    },
    {
      id: makeId(), businessId: bizId, locationId: 'loc-1', locationName: 'الفرع الرئيسي',
      serviceId: 'svc-1', serviceName: 'قص شعر', durationMin: 30,
      date: dateOffset(-2), time: '09:30', customerName: 'سامر يوسف', customerPhone: '+9647708889900',
      customerEmail: '', customerNotes: '',
      staffNotes: 'تم الإلغاء من الزبون', status: 'cancelled', createdAt: Date.now() - 259200000,
    },
  ]
}

export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed()))
      return loadAppointments()
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return seed()
  }
}

function saveAll(list: Appointment[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getAppointmentById(id: string): Appointment | null {
  return loadAppointments().find((a) => a.id === id) ?? null
}

export function getAppointmentsForBusiness(businessId: string): Appointment[] {
  return loadAppointments().filter((a) => a.businessId === businessId)
}

export function updateAppointment(id: string, patch: Partial<Appointment>): Appointment | null {
  const list = loadAppointments()
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...patch }
  saveAll(list)
  return list[idx]
}

export function updateAppointmentStatus(id: string, status: AppointmentStatus): Appointment | null {
  return updateAppointment(id, { status })
}

export const STATUS_AR: Record<AppointmentStatus, string> = {
  confirmed: 'مؤكد',
  pending: 'قيد الانتظار',
  completed: 'مكتمل',
  'no-show': 'لم يحضر',
  cancelled: 'ملغى',
}

export const STATUS_COLORS: Record<AppointmentStatus, { bg: string; text: string }> = {
  confirmed: { bg: 'var(--color-success-background)', text: 'var(--color-success-text)' },
  pending: { bg: 'var(--color-warning-background)', text: 'var(--color-warning-text)' },
  completed: { bg: 'var(--color-info-background)', text: 'var(--color-info)' },
  'no-show': { bg: 'var(--color-error-background)', text: 'var(--color-error-text)' },
  cancelled: { bg: 'var(--color-surface-muted)', text: 'var(--color-text-disabled)' },
}
