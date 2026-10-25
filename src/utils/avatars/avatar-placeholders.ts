/**
 * Set determinístico de avatares com ilustrações vetoriais inspiradas em Sorocaba e exploração urbana.
 * Permite associar avatares visuais consistentes a usuários sem foto de perfil cadastrada.
 */

function createSvgDataUri(svgContent: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent.trim())}`;
}

const DETERMINISTIC_AVATARS: readonly string[] = [
  // 1. Bússola do Explorador (Índigo e Violeta)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5" />
          <stop offset="100%" stop-color="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg1)" />
      <circle cx="50" cy="50" r="32" stroke="#ffffff" stroke-opacity="0.3" stroke-width="2" fill="none" />
      <circle cx="50" cy="50" r="24" stroke="#ffffff" stroke-opacity="0.2" stroke-width="1.5" stroke-dasharray="3 3" fill="none" />
      <polygon points="50,22 56,46 50,42" fill="#ffffff" />
      <polygon points="50,22 44,46 50,42" fill="#c7d2fe" />
      <polygon points="50,78 56,54 50,58" fill="#c7d2fe" />
      <polygon points="50,78 44,54 50,58" fill="#ffffff" />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>
  `),

  // 2. Pin de Destino Urbano (Rosa e Coral)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#e11d48" />
          <stop offset="100%" stop-color="#f43f5e" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg2)" />
      <circle cx="50" cy="74" r="14" fill="#000000" fill-opacity="0.2" />
      <path d="M50 22 C37 22 27 32 27 45 C27 61 50 78 50 78 C50 78 73 61 73 45 C73 32 63 22 50 22 Z" fill="#ffffff" />
      <circle cx="50" cy="43" r="9" fill="#e11d48" />
    </svg>
  `),

  // 3. Parque das Águas & Natureza (Esmeralda e Menta)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#059669" />
          <stop offset="100%" stop-color="#10b981" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg3)" />
      <circle cx="50" cy="34" r="12" fill="#fef08a" />
      <path d="M18 72 C32 60 44 60 56 68 C68 76 80 72 88 64 L88 88 L18 88 Z" fill="#ffffff" fill-opacity="0.3" />
      <path d="M12 78 C28 68 46 68 60 76 C74 84 84 80 92 76 L92 92 L12 92 Z" fill="#ffffff" fill-opacity="0.4" />
      <path d="M28 58 L36 44 L44 58 Z" fill="#064e3b" />
      <path d="M38 60 L48 40 L58 60 Z" fill="#065f46" />
    </svg>
  `),

  // 4. Trilha & Colinas (Âmbar e Ocre)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#d97706" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg4)" />
      <circle cx="68" cy="30" r="10" fill="#fef3c7" />
      <polygon points="12,82 40,38 68,82" fill="#78350f" fill-opacity="0.6" />
      <polygon points="40,38 46,47 42,50 38,47" fill="#fef3c7" />
      <polygon points="42,82 66,48 90,82" fill="#92400e" fill-opacity="0.8" />
      <polygon points="66,48 71,55 68,58 64,55" fill="#fef3c7" />
    </svg>
  `),

  // 5. Skyline & Cidade (Azul Escuro e Safira)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg5" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e3a8a" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg5)" />
      <circle cx="28" cy="28" r="2" fill="#ffffff" fill-opacity="0.9" />
      <circle cx="76" cy="24" r="1.5" fill="#ffffff" fill-opacity="0.8" />
      <circle cx="64" cy="36" r="1.5" fill="#ffffff" fill-opacity="0.6" />
      <rect x="20" y="44" width="16" height="42" rx="2" fill="#1e293b" />
      <rect x="38" y="32" width="22" height="54" rx="2" fill="#0f172a" />
      <rect x="62" y="48" width="18" height="38" rx="2" fill="#1e293b" />
      <rect x="44" y="38" width="4" height="4" fill="#fde047" />
      <rect x="52" y="38" width="4" height="4" fill="#ffffff" fill-opacity="0.7" />
      <rect x="44" y="48" width="4" height="4" fill="#ffffff" fill-opacity="0.7" />
      <rect x="52" y="48" width="4" height="4" fill="#fde047" />
      <rect x="24" y="52" width="3" height="3" fill="#fde047" />
      <rect x="68" y="56" width="3" height="3" fill="#ffffff" fill-opacity="0.7" />
    </svg>
  `),

  // 6. Ciclovia & Mobilidade Urbana (Ciano e Turquesa)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg6" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0891b2" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg6)" />
      <circle cx="34" cy="62" r="14" stroke="#ffffff" stroke-width="3" fill="none" />
      <circle cx="66" cy="62" r="14" stroke="#ffffff" stroke-width="3" fill="none" />
      <circle cx="50" cy="62" r="3" fill="#ffffff" />
      <polyline points="34,62 50,62 44,44 32,44" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <polyline points="50,62 60,44 66,62" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      <line x1="58" y1="44" x2="68" y2="44" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
      <line x1="40" y1="38" x2="48" y2="38" stroke="#ffffff" stroke-width="3" stroke-linecap="round" />
    </svg>
  `),

  // 7. Ponte Estaiada & Arquitetura (Cobalto e Índigo Suave)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg7" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4338ca" />
          <stop offset="100%" stop-color="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg7)" />
      <line x1="50" y1="18" x2="50" y2="76" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
      <line x1="50" y1="28" x2="18" y2="70" stroke="#c7d2fe" stroke-width="1.5" />
      <line x1="50" y1="38" x2="26" y2="70" stroke="#c7d2fe" stroke-width="1.5" />
      <line x1="50" y1="48" x2="34" y2="70" stroke="#c7d2fe" stroke-width="1.5" />
      <line x1="50" y1="28" x2="82" y2="70" stroke="#c7d2fe" stroke-width="1.5" />
      <line x1="50" y1="38" x2="74" y2="70" stroke="#c7d2fe" stroke-width="1.5" />
      <line x1="50" y1="48" x2="66" y2="70" stroke="#c7d2fe" stroke-width="1.5" />
      <rect x="10" y="70" width="80" height="6" rx="3" fill="#ffffff" />
    </svg>
  `),

  // 8. Pôr do Sol Urbano (Laranja e Pêssego)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg8" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ea580c" />
          <stop offset="100%" stop-color="#f97316" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg8)" />
      <circle cx="50" cy="52" r="20" fill="#fef08a" />
      <rect x="14" y="62" width="72" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.8" />
      <rect x="22" y="68" width="56" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.6" />
      <rect x="30" y="74" width="40" height="3" rx="1.5" fill="#ffffff" fill-opacity="0.4" />
      <rect x="38" y="80" width="24" height="2" rx="1" fill="#ffffff" fill-opacity="0.3" />
    </svg>
  `),

  // 9. Mirante Panorâmico (Púrpura e Magenta)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg9" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#9333ea" />
          <stop offset="100%" stop-color="#c026d3" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg9)" />
      <circle cx="50" cy="30" r="8" fill="#fdf4ff" />
      <path d="M42 44 L58 44 L55 78 L45 78 Z" fill="#581c87" />
      <line x1="36" y1="46" x2="64" y2="46" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
      <circle cx="50" cy="30" r="16" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="2 3" fill="none" opacity="0.6" />
      <path d="M20 80 Q50 68 80 80 L80 88 L20 88 Z" fill="#ffffff" fill-opacity="0.25" />
    </svg>
  `),

  // 10. Rio Sorocaba & Meandros (Verde Azulado e Petróleo)
  createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="bg10" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f766e" />
          <stop offset="100%" stop-color="#14b8a6" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="50" fill="url(#bg10)" />
      <path d="M15 28 Q45 36 35 56 T85 74" stroke="#ffffff" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.8" />
      <path d="M15 28 Q45 36 35 56 T85 74" stroke="#99f6e4" stroke-width="4" stroke-linecap="round" fill="none" />
      <circle cx="68" cy="28" r="4" fill="#fef08a" />
      <circle cx="28" cy="74" r="3" fill="#ffffff" opacity="0.6" />
    </svg>
  `),
] as const;

/**
 * Retorna uma URL data-uri de avatar vetorial determinístico baseado no identificador do usuário.
 * Garante que o mesmo ID ou e-mail receba consistentemente a mesma identidade visual.
 */
export function getDeterministicAvatar(
  identifier?: string | null,
): string {
  if (!identifier || identifier.trim().length === 0) return DETERMINISTIC_AVATARS[0];

  const normalizedIdentifier = identifier.trim().toLowerCase();
  let hashValue = 0;

  for (let characterIndex = 0; characterIndex < normalizedIdentifier.length; characterIndex += 1) {
    hashValue = (hashValue << 5) - hashValue + normalizedIdentifier.charCodeAt(characterIndex);
    hashValue |= 0;
  }

  const selectedAvatarIndex = Math.abs(hashValue) % DETERMINISTIC_AVATARS.length;
  return DETERMINISTIC_AVATARS[selectedAvatarIndex];
}
