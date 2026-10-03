interface TaplyLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
}

export function TaplyLogo({ size = 'md', showText = true }: TaplyLogoProps) {
  const dimensions = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 40, text: 'text-2xl' },
    lg: { icon: 64, text: 'text-4xl' },
  }

  const { icon, text } = dimensions[size]

  return (
    <div className="flex items-center gap-3">
      {/* Ícono SVG extraído del logo Taply */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="taplyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00cfff" />
            <stop offset="100%" stopColor="#00ff94" />
          </linearGradient>
        </defs>

        {/* Barra horizontal del T (redondeada) */}
        <rect x="20" y="18" width="160" height="38" rx="19" fill="url(#taplyGrad)" />

        {/* Palo vertical del T */}
        <rect x="88" y="56" width="24" height="80" rx="12" fill="url(#taplyGrad)" />

        {/* Punto inferior (NFC tap) */}
        <circle cx="100" cy="155" r="12" fill="url(#taplyGrad)" />

        {/* Ondas NFC izquierda */}
        <path
          d="M72 95 Q58 108 58 122"
          stroke="url(#taplyGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 82 Q38 100 38 122"
          stroke="url(#taplyGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />

        {/* Ondas NFC derecha */}
        <path
          d="M128 95 Q142 108 142 122"
          stroke="url(#taplyGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M140 82 Q162 100 162 122"
          stroke="url(#taplyGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>

      {/* Texto TAPLY con gradiente */}
      {showText && (
        <span
          className={`font-black tracking-widest ${text} taply-gradient-text`}
        >
          TAPLY
        </span>
      )}
    </div>
  )
}
