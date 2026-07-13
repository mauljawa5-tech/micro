type LogoProps = {
  /** icon | wordmark | full */
  variant?: 'icon' | 'wordmark' | 'full'
  size?: number
  className?: string
  showText?: boolean
}

/** TXT brand logo — document T + on-chain node */
export default function Logo({
  variant = 'wordmark',
  size = 36,
  className = '',
  showText = true,
}: LogoProps) {
  if (variant === 'icon') {
    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TXT"
        role="img"
      >
        <rect width="64" height="64" rx="16" fill="#C6F700" />
        <path d="M20 22h24" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 22v22" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M22 36h10M22 41h16"
          stroke="#0A0A0A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="44" cy="44" r="4" fill="#0A0A0A" />
      </svg>
    )
  }

  if (variant === 'full') {
    const h = size
    const w = Math.round(size * 4.2)
    return (
      <svg
        className={className}
        width={w}
        height={h}
        viewBox="0 0 270 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="TXT Knowledge Protocol"
        role="img"
      >
        <rect x="0" y="0" width="64" height="64" rx="16" fill="#C6F700" />
        <path d="M20 22h24" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 22v22" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M22 36h10M22 41h16"
          stroke="#0A0A0A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="44" cy="44" r="4" fill="#0A0A0A" />
        <text
          x="80"
          y="32"
          fill="#FFFFFF"
          fontFamily="Space Grotesk, Inter, system-ui, sans-serif"
          fontSize="28"
          fontWeight="700"
          letterSpacing="-0.04em"
          dominantBaseline="middle"
        >
          TXT
        </text>
        <circle cx="148" cy="30" r="3.5" fill="#C6F700" />
        <text
          x="160"
          y="32"
          fill="#A0A0A0"
          fontFamily="Inter, system-ui, sans-serif"
          fontSize="11"
          fontWeight="600"
          letterSpacing="0.16em"
          dominantBaseline="middle"
        >
          KNOWLEDGE
        </text>
      </svg>
    )
  }

  // wordmark (nav default)
  return (
    <span
      className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="64" height="64" rx="16" fill="#C6F700" />
        <path d="M20 22h24" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M32 22v22" stroke="#0A0A0A" strokeWidth="3.5" strokeLinecap="round" />
        <path
          d="M22 36h10M22 41h16"
          stroke="#0A0A0A"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
        />
        <circle cx="44" cy="44" r="4" fill="#0A0A0A" />
      </svg>
      {showText && (
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.25rem',
            letterSpacing: '-0.02em',
            color: 'var(--white)',
          }}
        >
          TXT<em style={{ fontStyle: 'normal', color: 'var(--primary)' }}>.</em>
        </span>
      )}
    </span>
  )
}
