export default function AuthProductGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 800" className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="authGraphicBg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#eff6ff" />
          <stop offset="45%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <filter id="authGraphicShadowSm" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.06" />
        </filter>
        <filter id="authGraphicShadowLg" x="-20%" y="-30%" width="140%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
        <clipPath id="authGraphicCard1Clip">
          <rect x="40" y="96" width="560" height="172" rx="16" />
        </clipPath>
      </defs>

      <rect x="0" y="0" width="640" height="800" fill="url(#authGraphicBg)" />

      {/* Card 1: original resume */}
      <g filter="url(#authGraphicShadowLg)">
        <rect x="40" y="96" width="560" height="172" rx="16" fill="#ffffff" stroke="#e5e7eb" />
      </g>
      <g clipPath="url(#authGraphicCard1Clip)">
        <rect x="40" y="96" width="560" height="44" fill="#f3f4f6" />
      </g>
      <circle cx="60" cy="118" r="4" fill="#d1d5db" />
      <circle cx="74" cy="118" r="4" fill="#d1d5db" />
      <circle cx="88" cy="118" r="4" fill="#d1d5db" />
      <text x="104" y="122" fontFamily="Helvetica, Arial, sans-serif" fontSize="11" fill="#9ca3af">resume.pdf</text>

      <circle cx="78" cy="178" r="18" fill="#e5e7eb" />
      <path d="M73 170h7l4 4v12h-11z" fill="none" stroke="#9ca3af" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M80 170v4h4" fill="none" stroke="#9ca3af" strokeWidth="1.4" strokeLinejoin="round" />

      <rect x="116" y="166" width="120" height="10" rx="5" fill="#d1d5db" />
      <rect x="116" y="182" width="150" height="8" rx="4" fill="#e5e7eb" />

      <rect x="60" y="214" width="520" height="8" rx="4" fill="#f3f4f6" />
      <rect x="60" y="228" width="450" height="8" rx="4" fill="#f3f4f6" />
      <rect x="60" y="242" width="380" height="8" rx="4" fill="#f3f4f6" />

      {/* Connector 1: sparkle */}
      <circle cx="320" cy="305" r="18" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
      <path d="M320 296l2.2 5.8 5.8 2.2-5.8 2.2-2.2 5.8-2.2-5.8-5.8-2.2 5.8-2.2z" fill="#2563eb" />

      {/* Card 2: matching */}
      <g filter="url(#authGraphicShadowSm)">
        <rect x="40" y="343" width="560" height="118" rx="16" fill="#ffffff" stroke="#e5e7eb" />
      </g>
      <path d="M64 366h10v-3a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3h10v14h-28z" fill="none" stroke="#9ca3af" strokeWidth="1.4" strokeLinejoin="round" />
      <text x="100" y="381" fontFamily="Helvetica, Arial, sans-serif" fontSize="13" fontWeight="700" fill="#1f2937">Matching to:</text>
      <text x="182" y="381" fontFamily="Helvetica, Arial, sans-serif" fontSize="13" fill="#9ca3af">Product Manager, Series B startup</text>

      <text x="64" y="407" fontFamily="Helvetica, Arial, sans-serif" fontSize="10" fontWeight="700" letterSpacing="0.5" fill="#9ca3af">OPTIMIZE FOR WHICH SKILLS?</text>

      <g fontFamily="Helvetica, Arial, sans-serif" fontSize="11" fill="#4b5563">
        <rect x="64" y="418" width="140" height="26" rx="13" fill="#f9fafb" stroke="#e5e7eb" />
        <rect x="74" y="427" width="12" height="12" rx="3" fill="#2563eb" />
        <path d="M77 433l2 2 4-4" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="94" y="436">Product Management</text>

        <rect x="212" y="418" width="118" height="26" rx="13" fill="#f9fafb" stroke="#e5e7eb" />
        <rect x="222" y="427" width="12" height="12" rx="3" fill="#2563eb" />
        <path d="M225 433l2 2 4-4" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="242" y="436">Market Research</text>

        <rect x="338" y="418" width="66" height="26" rx="13" fill="#f9fafb" stroke="#e5e7eb" />
        <rect x="348" y="427" width="12" height="12" rx="3" fill="#2563eb" />
        <path d="M351 433l2 2 4-4" stroke="#ffffff" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="368" y="436">Agile</text>

        <rect x="412" y="418" width="112" height="26" rx="13" fill="#f9fafb" stroke="#e5e7eb" />
        <rect x="422" y="427" width="12" height="12" rx="3" fill="#ffffff" stroke="#d1d5db" />
        <text x="442" y="436">Data Analysis</text>
      </g>

      {/* Connector 2: arrow down */}
      <circle cx="320" cy="499" r="18" fill="#eff6ff" stroke="#2563eb" strokeWidth="2" />
      <path d="M320 491v14M314 499l6 6 6-6" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Card 3: refactored result */}
      <g filter="url(#authGraphicShadowLg)">
        <rect x="40" y="537" width="560" height="168" rx="16" fill="#ffffff" stroke="#e5e7eb" />
      </g>

      <circle cx="70" cy="565" r="8" fill="none" stroke="#16a34a" strokeWidth="1.6" />
      <path d="M66.5 565l2.5 2.5 5-5" fill="none" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="84" y="570" fontFamily="Helvetica, Arial, sans-serif" fontSize="14" fontWeight="700" fill="#1f2937">Refactored Resume</text>

      <rect x="490" y="553" width="86" height="24" rx="12" fill="#eff6ff" stroke="#dbeafe" />
      <path d="M508 561v3a3.5 3.5 0 0 0 3.5 3.5h0A3.5 3.5 0 0 0 515 564v-3l-3.5-1.4z" fill="none" stroke="#1d4ed8" strokeWidth="1.2" strokeLinejoin="round" />
      <text x="521" y="569" fontFamily="Helvetica, Arial, sans-serif" fontSize="10" fontWeight="700" fill="#1d4ed8">ATS-Ready</text>

      <rect x="64" y="589" width="512" height="42" rx="10" fill="#f0fdf4" stroke="#bbf7d0" />
      <path d="M84 601a6 6 0 0 1 12 0c0 4 2 5 2 5h-16s2-1 2-5z" fill="none" stroke="#16a34a" strokeWidth="1.3" strokeLinejoin="round" />
      <text x="108" y="614" fontFamily="Helvetica, Arial, sans-serif" fontSize="12" fill="#166534">Keyword optimization successful! Match increased by 35%</text>

      <rect x="64" y="649" width="146" height="34" rx="17" fill="#111827" />
      <path d="M92 660v10M87 666l5 5 5-5" fill="none" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <text x="106" y="670" fontFamily="Helvetica, Arial, sans-serif" fontSize="12" fontWeight="700" fill="#ffffff">Download Draft</text>
    </svg>
  );
}
