export function SarayLogo({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 200 60"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <linearGradient id="glassGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                    <stop offset="50%" style={{ stopColor: '#6366f1', stopOpacity: 0.9 }} />
                    <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                </linearGradient>

                <filter id="glassBlur">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
                </filter>

                <filter id="dropShadow">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="1" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Glass background shape */}
            <rect
                x="10"
                y="10"
                width="180"
                height="40"
                rx="20"
                fill="url(#glassGradient)"
                opacity="0.15"
                filter="url(#glassBlur)"
            />

            {/* Main text - Saray in English */}
            <g filter="url(#dropShadow)">
                <text
                    x="100"
                    y="42"
                    fontFamily="'Inter', 'Cairo', sans-serif"
                    fontSize="32"
                    fontWeight="800"
                    fill="url(#glassGradient)"
                    textAnchor="middle"
                    letterSpacing="1"
                    style={{ filter: 'drop-shadow(0 1px 3px rgba(99, 102, 241, 0.25))' }}
                >
                    Saray
                </text>
            </g>

            {/* Glass highlight effect */}
            <ellipse
                cx="100"
                cy="18"
                rx="70"
                ry="8"
                fill="white"
                opacity="0.25"
                filter="url(#glassBlur)"
            />
        </svg>
    );
}
