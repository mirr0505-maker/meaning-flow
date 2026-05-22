/* Meaning Flow — Resonance Garden + My Page */

const GARDEN_POSTS = [
  {
    id: 1, flag: '🇰🇷', country: 'KR', combo: '탐험하는 시인', time: '오늘 저녁',
    lang: 'ko', text: '오늘은 그냥 하늘만 봤다. 근데 그게 충분했다.',
    translated: null, resonances: 124, mine: true,
  },
  {
    id: 2, flag: '🇩🇪', country: 'DE', combo: 'Visionary Architect', time: '어젯밤',
    lang: 'de', text: 'Ich habe heute nichts gebaut, aber eine Zukunft entworfen, in der ich leben möchte.',
    translated: '오늘 아무것도 짓지 않았지만, 내가 살고 싶은 미래를 설계했다.',
    resonances: 89, mine: false,
  },
  {
    id: 3, flag: '🇯🇵', country: 'JP', combo: '通察する分析家', time: '오늘 새벽',
    lang: 'ja', text: '今日、誰も知らない小さな勝利があった。それで十分だった。',
    translated: '오늘, 아무도 모르는 작은 승리가 있었다. 그것으로 충분했다.',
    resonances: 47, mine: false,
  },
  {
    id: 4, flag: '🇺🇸', country: 'US', combo: 'Quiet Cartographer', time: '오늘 저녁',
    lang: 'en', text: "I said 'no' to one thing today. It felt like building a small wall against the world's noise.",
    translated: '오늘 하나에 ‘아니오’라고 말했다. 세상의 소음에 작은 벽을 쌓는 기분이었다.',
    resonances: 213, mine: false,
  },
  {
    id: 5, flag: '🇫🇷', country: 'FR', combo: 'Poète Vagabond', time: '어제 새벽',
    lang: 'fr', text: 'J\'ai marché sans destination. Mes pensées, elles, savaient où aller.',
    translated: '목적지 없이 걸었다. 생각들은 어디로 갈지 알고 있었다.',
    resonances: 56, mine: false,
  },
  {
    id: 6, flag: '🇰🇷', country: 'KR', combo: '가치를 품은 전략가', time: '오늘 저녁',
    lang: 'ko', text: '계획만 세우다 끝났지만, 어쩌면 그 계획이 진짜였다.',
    translated: null, resonances: 71, mine: false,
  },
];

const GARDEN_FILTERS = [
  { k: 'all',   label: '모든 IN' },
  { k: 'same',  label: '같은 조합' },
  { k: 'mine',  label: '내 언어' },
  { k: 'world', label: '전 세계 🌍' },
];

// ───────────────────────────────────────────────────────────
// GARDEN
// ───────────────────────────────────────────────────────────
function ScreenGarden() {
  const [filter, setFilter] = React.useState('all');
  const [posts, setPosts] = React.useState(GARDEN_POSTS);
  const [openTrans, setOpenTrans] = React.useState({}); // id -> bool

  const resonate = (id) => {
    setPosts(ps => ps.map(p => p.id === id
      ? { ...p, resonated: !p.resonated, resonances: (p.resonances || 0) + (p.resonated ? -1 : 1), justResonated: !p.resonated }
      : p
    ));
    setTimeout(() => {
      setPosts(ps => ps.map(p => p.id === id ? { ...p, justResonated: false } : p));
    }, 500);
  };

  const toggleTrans = (id) => {
    setOpenTrans(o => ({ ...o, [id]: !o[id] }));
  };

  return (
    <div className="mf-screen mf-fade" data-screen-label="05 Garden" style={{
      height: '100%', overflowY: 'auto', background: 'var(--cream)',
      paddingTop: 56, paddingBottom: 130,
    }}>
      {/* header */}
      <div style={{ padding: '8px 24px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mute)' }}>
              RESONANCE GARDEN
            </div>
            <h1 className="mf-serif" style={{
              margin: '6px 0 0', fontSize: 24, lineHeight: 1.3, color: 'var(--ink)', fontWeight: 400,
            }}>
              공명의 정원
            </h1>
          </div>
          <Leaf size={28} color="var(--leaf)" />
        </div>
        <p className="mf-serif" style={{
          marginTop: 12, marginBottom: 0, fontSize: 13.5, lineHeight: 1.65, color: 'var(--ink-soft)',
          fontStyle: 'italic',
        }}>
          전 세계 IN이 흘려보낸 한 줄.<br/>댓글도, 좋아요도 없습니다. 끄덕임만 있어요.
        </p>
      </div>

      {/* filters */}
      <ChipRow chips={GARDEN_FILTERS} active={filter} onPick={setFilter} />

      {/* posts */}
      <div style={{ padding: '20px 24px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {posts.map(p => (
          <GardenPost
            key={p.id} post={p}
            transOpen={!!openTrans[p.id]}
            onToggleTrans={() => toggleTrans(p.id)}
            onResonate={() => resonate(p.id)}
          />
        ))}

        <button style={{
          marginTop: 6, height: 46, borderRadius: 14,
          background: 'transparent', border: '1px solid var(--hair)',
          fontFamily: 'inherit', fontSize: 13.5, color: 'var(--ink-soft)', cursor: 'pointer',
        }}>
          더 보기 — 20개씩 천천히
        </button>
      </div>
    </div>
  );
}

function GardenPost({ post, transOpen, onToggleTrans, onResonate }) {
  const showTrans = transOpen && post.translated;
  return (
    <article style={{
      padding: '20px 20px 16px', borderRadius: 18,
      background: 'var(--paper)', border: '1px solid var(--hair-soft)',
      position: 'relative',
    }}>
      {/* meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 14 }}>{post.flag}</span>
          <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {post.combo}
          </span>
          <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--mute-light)' }} />
          <span style={{ fontSize: 12, color: 'var(--mute)', whiteSpace: 'nowrap' }}>{post.time}</span>
        </div>
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--mute-light)', fontSize: 16, padding: 0, lineHeight: 1,
        }}>⋯</button>
      </div>

      {/* original text */}
      <p className="mf-serif" style={{
        margin: 0, fontSize: 16.5, lineHeight: 1.65, color: 'var(--ink)',
        fontWeight: 400, letterSpacing: post.lang === 'ko' ? '-0.005em' : 0,
      }}>
        {post.text}
      </p>

      {/* translated */}
      {showTrans && (
        <div className="mf-fade" style={{
          marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--hair)',
        }}>
          <div className="mf-mono" style={{
            fontSize: 10, letterSpacing: '0.1em', color: 'var(--mute)', marginBottom: 6,
          }}>
            🌍 KO TRANSLATION
          </div>
          <p style={{
            margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-soft)',
          }}>
            {post.translated}
          </p>
        </div>
      )}

      {/* actions */}
      <div style={{
        marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {post.translated && (
            <button onClick={onToggleTrans} className="mf-press" style={{
              height: 30, padding: '0 12px', borderRadius: 999,
              background: showTrans ? 'var(--cream-deep)' : 'transparent',
              border: '1px solid var(--hair)',
              fontFamily: 'inherit', fontSize: 12, color: 'var(--ink-soft)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {showTrans ? '🌐 원문으로' : '🌍 번역'}
            </button>
          )}
        </div>
        <button onClick={onResonate} className="mf-press" style={{
          height: 32, padding: '0 12px', borderRadius: 999,
          background: post.resonated ? 'var(--leaf-soft)' : 'transparent',
          border: `1px solid ${post.resonated ? 'var(--leaf)' : 'var(--hair)'}`,
          fontFamily: 'inherit', fontSize: 12.5, fontWeight: 500,
          color: post.resonated ? 'var(--leaf)' : 'var(--ink-soft)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span className={post.justResonated ? 'leaf-pulse' : ''} style={{ display: 'inline-flex' }}>
            <Leaf filled={post.resonated} color={post.resonated ? 'var(--leaf)' : 'var(--mute)'} size={14} />
          </span>
          <span className="mf-mono" style={{ letterSpacing: '0.04em' }}>
            {post.resonances}
          </span>
        </button>
      </div>
    </article>
  );
}

// ───────────────────────────────────────────────────────────
// MY PAGE
// ───────────────────────────────────────────────────────────
function ScreenMe({ combo, setView }) {
  const [tab, setTab] = React.useState('mine');

  const myShared = [
    { id: 11, text: '오늘은 그냥 하늘만 봤다. 근데 그게 충분했다.', time: '오늘 저녁', res: 124 },
    { id: 12, text: '말하지 않은 게 잘한 일이었다.', time: '3일 전', res: 58 },
    { id: 13, text: '커피 한 잔이 한 시간을 살렸다.', time: '지난주', res: 92 },
  ];
  const myResonated = [
    { id: 21, flag: '🇩🇪', combo: 'Visionary Architect', text: '내가 살고 싶은 미래를 설계했다.', time: '어젯밤' },
    { id: 22, flag: '🇯🇵', combo: '通察する分析家', text: '아무도 모르는 작은 승리가 있었다.', time: '오늘 새벽' },
    { id: 23, flag: '🇰🇷', combo: '비전을 가진 건축가', text: '느린 것도 가는 것이다.', time: '2일 전' },
  ];

  return (
    <div className="mf-screen mf-fade" data-screen-label="06 Me" style={{
      height: '100%', overflowY: 'auto', background: 'var(--cream)',
      paddingTop: 56, paddingBottom: 130,
    }}>
      {/* profile header */}
      <div style={{ padding: '12px 24px 0' }}>
        <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mute)' }}>
          ME
        </div>
      </div>

      <div style={{ padding: '14px 24px 0' }}>
        <div style={{
          padding: '24px 22px', borderRadius: 22,
          background: 'var(--paper)', border: '1px solid var(--hair-soft)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* decorative leaf */}
          <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.08 }}>
            <Leaf size={140} color="var(--leaf)" />
          </div>

          <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mute)' }}>
            {combo.solo} × {combo.social}
          </div>
          <h2 className="mf-serif" style={{
            margin: '6px 0 0', fontSize: 22, lineHeight: 1.35,
            color: 'var(--ink)', fontWeight: 400, letterSpacing: '-0.005em',
          }}>
            {combo.name}
          </h2>

          <div style={{ marginTop: 18, display: 'flex', gap: 22 }}>
            <Stat n={47}  label="흘려보낸 일기" />
            <Stat n={284} label="받은 공명" />
            <Stat n={156} label="내 공명" />
          </div>
        </div>
      </div>

      {/* tabs */}
      <div style={{ padding: '20px 24px 0', display: 'flex', borderBottom: '1px solid var(--hair)' }}>
        {[
          { k: 'mine', label: '내가 흘려보낸 글' },
          { k: 'res',  label: '내 공명 일기' },
        ].map(t => {
          const on = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              flex: 1, height: 42, background: 'transparent', border: 'none',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: on ? 500 : 400,
              color: on ? 'var(--ink)' : 'var(--mute)',
              borderBottom: `2px solid ${on ? 'var(--ink)' : 'transparent'}`,
              marginBottom: -1, cursor: 'pointer', letterSpacing: '0.01em',
            }}>
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: '14px 24px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'mine' && myShared.map(p => (
          <div key={p.id} style={{
            padding: '16px 18px', borderRadius: 16,
            background: 'var(--paper)', border: '1px solid var(--hair-soft)',
          }}>
            <p className="mf-serif" style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--ink)' }}>
              {p.text}
            </p>
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>{p.time}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--leaf)' }}>
                <Leaf filled size={13} color="var(--leaf)"/>
                <span className="mf-mono">{p.res}명이 공명했어요</span>
              </span>
            </div>
          </div>
        ))}

        {tab === 'res' && myResonated.map(p => (
          <div key={p.id} style={{
            padding: '16px 18px', borderRadius: 16,
            background: 'var(--paper)', border: '1px solid var(--hair-soft)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 13 }}>{p.flag}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-soft)', fontWeight: 500 }}>{p.combo}</span>
              <span style={{ width: 3, height: 3, borderRadius: 999, background: 'var(--mute-light)' }} />
              <span style={{ fontSize: 11.5, color: 'var(--mute)' }}>{p.time}</span>
            </div>
            <p className="mf-serif" style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: 'var(--ink-soft)' }}>
              {p.text}
            </p>
          </div>
        ))}
      </div>

      {/* settings */}
      <div style={{ padding: '24px 24px 0' }}>
        <div className="mf-mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--mute)', marginBottom: 10 }}>
          SETTINGS
        </div>
        <div style={{
          background: 'var(--paper)', border: '1px solid var(--hair-soft)',
          borderRadius: 16, overflow: 'hidden',
        }}>
          {[
            { label: '두 자아 다시 설정', sub: combo.solo + ' × ' + combo.social, action: () => setView('onboarding') },
            { label: '알림', sub: '저녁의 공명 보고 · 1일 1회', },
            { label: '언어', sub: '한국어 · 자동 감지', },
            { label: '데이터 내보내기', sub: '의미 일기 · 보관함', last: true },
          ].map((row, i) => (
            <button key={i} onClick={row.action} style={{
              width: '100%', padding: '16px 18px',
              background: 'transparent', border: 'none', borderBottom: row.last ? 'none' : '1px solid var(--hair-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              fontFamily: 'inherit', textAlign: 'left', cursor: 'pointer',
            }}>
              <div>
                <div style={{ fontSize: 14, color: 'var(--ink)' }}>{row.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--mute)', marginTop: 2 }}>{row.sub}</div>
              </div>
              <span style={{ color: 'var(--mute-light)', fontSize: 18 }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="mf-mono" style={{ fontSize: 22, fontWeight: 400, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
        {n}
      </div>
      <div style={{ fontSize: 11, color: 'var(--mute)', marginTop: 2, letterSpacing: '0.02em' }}>{label}</div>
    </div>
  );
}

Object.assign(window, { ScreenGarden, ScreenMe });
