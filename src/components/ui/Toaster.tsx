import { useEffect, useState } from 'react'
import { Bell, CircleCheck } from 'lucide-react'
import { subscribeToToasts, type ToastOptions } from '../../utils/toast'

type ToastItem = ToastOptions & { id: number; hiding: boolean }

let nextId = 0

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    return subscribeToToasts((detail) => {
      const id = ++nextId
      setToasts((current) => [...current.slice(-3), { ...detail, ok: detail.ok !== false, id, hiding: false }])
      window.setTimeout(() => {
        setToasts((current) => current.map((t) => (t.id === id ? { ...t, hiding: true } : t)))
      }, 3600)
      window.setTimeout(() => {
        setToasts((current) => current.filter((t) => t.id !== id))
      }, 3980)
    })
  }, [])

  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((item) => (
        <div key={item.id} className={`toast${item.ok ? ' t-ok' : ''}${item.hiding ? ' hide' : ''}`}>
          {item.ok ? <CircleCheck /> : <Bell />}
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  )
}
