export type AuthModalMode = 'login' | 'signup'

export type AuthModalOptions = {
  mode: AuthModalMode
  plan?: string
}

const AUTH_EVENT = 'hajzkom:auth-modal'

export function openLoginModal(): void {
  window.dispatchEvent(new CustomEvent<AuthModalOptions>(AUTH_EVENT, { detail: { mode: 'login' } }))
}

export function openSignupModal(plan?: string): void {
  window.dispatchEvent(new CustomEvent<AuthModalOptions>(AUTH_EVENT, { detail: { mode: 'signup', plan } }))
}

export function subscribeToAuthModal(handler: (detail: AuthModalOptions) => void): () => void {
  const listener = (event: Event) => {
    const custom = event as CustomEvent<AuthModalOptions>
    handler(custom.detail)
  }
  window.addEventListener(AUTH_EVENT, listener)
  return () => window.removeEventListener(AUTH_EVENT, listener)
}
