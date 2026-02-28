import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────
interface City { cityId: number; cityName: string }

interface RaynaTour {
  tourId: number
  countryId: number
  cityId: number
  cityName: string
  tourName: string
  reviewCount: number
  rating: number
  duration: string
  imagePath: string
  cityTourType: string
  contractId: number
  recommended: boolean
}

interface TourImage {
  imagePath: string
  imageCaptionName: string
  isFrontImage: number
}

interface TourDetail extends RaynaTour {
  tourLanguage: string
  tourDescription: string
  tourInclusion: string
  tourExclusion: string
  importantInformation: string
  childAge: string
  infantAge: string
  infantCount: number
  tourImages: TourImage[]
}

interface TourOption {
  tourOptionId: number
  tourOptionName: string
  adultPrice: number
  childPrice: number
  infantPrice: number
  transferOptionName?: string
  slotTime?: string
  isAvailable: boolean
  seatAvailable?: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BRAND = '#f27d26'

const getImg = (path: string) => {
  if (!path) return 'https://picsum.photos/seed/tour/800/500'
  return path.startsWith('http') ? path : `https://sandbox.raynatours.com/${path}`
}

const MOCK_OPTIONS: TourOption[] = [
  { tourOptionId: 1, tourOptionName: 'Standard – No Transfer',    adultPrice: 145, childPrice: 110, infantPrice: 0, transferOptionName: 'Without Transfer', isAvailable: true,  seatAvailable: 24 },
  { tourOptionId: 2, tourOptionName: 'VIP – With Hotel Transfer', adultPrice: 210, childPrice: 170, infantPrice: 0, transferOptionName: 'With Transfer',    isAvailable: true,  seatAvailable: 4  },
  { tourOptionId: 3, tourOptionName: 'Private Group',             adultPrice: 320, childPrice: 260, infantPrice: 0, transferOptionName: 'Without Transfer', isAvailable: false, seatAvailable: 0  },
]

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ onLogoClick }: { onLogoClick: () => void }) {
  return (
    <nav style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div onClick={onLogoClick} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
              RAYNA<span style={{ color: BRAND }}>B2B</span>
            </div>
            <div style={{ display: 'flex', gap: 3, marginTop: 1 }}>
              {['#ef4444','#facc15','#3b82f6','#22c55e'].map(c => (
                <div key={c} style={{ width: 5, height: 5, borderRadius: '50%', background: c }} />
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: 13, fontWeight: 600 }}>
            {['Destinations','Offers','Support'].map(l => (
              <a key={l} href="#" style={{ textDecoration: 'none', color: '#64748b' }}
                onMouseEnter={e => (e.currentTarget.style.color = BRAND)}
                onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>{l}</a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{ padding: '8px 18px', border: 'none', background: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Sign In</button>
          <button style={{ padding: '8px 20px', border: 'none', borderRadius: 8, background: BRAND, color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 14px ${BRAND}40` }}>Register Now</button>
        </div>
      </div>
    </nav>
  )
}

// ─── Home / Login ─────────────────────────────────────────────────────────────
function HomeView({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ background: '#0f172a', minHeight: 'calc(100vh - 64px)' }}>
      <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <img src="https://picsum.photos/seed/dubai-sky/1920/1080" alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #0f172a 45%, #0f172a55 70%, transparent)' }} />
        <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '60px 24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 48, alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ display: 'inline-block', background: BRAND, color: 'white', padding: '4px 16px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 24 }}>
              Trusted by 5,000+ Agents
            </div>
            <h1 style={{ fontSize: 64, fontWeight: 800, color: 'white', lineHeight: 1.08, marginBottom: 20 }}>
              The World of<br /><span style={{ color: BRAND }}>B2B Travel</span><br />Simplified.
            </h1>
            <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 480, lineHeight: 1.7, marginBottom: 32 }}>
              Exclusive rates for attractions, hotels, and tours across the UAE.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['🛡️ Verified Partners','⭐ Best Price Guarantee','🌍 1000+ Experiences'].map(l => (
                <div key={l} style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', padding: '8px 16px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 13, fontWeight: 500 }}>{l}</div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
            style={{ background: 'white', padding: 40, borderRadius: 32, boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Welcome Back</h2>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28 }}>Sign in to your agent portal</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Agent Code', icon: '👤', ph: 'Enter your code',  type: 'text'     },
                { label: 'Password',   icon: '🔒', ph: '••••••••',         type: 'password'  },
              ].map(({ label, icon, ph, type }) => (
                <div key={label}>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>{icon}</span>
                    <input type={type} placeholder={ph}
                      style={{ width: '100%', paddingLeft: 44, paddingRight: 16, paddingTop: 13, paddingBottom: 13, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = BRAND)}
                      onBlur={e  => (e.target.style.borderColor = '#e2e8f0')} />
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: BRAND }} /> Remember Me
                </label>
                <a href="#" style={{ color: BRAND, fontWeight: 700, textDecoration: 'none' }}>Forgot?</a>
              </div>
              <button onClick={onLogin}
                style={{ width: '100%', background: BRAND, color: 'white', border: 'none', padding: '15px 0', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: `0 8px 24px ${BRAND}40` }}>
                Sign In to Portal
              </button>
              <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
                Don't have an account? <a href="#" style={{ color: BRAND, fontWeight: 700, textDecoration: 'none' }}>Register</a>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Why Us */}
      <div style={{ background: '#f8fafc', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800 }}>Why Partner With Us?</h2>
            <p style={{ color: '#64748b', marginTop: 8 }}>The tools and rates you need to scale your travel business.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24 }}>
            {[
              { icon: '🛡️', title: 'Secure Payments', desc: 'Industry-leading security for all transactions.' },
              { icon: '🕐', title: '24/7 Support',    desc: 'Our dedicated team is always here to help.'   },
              { icon: '🌍', title: 'Global Reach',    desc: 'Access thousands of products across UAE.'      },
              { icon: '⭐', title: 'Best Rates',      desc: 'Exclusive B2B pricing you won\'t find elsewhere.' },
            ].map(item => (
              <div key={item.title} style={{ background: 'white', padding: 28, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{item.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardView({ onSearch, cities, loadingCities, selectedCity, onCityChange, selectedDate, onDateChange }:
  { onSearch: () => void; cities: City[]; loadingCities: boolean; selectedCity: string; onCityChange: (v: string) => void; selectedDate: string; onDateChange: (v: string) => void }
) {
  const [activeTab, setActiveTab] = useState('Activities')

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>
      {/* Sub bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '10px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, fontWeight: 700, color: '#64748b' }}>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span style={{ color: BRAND }}>📞 24/7 Support</span>
            <span style={{ color: BRAND }}>🌍 English (AED)</span>
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <span>R Points: <strong style={{ color: '#0f172a' }}>1,250</strong></span>
            <span>Credit: <strong style={{ color: '#0f172a' }}>AED 50k</strong></span>
            <span style={{ color: '#0f172a' }}>AGT-50660 ▾</span>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <img src="https://picsum.photos/seed/dubai2024/1920/800" alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.85) 30%, rgba(15,23,42,0.2) 70%, transparent)' }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'inline-block', background: BRAND, color: 'white', padding: '4px 14px', borderRadius: 99, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>New Attraction</div>
              <h1 style={{ fontSize: 54, fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 16 }}>Ain Dubai Experience</h1>
              <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 500, marginBottom: 28, lineHeight: 1.6 }}>The world's tallest observation wheel. Exclusive B2B rates from AED 130.</p>
              <button onClick={onSearch} style={{ background: BRAND, color: 'white', border: 'none', padding: '14px 36px', borderRadius: 12, fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: `0 8px 28px ${BRAND}50` }}>
                Book Now →
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div style={{ maxWidth: 1280, margin: '-96px auto 0', padding: '0 24px', position: 'relative', zIndex: 20 }}>
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.12)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', background: '#f8fafc', padding: 8, gap: 4 }}>
            {['Activities','Hotels','Packages','Transfers','Visa'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ flex: 1, padding: '10px 0', borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', background: activeTab === tab ? 'white' : 'transparent', color: activeTab === tab ? BRAND : '#64748b', boxShadow: activeTab === tab ? '0 2px 8px rgba(0,0,0,0.06)' : 'none' }}>
                {tab}
              </button>
            ))}
          </div>
          <div style={{ padding: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 16, alignItems: 'end' }}>
            {/* Destination */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Destination</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔍</span>
                <select value={selectedCity} onChange={e => onCityChange(e.target.value)} disabled={loadingCities}
                  style={{ width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 13, paddingBottom: 13, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                  onFocus={e => (e.target.style.borderColor = BRAND)} onBlur={e => (e.target.style.borderColor = '#e2e8f0')}>
                  <option value="">{loadingCities ? 'Loading cities…' : 'Select Destination'}</option>
                  {cities.map(c => <option key={c.cityId} value={c.cityId}>{c.cityName}</option>)}
                </select>
              </div>
            </div>
            {/* Date */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Travel Date</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>📅</span>
                <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={e => onDateChange(e.target.value)}
                  style={{ width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 13, paddingBottom: 13, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = BRAND)} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
              </div>
            </div>
            {/* Travelers */}
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Travelers</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>👥</span>
                <select style={{ width: '100%', paddingLeft: 42, paddingRight: 16, paddingTop: 13, paddingBottom: 13, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 14, outline: 'none', appearance: 'none', cursor: 'pointer' }}>
                  <option>1 Adult, 0 Child</option>
                  <option>2 Adults, 1 Child</option>
                  <option>Family Group</option>
                </select>
              </div>
            </div>
            <button onClick={onSearch}
              style={{ background: BRAND, color: 'white', border: 'none', padding: '14px 32px', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: `0 6px 20px ${BRAND}40`, whiteSpace: 'nowrap' }}>
              Search Results
            </button>
          </div>
        </div>
      </div>

      {/* Popular */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 34, fontWeight: 800 }}>Popular Experiences</h2>
            <p style={{ color: '#64748b', marginTop: 6 }}>Handpicked attractions with the best margins for you.</p>
          </div>
          <button style={{ color: BRAND, background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>View All →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20 }}>
          {[['Burj Khalifa','burj','145'],['Desert Safari','desert','95'],['Museum of Future','mofu','145'],['Ferrari World','ferrari','295']].map(([name, seed, price]) => (
            <motion.div key={name} whileHover={{ y: -8 }} onClick={onSearch}
              style={{ position: 'relative', height: 300, borderRadius: 24, overflow: 'hidden', cursor: 'pointer' }}>
              <img src={`https://picsum.photos/seed/${seed}/400/600`} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.9) 30%, transparent 70%)' }} />
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                <div style={{ color: 'white', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>From AED {price}</span>
                  <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>→</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Search Results ───────────────────────────────────────────────────────────
function SearchResultsView({ onBack, tours, cityName, loading, onTourClick }:
  { onBack: () => void; tours: RaynaTour[]; cityName: string; loading: boolean; onTourClick: (t: RaynaTour) => void }
) {
  const [search, setSearch] = useState('')
  const [cats, setCats]     = useState<string[]>([])
  const allCats = [...new Set(tours.map(t => t.cityTourType).filter(Boolean))]
  const filtered = tours.filter(t =>
    t.tourName?.toLowerCase().includes(search.toLowerCase()) &&
    (cats.length === 0 || cats.includes(t.cityTourType))
  )

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingBottom: 80 }}>
      {/* Breadcrumb */}
      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>← Dashboard</button>
            <span style={{ color: '#e2e8f0' }}>/</span>
            <span style={{ fontWeight: 700 }}>Tours & Sightseeing</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>{loading ? 'Searching…' : `${filtered.length} results for "${cityName}"`}</span>
            <button onClick={onBack} style={{ background: `${BRAND}15`, color: BRAND, border: `1px solid ${BRAND}30`, padding: '7px 18px', borderRadius: 12, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Modify Search</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }}>
        {/* Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Cart */}
          <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f8fafc', display: 'flex', justifyContent: 'space-between', background: '#f8fafc' }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>🛒 My Cart</span>
              <span style={{ background: BRAND, color: 'white', padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>1 Item</span>
            </div>
            <div style={{ padding: 18 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <img src="https://picsum.photos/seed/yacht/80/80" style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} alt="" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Lotus Mega Yacht Dinner</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 4 }}>VIP Ticket • No Transfer</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BRAND }}>AED 400.00</div>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f8fafc', paddingTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>Total</span>
                  <span style={{ fontWeight: 800 }}>AED 400.00</span>
                </div>
                <button style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '11px 0', borderRadius: 14, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Proceed to Checkout</button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {allCats.length > 0 && (
            <div style={{ background: 'white', borderRadius: 24, border: '1px solid #e2e8f0', padding: 20 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 15 }}>Categories</h3>
              {allCats.map(cat => (
                <label key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
                  <input type="checkbox" checked={cats.includes(cat)} onChange={() => setCats(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat])}
                    style={{ accentColor: BRAND, width: 16, height: 16 }} />
                  {cat}
                </label>
              ))}
            </div>
          )}
        </aside>

        {/* Grid */}
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800 }}>{cityName} Experiences</h2>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{loading ? 'Loading…' : `${filtered.length} activities found`}</p>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>🔍</span>
              <input placeholder="Search activities…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, paddingRight: 16, paddingTop: 10, paddingBottom: 10, border: '1.5px solid #e2e8f0', borderRadius: 14, fontSize: 13, outline: 'none', width: 240 }}
                onFocus={e => (e.target.style.borderColor = BRAND)} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
            </div>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{ background: 'white', borderRadius: 28, height: 340, animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 28, border: '2px dashed #e2e8f0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No activities found</h3>
              <p style={{ color: '#64748b' }}>Try selecting a different city.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {filtered.map((tour, idx) => (
                <motion.div key={tour.tourId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -8 }} onClick={() => onTourClick(tour)}
                  style={{ background: 'white', borderRadius: 28, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'box-shadow 0.3s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)')}>
                  <div style={{ position: 'relative', height: 200, overflow: 'hidden', background: '#f1f5f9' }}>
                    <img src={getImg(tour.imagePath)} alt={tour.tourName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId}/600/400` }} />
                    {tour.recommended && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>⭐ Recommended</div>
                    )}
                  </div>
                  <div style={{ padding: 18 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, lineHeight: 1.4 }}>{tour.tourName}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 12 }}>
                      {'★★★★★'.split('').map((_, i) => (
                        <span key={i} style={{ color: i < Math.floor(tour.rating || 4) ? BRAND : '#e2e8f0', fontSize: 12 }}>★</span>
                      ))}
                      <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 4 }}>{tour.reviewCount} Reviews</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f8fafc', paddingTop: 12 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Duration</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginTop: 2 }}>{tour.duration || '—'}</div>
                      </div>
                      {tour.cityTourType && (
                        <div style={{ background: `${BRAND}10`, color: BRAND, padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 700, alignSelf: 'center' }}>{tour.cityTourType}</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ─── Pax Counter ──────────────────────────────────────────────────────────────
function PaxCounter({ label, sublabel, count, onInc, onDec, min = 0 }:
  { label: string; sublabel: string; count: number; onInc: () => void; onDec: () => void; min?: number }
) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{sublabel}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onDec} disabled={count <= min}
          style={{ width: 32, height: 32, borderRadius: 9, border: '2px solid #e2e8f0', background: 'none', fontSize: 17, fontWeight: 700, cursor: count <= min ? 'not-allowed' : 'pointer', color: count <= min ? '#cbd5e1' : '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ width: 18, textAlign: 'center', fontWeight: 800, fontSize: 16 }}>{count}</span>
        <button onClick={onInc}
          style={{ width: 32, height: 32, borderRadius: 9, border: `2px solid ${BRAND}`, background: `${BRAND}12`, fontSize: 17, fontWeight: 700, cursor: 'pointer', color: BRAND, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
    </div>
  )
}

// ─── Availability Panel ───────────────────────────────────────────────────────
function AvailabilityPanel({ tour, selectedDate, onDateChange, onBook }:
  { tour: TourDetail; selectedDate: string; onDateChange: (d: string) => void; onBook: (opt: TourOption, pax: { adults: number; children: number; infants: number }) => void }
) {
  const [adults,  setAdults]  = useState(1)
  const [children,setChildren]= useState(0)
  const [infants, setInfants] = useState(0)
  const [options, setOptions] = useState<TourOption[]>([])
  const [loading, setLoading] = useState(false)
  const [searched,setSearched]= useState(false)
  const [selOpt,  setSelOpt]  = useState<TourOption | null>(null)
  const [error,   setError]   = useState('')

  const total = (opt: TourOption) => opt.adultPrice * adults + opt.childPrice * children + opt.infantPrice * infants

  const checkAvailability = async () => {
    setLoading(true); setSearched(true); setError(''); setOptions([]); setSelOpt(null)
    try {
      const { data } = await axios.post('/api/tour-options', {
        TourId: tour.tourId,
        ContractId: tour.contractId,
        TravelDate: selectedDate.replace(/-/g, '/'),
        AdultCount: adults, ChildCount: children, InfantCount: infants,
        CurrencyCode: 'AED', CountryId: tour.countryId, CityId: tour.cityId,
      })
      const status = data.statuscode ?? data.StatusCode
      const result = data.result ?? data.Result
      if (Number(status) === 200 && result?.length > 0) {
        setOptions(result); setSelOpt(result[0])
      } else { throw new Error('No options') }
    } catch {
      setError('Showing sample rates — live API not available.')
      setOptions(MOCK_OPTIONS); setSelOpt(MOCK_OPTIONS[0])
    } finally { setLoading(false) }
  }

  return (
    <div style={{ background: 'white', borderRadius: 32, boxShadow: '0 24px 64px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <div style={{ background: '#0f172a', padding: '26px 26px 22px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>Live Pricing</div>
        <h3 style={{ fontSize: 21, fontWeight: 800, color: 'white', marginBottom: 3 }}>Check Availability</h3>
        <p style={{ fontSize: 12, color: '#64748b' }}>Select date & travelers for real-time rates</p>
      </div>
      <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Date */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Travel Date</label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>📅</span>
            <input type="date" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={e => onDateChange(e.target.value)}
              style={{ width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 12, paddingBottom: 12, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 13, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontWeight: 600 }}
              onFocus={e => (e.target.style.borderColor = BRAND)} onBlur={e => (e.target.style.borderColor = '#e2e8f0')} />
          </div>
        </div>
        {/* Pax */}
        <div>
          <label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Travelers</label>
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: '2px 14px', border: '1px solid #e2e8f0' }}>
            <PaxCounter label="Adults"   sublabel="Age 12+"                     count={adults}   onInc={() => setAdults(a  => a+1)}          onDec={() => setAdults(a  => Math.max(1,a-1))} min={1} />
            <PaxCounter label="Children" sublabel={`Age ${tour.childAge||'3–11'}`} count={children} onInc={() => setChildren(c => c+1)}          onDec={() => setChildren(c => Math.max(0,c-1))} />
            <PaxCounter label="Infants"  sublabel={`Age ${tour.infantAge||'0–2'}`} count={infants}  onInc={() => setInfants(i  => i+1)}          onDec={() => setInfants(i  => Math.max(0,i-1))} />
          </div>
          <p style={{ textAlign: 'right', fontSize: 11, color: '#94a3b8', marginTop: 5 }}>{adults+children+infants} traveler{adults+children+infants !== 1 ? 's' : ''} total</p>
        </div>
        {/* Button */}
        <button onClick={checkAvailability} disabled={loading || !selectedDate}
          style={{ width: '100%', background: loading ? '#94a3b8' : BRAND, color: 'white', border: 'none', padding: '13px 0', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `0 8px 24px ${BRAND}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? '⏳ Fetching Live Rates…' : '🔍 Check Availability'}
        </button>
        {error && <div style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#92400e', fontSize: 12, padding: '10px 14px', borderRadius: 10 }}>⚠️ {error}</div>}
        {/* Options */}
        <AnimatePresence>
          {searched && !loading && options.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2 }}>Available Options</div>
              {options.map(opt => (
                <div key={opt.tourOptionId} onClick={() => opt.isAvailable && setSelOpt(opt)}
                  style={{ borderRadius: 16, border: `2px solid ${opt.isAvailable === false ? '#f1f5f9' : selOpt?.tourOptionId === opt.tourOptionId ? BRAND : '#e2e8f0'}`, padding: 14, background: opt.isAvailable === false ? '#f8fafc' : selOpt?.tourOptionId === opt.tourOptionId ? `${BRAND}08` : 'white', cursor: opt.isAvailable === false ? 'not-allowed' : 'pointer', opacity: opt.isAvailable === false ? 0.5 : 1, transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid ${selOpt?.tourOptionId === opt.tourOptionId ? BRAND : '#cbd5e1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2, flexShrink: 0 }}>
                        {selOpt?.tourOptionId === opt.tourOptionId && <div style={{ width: 7, height: 7, borderRadius: '50%', background: BRAND }} />}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{opt.tourOptionName}</div>
                        {opt.transferOptionName && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>{opt.transferOptionName}</div>}
                        {opt.slotTime && <div style={{ fontSize: 11, color: BRAND, fontWeight: 700, marginTop: 2 }}>🕐 {opt.slotTime}</div>}
                        {opt.isAvailable === false
                          ? <span style={{ display: 'inline-block', marginTop: 5, background: '#fef2f2', color: '#ef4444', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>Sold Out</span>
                          : opt.seatAvailable !== undefined && opt.seatAvailable > 0 && opt.seatAvailable <= 5
                            ? <span style={{ display: 'inline-block', marginTop: 5, background: '#fffbeb', color: '#d97706', padding: '1px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700 }}>Only {opt.seatAvailable} left!</span>
                            : null}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>AED {total(opt).toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: '#94a3b8' }}>{adults+children+infants} pax</div>
                    </div>
                  </div>
                  {selOpt?.tourOptionId === opt.tourOptionId && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                      style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${BRAND}20`, display: 'flex', gap: 8 }}>
                      {[
                        { label: `${adults}× Adult`,  price: opt.adultPrice  },
                        ...(children > 0 ? [{ label: `${children}× Child`,  price: opt.childPrice  }] : []),
                        ...(infants  > 0 ? [{ label: `${infants}× Infant`,  price: opt.infantPrice }] : []),
                      ].map(item => (
                        <div key={item.label} style={{ flex: 1, background: `${BRAND}08`, borderRadius: 10, padding: '7px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: 10, color: '#64748b' }}>{item.label}</div>
                          <div style={{ fontSize: 12, fontWeight: 700 }}>AED {item.price}</div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
              {selOpt && selOpt.isAvailable !== false && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  onClick={() => onBook(selOpt, { adults, children, infants })}
                  style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '13px 0', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(15,23,42,0.2)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1e293b')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#0f172a')}>
                  🛒 Book – AED {total(selOpt).toLocaleString()}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Booking Modal ────────────────────────────────────────────────────────────
function BookingModal({ isOpen, onClose, tourName }: { isOpen: boolean; onClose: () => void; tourName: string }) {
  const id = `RT-${Math.floor(Math.random()*90000+10000)}`
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)' }} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
            style={{ position: 'relative', background: 'white', borderRadius: 32, padding: 40, width: '100%', maxWidth: 440, textAlign: 'center', boxShadow: '0 40px 100px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Booking Initiated!</h3>
            <p style={{ color: '#64748b', marginBottom: 24, lineHeight: 1.6, fontSize: 14 }}>
              Request for <strong>"{tourName}"</strong> sent to our reservation team.
            </p>
            <div style={{ background: '#f8fafc', borderRadius: 16, padding: 18, marginBottom: 24, textAlign: 'left' }}>
              {[['Booking ID', `#${id}`], ['Status', 'Processing']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  {k === 'Status'
                    ? <span style={{ background: `${BRAND}15`, color: BRAND, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{v}</span>
                    : <span style={{ fontWeight: 700 }}>{v}</span>}
                </div>
              ))}
            </div>
            <button onClick={onClose}
              style={{ width: '100%', background: '#0f172a', color: 'white', border: 'none', padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Close & Continue
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Tour Detail ──────────────────────────────────────────────────────────────
function TourDetailView({ tour, onBack, selectedDate, onDateChange }:
  { tour: RaynaTour; onBack: () => void; selectedDate: string; onDateChange: (d: string) => void }
) {
  const [detail,        setDetail]       = useState<TourDetail | null>(null)
  const [loadingDetail, setLoadingDetail]= useState(true)
  const [activeImg,     setActiveImg]    = useState(getImg(tour.imagePath))
  const [bookingModal,  setBookingModal] = useState(false)
  const [bookedName,    setBookedName]   = useState('')

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.post('/api/tour-details', {
          CountryId: tour.countryId, CityId: tour.cityId,
          TourId: tour.tourId, ContractId: tour.contractId,
          TravelDate: selectedDate.replace(/-/g, '/'), LanguageId: 1, CurrencyCode: 'AED',
        })
        const status = data.statuscode ?? data.StatusCode
        const result = data.result ?? data.Result
        if (Number(status) === 200 && result?.length > 0) {
          setDetail(result[0])
          if (result[0].imagePath) setActiveImg(getImg(result[0].imagePath))
        } else { setDetail(tour as unknown as TourDetail) }
      } catch { setDetail(tour as unknown as TourDetail) }
      finally  { setLoadingDetail(false) }
    }
    fetch()
  }, [tour.tourId])

  const d = detail || (tour as unknown as TourDetail)
  const images = d.tourImages || [{ imagePath: tour.imagePath, imageCaptionName: 'Main', isFrontImage: 1 }]

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh', paddingBottom: 80 }}>
      <BookingModal isOpen={bookingModal} onClose={() => setBookingModal(false)} tourName={bookedName} />

      <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', position: 'sticky', top: 64, zIndex: 40 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>← Back to Results</button>
          <button onClick={() => { setBookedName(tour.tourName); setBookingModal(true) }}
            style={{ background: BRAND, color: 'white', border: 'none', padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 14px ${BRAND}40` }}>
            Book Now
          </button>
        </div>
      </div>

      {loadingDetail ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 12 }}>
          <div style={{ width: 36, height: 36, border: `3px solid ${BRAND}30`, borderTopColor: BRAND, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: '#64748b', fontWeight: 600 }}>Loading tour details…</span>
        </div>
      ) : (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 370px', gap: 28 }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <div style={{ borderRadius: 32, overflow: 'hidden', height: 440, background: '#e2e8f0', marginBottom: 12 }}>
                <img src={activeImg} alt={tour.tourName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId}/800/500` }} />
              </div>
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(getImg(img.imagePath))}
                    style={{ width: 80, height: 80, borderRadius: 14, overflow: 'hidden', flexShrink: 0, border: `2.5px solid ${activeImg === getImg(img.imagePath) ? BRAND : 'transparent'}`, opacity: activeImg === getImg(img.imagePath) ? 1 : 0.65, padding: 0, cursor: 'pointer', background: 'none', transition: 'all 0.2s' }}>
                    <img src={getImg(img.imagePath)} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${tour.tourId+i}/200/200` }} />
                  </button>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 28, border: '1px solid #e2e8f0', padding: 32 }}>
              <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 18, lineHeight: 1.2 }}>{d.tourName}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                {[['⏱','Duration',d.duration||'—'],['🌐','Language',d.tourLanguage||'English'],['⭐','Rating',`${d.rating||5} (${d.reviewCount||0} Reviews)`]].map(([icon, label, val]) => (
                  <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, background: '#f8fafc', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, marginTop: 1 }}>{val}</div>
                    </div>
                  </div>
                ))}
              </div>
              {d.tourDescription && <>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Description</h3>
                <div style={{ color: '#64748b', lineHeight: 1.7, fontSize: 14, marginBottom: 24 }} dangerouslySetInnerHTML={{ __html: d.tourDescription }} />
              </>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {d.tourInclusion && <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#16a34a', marginBottom: 8 }}>✅ Inclusions</h3>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: d.tourInclusion }} />
                </div>}
                {d.tourExclusion && <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>❌ Exclusions</h3>
                  <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: d.tourExclusion }} />
                </div>}
              </div>
              {d.importantInformation && <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #f1f5f9' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>ℹ️ Important Information</h3>
                <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: d.importantInformation }} />
              </div>}
            </div>
          </div>

          {/* Right */}
          <div style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 18, alignSelf: 'start' }}>
            <AvailabilityPanel tour={d} selectedDate={selectedDate} onDateChange={onDateChange}
              onBook={(opt) => { setBookedName(`${tour.tourName} – ${opt.tourOptionName}`); setBookingModal(true) }} />
            <div style={{ background: '#0f172a', borderRadius: 28, padding: 26, color: 'white' }}>
              <h4 style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Need Help?</h4>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>Our experts are available 24/7.</p>
              {[['📞','Call Us','+971 4 208 7444'],['💬','WhatsApp','+971 50 123 4567']].map(([icon, label, val]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.08)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 10, color: '#475569', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view,         setView]        = useState<'login'|'dashboard'|'results'|'detail'>('login')
  const [cities,       setCities]      = useState<City[]>([])
  const [loadingCities,setLoadingCities]= useState(false)
  const [tours,        setTours]       = useState<RaynaTour[]>([])
  const [loadingTours, setLoadingTours]= useState(false)
  const [selectedCity, setSelectedCity]= useState('')
  const [selectedDate, setSelectedDate]= useState(new Date().toISOString().split('T')[0])
  const [selectedTour, setSelectedTour]= useState<RaynaTour | null>(null)

  const cityName = cities.find(c => String(c.cityId) === selectedCity)?.cityName || ''

  useEffect(() => {
    const load = async () => {
      setLoadingCities(true)
      try {
        const { data } = await axios.post('/api/cities', { CountryId: 13063 })
        const status = data.statuscode ?? data.StatusCode
        const result = data.result ?? data.Result
        if (Number(status) === 200 && result?.length > 0) setCities(result)
      } catch { /* cities unavailable */ }
      finally { setLoadingCities(false) }
    }
    load()
  }, [])

  const handleSearch = async () => {
    if (!selectedCity) { alert('Please select a destination first'); return }
    setView('results'); setLoadingTours(true)
    try {
      const { data } = await axios.post('/api/tours', { countryId: 13063, cityId: String(selectedCity) })
      const status = data.statuscode ?? data.StatusCode
      const result = data.result ?? data.Result
      if (Number(status) === 200 && result) {
        const list = Array.isArray(result) ? result : (result.tours || [])
        setTours(list)
      } else { setTours([]) }
    } catch { setTours([]) }
    finally { setLoadingTours(false) }
  }

  return (
    <>
      <Navbar onLogoClick={() => setView('login')} />
      <AnimatePresence mode="wait">
        {view === 'login' && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomeView onLogin={() => setView('dashboard')} />
          </motion.div>
        )}
        {view === 'dashboard' && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DashboardView onSearch={handleSearch} cities={cities} loadingCities={loadingCities}
              selectedCity={selectedCity} onCityChange={setSelectedCity}
              selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </motion.div>
        )}
        {view === 'results' && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SearchResultsView onBack={() => setView('dashboard')} tours={tours} cityName={cityName}
              loading={loadingTours} onTourClick={t => { setSelectedTour(t); setView('detail') }} />
          </motion.div>
        )}
        {view === 'detail' && selectedTour && (
          <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TourDetailView tour={selectedTour} onBack={() => setView('results')}
              selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Tab */}
      <div style={{ position: 'fixed', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 40 }}>
        <div style={{ background: '#facc15', color: '#0f172a', padding: '18px 7px', borderRadius: '0 8px 8px 0', fontWeight: 800, fontSize: 10, writingMode: 'vertical-rl', transform: 'rotate(180deg)', cursor: 'pointer', letterSpacing: 1 }}>FEEDBACK</div>
      </div>
    </>
  )
}
