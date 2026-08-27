export type ToastOptions = {
  message: string
  ok?: boolean
}

const TOAST_EVENT = 'hajzkom:toast'

export function toast(message: string, ok = true): void {
  window.dispatchEvent(new CustomEvent<ToastOptions>(TOAST_EVENT, { detail: { message, ok } }))
}

export function toastSoon(): void {
  toast('هذه الصفحة قيد الإعداد — راسلنا على support@hajzkom.iq لأي استفسار.', false)
}

export function toastSocial(network: string): void {
  toast(`صفحتنا على ${network} قادمة قريباً.`, false)
}

export function subscribeToToasts(handler: (detail: ToastOptions) => void): () => void {
  const listener = (event: Event) => {
    const custom = event as CustomEvent<ToastOptions>
    handler(custom.detail)
  }
  window.addEventListener(TOAST_EVENT, listener)
  return () => window.removeEventListener(TOAST_EVENT, listener)
}
