type BrandIconProps = {
  size?: number
  variant?: 'dark' | 'light'
}

export function BrandIcon({ size = 40, variant = 'dark' }: BrandIconProps) {
  const bg = variant === 'dark' ? '#1D5655' : '#B0DEED'
  const mark = variant === 'dark' ? '#B0DEED' : '#0F2E2D'
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden="true">
      <rect x="2" y="2" width="40" height="40" rx="12" fill={bg} />
      <circle cx="15" cy="9.5" r="2.6" fill={mark} />
      <circle cx="29" cy="9.5" r="2.6" fill={mark} />
      <path
        d="M13 24 l6.5 6.5 L31 16.5"
        fill="none"
        stroke={mark}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type LogoLinkProps = {
  light?: boolean
  iconSize?: number
}

export function LogoLink({ light = false, iconSize = 40 }: LogoLinkProps) {
  return (
    <a className="logo" href="#hero" aria-label="حجزكوم — الرئيسية">
      <BrandIcon size={iconSize} variant={light ? 'light' : 'dark'} />
      <span className="logo-word" style={light ? { color: '#fff' } : undefined}>
        {light ? <b style={{ color: 'var(--color-secondary)' }}>حجز</b> : <b>حجز</b>}كوم
      </span>
    </a>
  )
}
