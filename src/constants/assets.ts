export interface StockAsset {
  id: string;
  title: string;
  category: 'shapes' | 'stickers' | 'photos' | 'badges';
  src: string;
  width: number;
  height: number;
}

// Crisp embedded SVGs for instant drag-and-drop elements
export const SAMPLE_STICKERS: StockAsset[] = [
  {
    id: 'badge-sale',
    title: '50% OFF Sale Badge',
    category: 'stickers',
    width: 200,
    height: 200,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="90" fill="%238b5cf6" /><circle cx="100" cy="100" r="78" fill="none" stroke="%23f8fafc" stroke-width="4" stroke-dasharray="8 6"/><text x="100" y="88" fill="%23ffffff" font-size="28" font-weight="900" font-family="sans-serif" text-anchor="middle">SPECIAL</text><text x="100" y="125" fill="%23facc15" font-size="34" font-weight="900" font-family="sans-serif" text-anchor="middle">50% OFF</text><text x="100" y="148" fill="%23ffffff" font-size="16" font-weight="600" font-family="sans-serif" text-anchor="middle">LIMITED TIME</text></svg>`,
  },
  {
    id: 'badge-verified',
    title: 'Verified Quality',
    category: 'stickers',
    width: 200,
    height: 200,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><polygon points="100,10 125,40 165,30 170,70 200,95 185,130 200,170 160,180 140,210 100,195 60,210 40,180 0,170 15,130 0,95 30,70 35,30 75,40" fill="%2306b6d4" /><circle cx="100" cy="110" r="55" fill="%23ffffff"/><path d="M78 110 L92 124 L124 92" fill="none" stroke="%2306b6d4" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: 'badge-new',
    title: 'NEW Arrival Pill',
    category: 'stickers',
    width: 220,
    height: 90,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 90"><rect width="220" height="90" rx="45" fill="%23ec4899"/><text x="110" y="58" fill="%23ffffff" font-size="36" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="4">★ NEW ★</text></svg>`,
  },
  {
    id: 'badge-fire',
    title: 'Hot Deal Badge',
    category: 'stickers',
    width: 200,
    height: 200,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="85" fill="%23ef4444"/><circle cx="100" cy="100" r="70" fill="%23f97316"/><text x="100" y="95" fill="%23ffffff" font-size="28" font-weight="900" font-family="sans-serif" text-anchor="middle">TRENDING</text><text x="100" y="130" fill="%23fef08a" font-size="32" font-weight="900" font-family="sans-serif" text-anchor="middle">HOT DEAL</text></svg>`,
  },
  {
    id: 'badge-organic',
    title: '100% Organic Eco',
    category: 'stickers',
    width: 200,
    height: 200,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="85" fill="%2310b981"/><circle cx="100" cy="100" r="72" fill="none" stroke="%23ffffff" stroke-width="3" stroke-dasharray="6 6"/><text x="100" y="90" fill="%23ffffff" font-size="22" font-weight="700" font-family="sans-serif" text-anchor="middle">PURE NATURAL</text><text x="100" y="125" fill="%23ffffff" font-size="30" font-weight="900" font-family="sans-serif" text-anchor="middle">100% ECO</text></svg>`,
  },
  {
    id: 'badge-award',
    title: 'Top Creator Award',
    category: 'stickers',
    width: 200,
    height: 200,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="85" r="65" fill="%23f59e0b"/><polygon points="65,140 45,190 85,175 100,195 100,140" fill="%23d97706"/><polygon points="135,140 155,190 115,175 100,195 100,140" fill="%23b45309"/><circle cx="100" cy="85" r="50" fill="%23fbbf24"/><text x="100" y="80" fill="%2378350f" font-size="18" font-weight="800" font-family="sans-serif" text-anchor="middle">NO. 1</text><text x="100" y="105" fill="%2378350f" font-size="24" font-weight="900" font-family="sans-serif" text-anchor="middle">CHOICE</text></svg>`,
  },
];

// Curated high quality SVGs representing stock photos / themes for quick insertion
export const SAMPLE_PHOTOS: StockAsset[] = [
  {
    id: 'photo-cyberpunk',
    title: 'Cyberpunk Neon City',
    category: 'photos',
    width: 600,
    height: 400,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%23" stop-color="%231e1b4b"/><stop offset="50%23" stop-color="%234c1d95"/><stop offset="100%23" stop-color="%23be185d"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g1)"/><circle cx="480" cy="120" r="80" fill="%23ec4899" opacity="0.8"/><rect x="80" y="160" width="100" height="240" fill="%230f172a"/><rect x="220" y="110" width="120" height="290" fill="%23090d16"/><rect x="380" y="190" width="90" height="210" fill="%230f172a"/><rect x="100" y="180" width="12" height="20" fill="%2338bdf8"/><rect x="130" y="180" width="12" height="20" fill="%23f472b6"/><rect x="100" y="220" width="12" height="20" fill="%23facc15"/><rect x="250" y="140" width="18" height="25" fill="%23a855f7"/><rect x="290" y="140" width="18" height="25" fill="%2338bdf8"/><rect x="250" y="190" width="18" height="25" fill="%23f43f5e"/><line x1="0" y1="360" x2="600" y2="360" stroke="%2306b6d4" stroke-width="4"/><line x1="0" y1="380" x2="600" y2="380" stroke="%23ec4899" stroke-width="2"/></svg>`,
  },
  {
    id: 'photo-abstract-fluid',
    title: 'Cosmic Fluid Waves',
    category: 'photos',
    width: 600,
    height: 400,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="f1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%23" stop-color="%230369a1"/><stop offset="50%23" stop-color="%234338ca"/><stop offset="100%23" stop-color="%237e22ce"/></linearGradient></defs><rect width="600" height="400" fill="url(%23f1)"/><path d="M0,150 Q150,50 300,180 T600,140 L600,400 L0,400 Z" fill="%238b5cf6" opacity="0.6"/><path d="M0,230 Q200,320 400,200 T600,280 L600,400 L0,400 Z" fill="%2306b6d4" opacity="0.4"/><circle cx="150" cy="110" r="45" fill="%23f43f5e" opacity="0.75"/></svg>`,
  },
  {
    id: 'photo-sunset-minimal',
    title: 'Golden Sunset Horizon',
    category: 'photos',
    width: 600,
    height: 400,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><defs><linearGradient id="s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%23" stop-color="%23fdba74"/><stop offset="40%23" stop-color="%23f43f5e"/><stop offset="100%23" stop-color="%234c0519"/></linearGradient></defs><rect width="600" height="400" fill="url(%23s1)"/><circle cx="300" cy="200" r="90" fill="%23ffedd5" opacity="0.95"/><path d="M0,250 L160,180 L320,270 L480,160 L600,240 L600,400 L0,400 Z" fill="%231e1b4b" opacity="0.9"/></svg>`,
  },
  {
    id: 'photo-workspace-tech',
    title: 'Modern Minimal Desk',
    category: 'photos',
    width: 600,
    height: 400,
    src: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"><rect width="600" height="400" fill="%231e293b"/><rect x="120" y="100" width="360" height="210" rx="12" fill="%230f172a" stroke="%2338bdf8" stroke-width="4"/><polygon points="260,310 340,310 360,360 240,360" fill="%23334155"/><rect x="150" y="130" width="140" height="15" rx="4" fill="%2338bdf8"/><rect x="150" y="160" width="220" height="8" rx="4" fill="%2364748b"/><rect x="150" y="180" width="180" height="8" rx="4" fill="%2364748b"/><rect x="150" y="200" width="260" height="8" rx="4" fill="%2364748b"/><rect x="150" y="230" width="90" height="30" rx="6" fill="%238b5cf6"/></svg>`,
  },
];
