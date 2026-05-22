/* Meaning Flow — shared components */

const MODES = {
  morning:  { key: 'morning',  name: '점화',  range: '06 — 10', icon: '🌅', accent: 'var(--morning)', accentSoft: 'var(--morning-soft)', bg: 'var(--paper-warm)', dot: 0.18 },
  day:      { key: 'day',      name: '실행',  range: '10 — 18', icon: '☀️', accent: 'var(--day)',     accentSoft: 'var(--day-soft)',     bg: 'var(--paper)',      dot: 0.45 },
  evening:  { key: 'evening',  name: '통합',  range: '18 — 22', icon: '🌆', accent: 'var(--evening)', accentSoft: 'var(--evening-soft)', bg: 'var(--cream)',      dot: 0.75 },
  night:    { key: 'night',    name: '착륙',  range: '22 — 02', icon: '🌙', accent: 'var(--night)',   accentSoft: 'var(--night-soft)',   bg: 'var(--night-bg)',   dot: 0.94, dark: true },
};

const TIME_BY_MODE = {
  morning: '07:23',
  day:     '14:08',
  evening: '20:11',
  night:   '23:47',
};

const COMBOS = [
  { solo: 'INFP', social: 'INTJ', name: '가치를 품은 전략가' },
  { solo: 'INFP', social: 'INTP', name: '탐험하는 시인' },
  { solo: 'INFP', social: 'INFJ', name: '공명하는 이상주의자' },
  { solo: 'INTP', social: 'INTJ', name: '체계를 짓는 사색가' },
  { solo: 'INTP', social: 'INFJ', name: '통찰하는 분석가' },
  { solo: 'INTJ', social: 'INFJ', name: '비전을 가진 건축가' },
];

// ───────────────────────────────────────────────────────────
// Horizon — a thin arc that visualises where you are in the day
// ───────────────────────────────────────────────────────────
function Horizon({ mode, dark = false }) {
  const m = MODES[mode];
  const ink = dark ? 'var(--night-ink)' : 'var(--ink)';
  const hair = dark ? 'var(--night-hair)' : 'var(--hair)';
  const mute = dark ? 'var(--night-soft-tx)' : 'var(--mute)';

  const STOPS = [
    { k: 'morning', at: 0.10, label: '06' },
    { k: 'day',     at: 0.37, label: '10' },
    { k: 'evening', at: 0.70, label: '18' },
    { k: 'night',   at: 0.92, label: '22' },
  ];

  return (
    <div style={{ padding: '4px 24px 22px' }}>
      <div style={{ position: 'relative', height: 24 }}>
        {/* base line */}
        <div style={{
          position: 'absolute', top: 11, left: 0, right: 0, height: 1,
          background: hair,
        }} />
        {/* progress line up to current */}
        <div style={{
          position: 'absolute', top: 11, left: 0, height: 1,
          width: `${m.dot * 100}%`,
          background: m.accent, opacity: 0.55,
        }} />
        {/* dots */}
        {STOPS.map(s => (
          <div key={s.k} style={{
            position: 'absolute', top: 8, left: `${s.at * 100}%`,
            transform: 'translateX(-50%)',
            width: 7, height: 7, borderRadius: 999,
            background: dark ? 'var(--night-bg)' : (mode === s.k ? m.accent : 'transparent'),
            border: `1.5px solid ${mode === s.k ? m.accent : hair}`,
          }} />
        ))}
        {/* current moving dot */}
        <div style={{
          position: 'absolute', top: 4, left: `${m.dot * 100}%`,
          transform: 'translateX(-50%)',
          width: 14, height: 14, borderRadius: 999,
          background: m.accent,
          boxShadow: `0 0 0 4px ${m.accentSoft}`,
        }} />
      </div>
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
        <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: mute, whiteSpace: 'nowrap' }}>
          06 · 10 · 18 · 22
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', whiteSpace: 'nowrap' }}>
          <span className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.06em', color: mute }}>
            {m.range}
          </span>
          <span style={{ fontSize: 12, color: ink, fontWeight: 500, letterSpacing: '0.02em' }}>
            {m.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Top bar — time + small mode indicator + optional right slot
// ───────────────────────────────────────────────────────────
function TopBar({ mode, right = null, dark = false, label = null }) {
  const m = MODES[mode];
  const ink = dark ? 'var(--night-ink)' : 'var(--ink)';
  const mute = dark ? 'var(--night-soft-tx)' : 'var(--mute)';

  return (
    <div style={{
      padding: '8px 24px 0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="mf-mono" style={{ fontSize: 22, fontWeight: 400, color: ink, letterSpacing: '-0.02em' }}>
          {TIME_BY_MODE[mode]}
        </span>
        <span style={{ fontSize: 12, color: mute, letterSpacing: '0.05em' }}>
          {label || m.name + ' 모드'}
        </span>
      </div>
      {right}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Filter chip row
// ───────────────────────────────────────────────────────────
function ChipRow({ chips, active, onPick, dark = false }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 24px', overflowX: 'auto', flexWrap: 'nowrap' }}>
      {chips.map(c => {
        const on = c.k === active;
        return (
          <button
            key={c.k}
            onClick={() => onPick && onPick(c.k)}
            className="mf-press"
            style={{
              flex: '0 0 auto', height: 32, padding: '0 14px',
              borderRadius: 999,
              border: `1px solid ${on ? (dark ? 'var(--night-ink)' : 'var(--ink)') : (dark ? 'var(--night-hair)' : 'var(--hair)')}`,
              background: on ? (dark ? 'var(--night-ink)' : 'var(--ink)') : 'transparent',
              color: on ? (dark ? 'var(--night-bg)' : '#fff') : (dark ? 'var(--night-ink)' : 'var(--ink-soft)'),
              fontFamily: 'inherit', fontSize: 13, fontWeight: on ? 500 : 400,
              letterSpacing: '0.01em',
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────────────────────────────────────────────
// Bottom nav — 흐름 · 정원 · 나
// ───────────────────────────────────────────────────────────
function BottomNav({ tab, onPick, dark = false }) {
  const bg = dark ? 'var(--night-bg)' : 'var(--cream)';
  const hair = dark ? 'var(--night-hair)' : 'var(--hair-soft)';
  const ink = dark ? 'var(--night-ink)' : 'var(--ink)';
  const mute = dark ? 'var(--night-soft-tx)' : 'var(--mute)';

  const items = [
    { k: 'flow',   label: '흐름', icon: <NavFlowIcon  active={tab==='flow'}   dark={dark} /> },
    { k: 'garden', label: '정원', icon: <NavGardenIcon active={tab==='garden'} dark={dark} /> },
    { k: 'me',     label: '나',   icon: <NavMeIcon     active={tab==='me'}     dark={dark} /> },
  ];

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 30,
      paddingBottom: 28, paddingTop: 10,
      background: dark
        ? 'linear-gradient(180deg, transparent 0%, rgba(20,21,28,.85) 30%, var(--night-bg) 60%)'
        : 'linear-gradient(180deg, transparent 0%, rgba(244,239,230,.9) 30%, var(--cream) 60%)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    }}>
      <div style={{
        margin: '0 16px', padding: '6px 8px',
        borderRadius: 22,
        border: `1px solid ${hair}`,
        background: dark ? 'rgba(28,29,38,.75)' : 'rgba(251,248,241,.75)',
        display: 'flex', justifyContent: 'space-around',
      }}>
        {items.map(it => {
          const on = it.k === tab;
          return (
            <button
              key={it.k}
              onClick={() => onPick(it.k)}
              className="mf-press"
              style={{
                flex: 1, height: 48,
                border: 'none', background: 'transparent', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                color: on ? ink : mute, fontFamily: 'inherit',
              }}
            >
              {it.icon}
              <span style={{ fontSize: 10.5, letterSpacing: '0.04em', fontWeight: on ? 500 : 400 }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NavFlowIcon({ active, dark }) {
  const c = active ? (dark ? '#E8E6E0' : '#1A1A1F') : (dark ? '#7E7E92' : '#9A9486');
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M2 14 Q 6 8, 11 11 T 20 8" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
      <circle cx="11" cy="11" r="1.8" fill={c}/>
    </svg>
  );
}
function NavGardenIcon({ active, dark }) {
  const c = active ? (dark ? '#E8E6E0' : '#1A1A1F') : (dark ? '#7E7E92' : '#9A9486');
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 20 V 12" stroke={c} strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 12 Q 5 11, 4 5 Q 10 6, 11 12 Z" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
      <path d="M11 14 Q 17 13, 18 7 Q 12 8, 11 14 Z" stroke={c} strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
    </svg>
  );
}
function NavMeIcon({ active, dark }) {
  const c = active ? (dark ? '#E8E6E0' : '#1A1A1F') : (dark ? '#7E7E92' : '#9A9486');
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="8" r="3.4" stroke={c} strokeWidth="1.6" fill="none"/>
      <path d="M4 19 Q 11 13, 18 19" stroke={c} strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

// ───────────────────────────────────────────────────────────
// Leaf icon (resonance) — outline / filled
// ───────────────────────────────────────────────────────────
function Leaf({ filled = false, size = 16, color = 'var(--leaf)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <path d="M4 18 Q 4 6, 18 4 Q 19 14, 6 18 Q 5 14, 11 10"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        fill={filled ? color : 'none'} fillOpacity={filled ? 0.18 : 0}/>
    </svg>
  );
}

// ───────────────────────────────────────────────────────────
// Card — soft cream surface with hairline
// ───────────────────────────────────────────────────────────
function Card({ children, style = {}, dark = false, padding = 20, borderless = false }) {
  return (
    <div style={{
      background: dark ? 'var(--night-bg-2)' : 'var(--paper)',
      border: borderless ? 'none' : `1px solid ${dark ? 'var(--night-hair)' : 'var(--hair-soft)'}`,
      borderRadius: 'var(--r-card)',
      padding,
      ...style,
    }}>
      {children}
    </div>
  );
}

// expose
Object.assign(window, { MODES, TIME_BY_MODE, COMBOS, Horizon, TopBar, ChipRow, BottomNav, Leaf, Card });
