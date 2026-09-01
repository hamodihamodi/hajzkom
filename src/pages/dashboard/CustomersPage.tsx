import { useMemo, useState } from 'react'
import { CalendarDays, FilterX, Mail, Phone, Search, Users } from 'lucide-react'
import { getAppointmentsForBusiness } from '../../utils/appointments'
import type { Business } from '../../utils/business'

interface Customer {
  key: string
  name: string
  phone: string
  email: string
  bookings: number
  lastDate: string
}

interface CustomersPageProps {
  business: Business
}

const PAGE_SIZE = 10

function normalize(s: string): string {
  return s.trim().toLowerCase()
}

function buildCustomers(business: Business): Customer[] {
  const appointments = getAppointmentsForBusiness(
    business.id,
    business.locations[0]?.id,
    business.locations[0]?.name,
  ).filter((a) => a.status !== 'cancelled')

  const map = new Map<string, Customer>()

  for (const a of appointments) {
    const name = a.customerName.trim()
    const phone = a.customerPhone.trim()
    const email = a.customerEmail.trim()
    if (!name && !phone && !email) continue

    const key = phone || email || `${name}|${a.createdAt}`
    const existing = map.get(key)

    if (existing) {
      existing.bookings += 1
      if (a.date > existing.lastDate) existing.lastDate = a.date
    } else {
      map.set(key, {
        key,
        name,
        phone,
        email,
        bookings: 1,
        lastDate: a.date,
      })
    }
  }

  return Array.from(map.values()).sort((x, y) =>
    y.lastDate.localeCompare(x.lastDate) || x.name.localeCompare(y.name),
  )
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat('ar-IQ', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
}

function maskPhone(phone: string): string {
  return phone.replace(/^(\+?\d{3})(\d{4})(\d{2,})$/, '$1 •••• $3')
}

export function CustomersPage({ business }: CustomersPageProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const allCustomers = useMemo(() => buildCustomers(business), [business])

  const filtered = useMemo(() => {
    const n = normalize(name)
    const p = normalize(phone)
    const e = normalize(email)
    if (!n && !p && !e) return allCustomers
    return allCustomers.filter((c) =>
      (!n || normalize(c.name).includes(n)) &&
      (!p || normalize(c.phone).includes(p)) &&
      (!e || normalize(c.email).includes(e)),
    )
  }, [allCustomers, name, phone, email])

  const shown = filtered.slice(0, visible)
  const hasFilters = Boolean(name.trim() || phone.trim() || email.trim())

  const clearFilters = () => {
    setName('')
    setPhone('')
    setEmail('')
    setVisible(PAGE_SIZE)
  }

  const loadMore = () => setVisible((v) => v + PAGE_SIZE)

  return (
    <>
      {/* ── Count + clear ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
          {filtered.length === 0 ? '0 زبون' : filtered.length === 1 ? 'زبون واحد' : `${filtered.length} زبون`}
        </span>
        <div style={{ flex: 1 }} />
        {hasFilters && (
          <button className="dash-quick-btn" type="button" onClick={clearFilters}>
            <FilterX /> مسح الفلاتر
          </button>
        )}
      </div>

      {/* ── Filters ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><Search /> البحث في الزبائن</span>
        </div>
        <div className="cust-filters">
          <div className="cust-field">
            <Phone className="cust-field-ic" size={15} />
            <input
              type="text"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setVisible(PAGE_SIZE) }}
              placeholder="بحث بالهاتف"
            />
          </div>
          <div className="cust-field">
            <Mail className="cust-field-ic" size={15} />
            <input
              type="text"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setVisible(PAGE_SIZE) }}
              placeholder="بحث بالبريد"
            />
          </div>
          <div className="cust-field cust-field-name">
            <Search className="cust-field-ic" size={15} />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setVisible(PAGE_SIZE) }}
              placeholder="بحث بالاسم"
            />
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <div className="dash-section">
        <div className="dash-section-head">
          <span className="dash-section-title"><Users /> قائمة الزبائن</span>
          {shown.length > 0 && (
            <span className="dash-section-action">{shown.length} من {filtered.length}</span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="dash-empty">
            <span className="dash-empty-ic"><Users /></span>
            <p>{hasFilters ? 'لا يوجد زبائن مطابقون للبحث.' : 'لا يوجد زبائن بعد. احجز أول موعد للبدء.'}</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="cust-table-wrap">
              <table className="cust-table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>الهاتف</th>
                    <th>البريد الإلكتروني</th>
                    <th>الحجوزات</th>
                    <th>آخر زيارة</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((c) => (
                    <tr key={c.key}>
                      <td className="cust-cell-name">
                        <span className="cust-avatar">{c.name.charAt(0) || '؟'}</span>
                        {c.name || '—'}
                      </td>
                      <td dir="ltr">{c.phone ? maskPhone(c.phone) : '—'}</td>
                      <td dir="ltr">{c.email || '—'}</td>
                      <td>
                        <span className="cust-badge">{c.bookings}</span>
                      </td>
                      <td>{fmtDate(c.lastDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="cust-cards">
              {shown.map((c) => (
                <div className="cust-card" key={c.key}>
                  <div className="cust-card-top">
                    <span className="cust-avatar">{c.name.charAt(0) || '؟'}</span>
                    <div className="cust-card-info">
                      <div className="cust-card-name">{c.name || '—'}</div>
                      <div className="cust-card-meta">
                        <CalendarDays size={12} /> {c.bookings} {c.bookings === 1 ? 'حجز' : 'حجوزات'} · آخر زيارة {fmtDate(c.lastDate)}
                      </div>
                    </div>
                  </div>
                  <div className="cust-card-rows">
                    {c.phone && (
                      <div className="cust-card-row"><Phone size={13} /><span dir="ltr">{maskPhone(c.phone)}</span></div>
                    )}
                    {c.email && (
                      <div className="cust-card-row"><Mail size={13} /><span dir="ltr">{c.email}</span></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {visible < filtered.length && (
              <div style={{ padding: '16px 20px', textAlign: 'center', borderTop: '1px solid var(--color-border-subtle)' }}>
                <button className="dash-quick-btn" type="button" onClick={loadMore}>
                  تحميل المزيد ({filtered.length - shown.length} متبقي)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}

export default CustomersPage
