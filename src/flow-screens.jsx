/* Meaning Flow — Flow screens (Morning, Day, Evening, Night) */

// ───────────────────────────────────────────────────────────
// MORNING — 점화 (Ignition)
// ───────────────────────────────────────────────────────────
function ScreenMorning({ combo }) {
  const m = MODES.morning;
  return (
    <div className="mf-screen mf-fade" data-screen-label="01 Morning" style={{
      height: '100%', overflowY: 'auto', background: m.bg, paddingTop: 56, paddingBottom: 130
    }}>
      <TopBar mode="morning" />
      <Horizon mode="morning" />

      <div style={{ padding: '0 24px' }}>
        <div className="mf-serif" style={{ fontSize: 13, color: 'var(--mute)', letterSpacing: '0.04em', marginBottom: 6 }}>
          어젯밤, 당신이 예약한
        </div>
        <h1 className="mf-serif" style={{
          fontSize: 26, lineHeight: 1.4, color: 'var(--ink)', fontWeight: 400, margin: "0px 0px 0px 80px"
        }}>
          오늘의 첫 단추
        </h1>

        {/* first button card */}
        <div style={{
          marginTop: 22, padding: '28px 22px',
          background: 'var(--paper)',
          borderRadius: 22,
          border: '1px solid var(--hair-soft)',
          position: 'relative', overflow: 'hidden'
        }}>
          {/* soft accent stripe */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(180deg, var(--morning) 0%, transparent 100%)'
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'var(--morning-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
            }}>💧</div>
            <div style={{ flex: 1 }}>
              <div className="mf-mono" style={{ fontSize: 10.5, color: 'var(--mute)', letterSpacing: '0.1em' }}>2 MIN</div>
              <div style={{ fontSize: 17, fontWeight: 500, color: 'var(--ink)', marginTop: 3 }}>물 한 잔 마시기</div>
            </div>
          </div>
          <button className="mf-press" style={{
            width: '100%', marginTop: 22, height: 48, borderRadius: 14,
            background: 'var(--ink)', color: 'var(--paper-warm)', border: 'none',
            fontFamily: 'inherit', fontSize: 14.5, fontWeight: 500, cursor: 'pointer'
          }}>
            시작 — 그 다음은 흘러갑니다
          </button>
        </div>

        {/* identity question */}
        <div style={{ marginTop: 32 }}>
          <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mute)' }}>
            오늘의 정체성 질문
          </div>
          <p className="mf-serif" style={{
            marginTop: 12, marginBottom: 0, fontSize: 22, lineHeight: 1.55, color: 'var(--ink)',
            fontStyle: 'italic', fontWeight: 400
          }}>
            오늘 어떤 ‘나’로 깨어났나요?
          </p>
        </div>

        <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['차분한 나', '호기심 많은 나', '조심스러운 나', '느린 나'].map((t) =>
          <button key={t} className="mf-press" style={{
            height: 36, padding: '0 14px', borderRadius: 999,
            border: '1px solid var(--hair)', background: 'transparent',
            fontFamily: 'inherit', fontSize: 13, color: 'var(--ink-soft)', cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}>{t}</button>
          )}
        </div>

        <button style={{
          marginTop: 24, background: 'transparent', border: 'none',
          fontFamily: 'inherit', fontSize: 13, color: 'var(--mute)',
          textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer'
        }}>
          오늘은 건너뛸게요
        </button>
      </div>
    </div>);

}

// ───────────────────────────────────────────────────────────
// DAY — 실행 (Action) — single task + 2-min converter + 70% button
// ───────────────────────────────────────────────────────────
function ScreenDay() {
  const [stage, setStage] = React.useState('task'); // task | convert | doing | done

  return (
    <div className="mf-screen mf-fade" data-screen-label="02 Day" style={{
      height: '100%', overflowY: 'auto', background: MODES.day.bg, paddingTop: 56, paddingBottom: 130
    }}>
      <TopBar mode="day" />
      <Horizon mode="day" />

      <div style={{ padding: '0 24px' }}>
        <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mute)' }}>
          지금 할 단 하나
        </div>

        {stage === 'task' && <DayTask onConvert={() => setStage('convert')} />}
        {stage === 'convert' && <DayConvert onPick={() => setStage('doing')} />}
        {stage === 'doing' && <DayDoing onFinish={() => setStage('done')} />}
        {stage === 'done' && <DayDone />}

        {/* folded backlog */}
        {stage === 'task' &&
        <div style={{
          marginTop: 32, padding: '14px 18px',
          background: 'rgba(255,255,255,0.6)', borderRadius: 14,
          border: '1px dashed var(--hair)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
            <div>
              <div className="mf-mono" style={{ fontSize: 10.5, color: 'var(--mute)', letterSpacing: '0.08em' }}>
                BACKLOG · 7
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 2 }}>
                다른 할 일은 접어두었어요
              </div>
            </div>
            <button style={{
            background: 'transparent', border: 'none', fontFamily: 'inherit',
            fontSize: 13, color: 'var(--mute)', cursor: 'pointer'
          }}>펼치기</button>
          </div>
        }
      </div>
    </div>);

}

function DayTask({ onConvert }) {
  return (
    <div style={{ marginTop: 14 }}>
      <h1 className="mf-serif" style={{
        margin: 0, lineHeight: 1.35, color: 'var(--ink)', fontWeight: 400,
        letterSpacing: '-0.01em', fontSize: "30px"
      }}>        포트폴리오에
   새 프로젝트 추가하기
      </h1>
      <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--day)' }} />
        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>지금 시작하면 좋은 일</span>
      </div>

      <button onClick={onConvert} className="mf-press" style={{
        width: '100%', marginTop: 28, height: 56, borderRadius: 16,
        background: 'var(--ink)', color: 'var(--paper)', border: 'none',
        fontFamily: 'inherit', fontSize: 15.5, fontWeight: 500, cursor: 'pointer'
      }}>
        시작 — 2분 안에 가능할까요?
      </button>

      <p style={{
        marginTop: 16, fontSize: 13, lineHeight: 1.6, color: 'var(--mute)',
        textAlign: 'center'
      }}>
        시작이 어려우면, 더 작게 쪼개볼게요.
      </p>
    </div>);

}

function DayConvert({ onPick }) {
  const micros = [
  { t: '에디터 켜기', mins: 1 },
  { t: '작년 프로젝트 폴더 열기', mins: 1 },
  { t: '제목만 적고 멈추기', mins: 2 }];

  return (
    <div style={{ marginTop: 14 }}>
      <p className="mf-serif" style={{
        margin: 0, fontSize: 22, lineHeight: 1.5, color: 'var(--ink)', fontStyle: 'italic', fontWeight: 400
      }}>
        잠깐, 이걸 2분 안에<br />시작할 수 있을까요?
      </p>
      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {micros.map((m, i) =>
        <button key={i} onClick={onPick} className="mf-press" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderRadius: 16,
          background: 'var(--paper)', border: '1px solid var(--hair-soft)',
          fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
              width: 28, height: 28, borderRadius: 999, background: 'var(--day-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--day)' }} />
              </div>
              <span style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>{m.t}</span>
            </div>
            <span className="mf-mono" style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.06em' }}>
              {m.mins}m
            </span>
          </button>
        )}
      </div>
      <button style={{
        marginTop: 16, width: '100%', height: 44, borderRadius: 14,
        background: 'transparent', border: '1px dashed var(--hair)',
        fontFamily: 'inherit', fontSize: 13, color: 'var(--mute)', cursor: 'pointer'
      }}>
        + 직접 쪼개기
      </button>
    </div>);

}

function DayDoing({ onFinish }) {
  return (
    <div style={{ marginTop: 14 }}>
      <h1 className="mf-serif" style={{
        margin: 0, fontSize: 28, lineHeight: 1.4, color: 'var(--ink)', fontWeight: 400
      }}>
        에디터 켜기
      </h1>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 6 }}>지금 진행 중이에요</p>

      {/* timer ring */}
      <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <circle cx="90" cy="90" r="78" stroke="var(--hair)" strokeWidth="1.5" fill="none" />
            <circle cx="90" cy="90" r="78" stroke="var(--day)" strokeWidth="2.5" fill="none"
            strokeDasharray="490" strokeDashoffset="180" strokeLinecap="round"
            transform="rotate(-90 90 90)" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="mf-mono" style={{ fontSize: 36, fontWeight: 300, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              01:18
            </div>
            <div className="mf-mono" style={{ fontSize: 10.5, color: 'var(--mute)', letterSpacing: '0.12em', marginTop: 4 }}>
              REMAINING
            </div>
          </div>
        </div>
      </div>

      <p className="mf-serif" style={{
        marginTop: 28, fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-soft)',
        textAlign: 'center', fontStyle: 'italic'
      }}>
        완벽하지 않아도 괜찮아요.<br />일단 손이 닿았다는 것이 중요해요.
      </p>

      {/* two buttons — 70% emphasized */}
      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={onFinish} className="mf-press" style={{
          height: 60, borderRadius: 16, background: 'var(--ink)', color: 'var(--paper)',
          border: 'none', fontFamily: 'inherit', fontSize: 16, fontWeight: 500, cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2
        }}>
          <span>70% 완료</span>
          <span style={{ fontSize: 11, opacity: 0.65, letterSpacing: '0.04em', fontWeight: 400 }}>
            이만큼이면 충분해요
          </span>
        </button>
        <button onClick={onFinish} className="mf-press" style={{
          height: 44, borderRadius: 14, background: 'transparent', color: 'var(--ink-soft)',
          border: '1px solid var(--hair)', fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer'
        }}>
          완벽 완료
        </button>
      </div>
    </div>);

}

function DayDone() {
  return (
    <div className="mf-fade" style={{ marginTop: 14 }}>
      <div style={{
        marginTop: 24, padding: '32px 24px',
        background: 'var(--paper)', borderRadius: 20, border: '1px solid var(--hair-soft)',
        textAlign: 'center'
      }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto', borderRadius: 999,
          background: 'var(--day-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke="var(--day)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mf-serif" style={{
          marginTop: 18, marginBottom: 0, fontSize: 20, lineHeight: 1.5, color: 'var(--ink)',
          fontStyle: 'italic', fontWeight: 400
        }}>
          오늘 한 발 내디뎠어요.<br />그걸로 충분합니다.
        </p>
      </div>
    </div>);

}

// ───────────────────────────────────────────────────────────
// EVENING — 통합 (Integration) — meaning journal + share toggle
// ───────────────────────────────────────────────────────────
function ScreenEvening({ combo, onShared, onGoGarden }) {
  const [text, setText] = React.useState('');
  const [share, setShare] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const placeholders = [
  '오늘은 그냥 하늘만 봤다. 근데 그게 충분했다.',
  '말 안 한 게 잘한 일이었다.',
  '커피 한 잔이 한 시간을 살렸다.'];


  return (
    <div className="mf-screen mf-fade" data-screen-label="03 Evening" style={{
      height: '100%', overflowY: 'auto', background: MODES.evening.bg, paddingTop: 56, paddingBottom: 130
    }}>
      <TopBar mode="evening" />
      <Horizon mode="evening" />

      <div style={{ padding: '0 24px' }}>
        <div className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.1em', color: 'var(--mute)' }}>
          오늘의 한 줄
        </div>
        <h1 className="mf-serif" style={{
          margin: '12px 0 0', fontSize: 24, lineHeight: 1.5, color: 'var(--ink)', fontWeight: 400,
          fontStyle: 'italic'
        }}>
          오늘 가장 나다웠던 순간이<br />1년 뒤에도 의미가 있을까요?
        </h1>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--mute)' }}>
          — {combo.name}에게 던지는 질문
        </div>

        {/* textarea card */}
        <div style={{
          marginTop: 22, background: 'var(--paper)', borderRadius: 18,
          border: '1px solid var(--hair-soft)', padding: 20, minHeight: 180,
          display: 'flex', flexDirection: 'column'
        }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholders[0]}
            style={{
              flex: 1, minHeight: 130, border: 'none', outline: 'none', resize: 'none',
              fontFamily: 'Noto Serif KR, serif', fontSize: 17, lineHeight: 1.6,
              color: 'var(--ink)', background: 'transparent'
            }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--hair-soft)', paddingTop: 12 }}>
            <span className="mf-mono" style={{ fontSize: 11, color: 'var(--mute)', letterSpacing: '0.06em' }}>
              {text.length} / 200
            </span>
            <span style={{ fontSize: 12, color: 'var(--mute)' }}>한 단어여도 괜찮아요</span>
          </div>
        </div>

        {/* share toggle */}
        <div style={{
          marginTop: 16, padding: '16px 18px', borderRadius: 16,
          background: share ? 'var(--evening-soft)' : 'transparent',
          border: `1px solid ${share ? 'var(--evening)' : 'var(--hair)'}`,
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <button
            onClick={() => setShare(!share)}
            style={{
              width: 44, height: 26, borderRadius: 999,
              background: share ? 'var(--ink)' : 'var(--hair)',
              border: 'none', position: 'relative', cursor: 'pointer', flexShrink: 0,
              transition: 'background .2s'
            }}>
            <div style={{
              position: 'absolute', top: 3, left: share ? 22 : 3,
              width: 20, height: 20, borderRadius: 999, background: '#fff',
              transition: 'left .2s ease',
              boxShadow: '0 1px 2px rgba(0,0,0,.15)'
            }} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Leaf filled={share} color="var(--leaf)" size={14} />
              익명으로 공명방에 흘려보내기
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-soft)', marginTop: 3, lineHeight: 1.45 }}>
              {share ? '전 세계 IN이 무언으로 공명할 수 있어요' : '본인만 보는 일기로 남깁니다'}
            </div>
          </div>
        </div>

        {/* submit */}
        <button
          onClick={() => {setSubmitted(true);if (share) onShared && onShared();}}
          className="mf-press"
          disabled={!text}
          style={{
            marginTop: 18, width: '100%', height: 52, borderRadius: 999,
            background: 'var(--ink)', color: 'var(--paper)', border: 'none',
            fontFamily: 'inherit', fontSize: 15, fontWeight: 500, cursor: 'pointer',
            opacity: text ? 1 : 0.3
          }}>
          오늘을 흘려보내기
        </button>

        {submitted &&
        <div className="mf-fade" style={{ marginTop: 18, textAlign: 'center' }}>
            <p className="mf-serif" style={{ fontSize: 14, color: 'var(--ink-soft)', fontStyle: 'italic' }}>
              {share ? '한 줄이 정원으로 흘러갔어요.' : '오늘의 한 줄, 잘 기록되었어요.'}
            </p>
            {share &&
          <button onClick={onGoGarden} style={{
            marginTop: 8, background: 'transparent', border: 'none', fontFamily: 'inherit',
            fontSize: 13, color: 'var(--evening)', textDecoration: 'underline', textUnderlineOffset: 3, cursor: 'pointer'
          }}>
                정원에서 보기 →
              </button>
          }
          </div>
        }
      </div>
    </div>);

}

// ───────────────────────────────────────────────────────────
// NIGHT — 착륙 (Landing) — vault + 5min timer + first button + blanket
// ───────────────────────────────────────────────────────────
function ScreenNight() {
  const [stage, setStage] = React.useState('vault'); // vault | timer | first | blanket

  return (
    <div className="mf-screen mf-fade" data-screen-label="04 Night" style={{
      height: '100%', overflowY: 'auto', background: 'var(--night-bg)', color: 'var(--night-ink)',
      paddingTop: 56, paddingBottom: 130
    }}>
      <TopBar mode="night" dark />
      <Horizon mode="night" dark />

      {/* stage tabs */}
      <div style={{ padding: '0 24px 14px', display: 'flex', gap: 6 }}>
        {[
        { k: 'vault', label: '01 · 보관함' },
        { k: 'timer', label: '02 · 5분' },
        { k: 'first', label: '03 · 첫 단추' },
        { k: 'blanket', label: '04 · 이불' }].
        map((s) =>
        <button key={s.k} onClick={() => setStage(s.k)} className="mf-press" style={{
          flex: 1, height: 28, borderRadius: 999,
          background: stage === s.k ? 'var(--night-bg-3)' : 'transparent',
          border: `1px solid ${stage === s.k ? 'var(--night-soft-tx)' : 'var(--night-hair)'}`,
          color: stage === s.k ? 'var(--night-ink)' : 'var(--night-soft-tx)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.06em',
          cursor: 'pointer'
        }}>{s.label}</button>
        )}
      </div>

      <div style={{ padding: '0 24px' }}>
        {stage === 'vault' && <NightVault />}
        {stage === 'timer' && <NightTimer />}
        {stage === 'first' && <NightFirst />}
        {stage === 'blanket' && <NightBlanket />}
      </div>
    </div>);

}

function NightVault() {
  const [thoughts, setThoughts] = React.useState(['내일 회의 안건', '디자인 시안 색조 다시', '엄마 전화']);
  const [input, setInput] = React.useState('');
  const [locked, setLocked] = React.useState(false);

  return (
    <div className="mf-fade">
      <p className="mf-serif" style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--night-ink)', fontStyle: 'italic', fontWeight: 300, margin: 0 }}>
        전두엽이 퇴근 중입니다.<br />
        머릿속을 상자에 옮겨두세요.
      </p>

      <div style={{
        marginTop: 22, padding: 18, borderRadius: 18,
        background: 'var(--night-bg-2)', border: `1px solid ${locked ? 'var(--night)' : 'var(--night-hair)'}`,
        transition: 'border-color .3s'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div className={locked ? 'lock-snap' : ''} style={{
            width: 26, height: 26, borderRadius: 7,
            background: locked ? 'var(--night)' : 'var(--night-bg-3)',
            border: `1px solid ${locked ? 'var(--night)' : 'var(--night-hair)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="6" width="8" height="6" rx="1" stroke={locked ? 'var(--night-bg)' : 'var(--night-soft-tx)'} strokeWidth="1.3" fill={locked ? 'var(--night-bg)' : 'none'} />
              <path d={locked ? 'M5 6V4a2 2 0 014 0v2' : 'M5 6V4a2 2 0 014 0'} stroke={locked ? 'var(--night-bg)' : 'var(--night-soft-tx)'} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="mf-mono" style={{ fontSize: 10.5, letterSpacing: '0.1em', color: 'var(--night-soft-tx)' }}>
              THOUGHT VAULT
            </div>
            <div style={{ fontSize: 12, color: 'var(--night-ink)', marginTop: 2 }}>
              {thoughts.length}개 보관 중
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, minHeight: 60 }}>
          {thoughts.map((t, i) =>
          <span key={i} style={{
            padding: '6px 12px', borderRadius: 999,
            background: 'var(--night-bg-3)', border: '1px solid var(--night-hair)',
            fontSize: 12, color: 'var(--night-ink)'
          }}>{t}</span>
          )}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="단어 하나여도 괜찮아요"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && input.trim()) {
                setThoughts([...thoughts, input.trim()]);
                setInput('');
              }
            }}
            style={{
              flex: 1, height: 38, padding: '0 14px', borderRadius: 12,
              border: '1px solid var(--night-hair)', background: 'var(--night-bg)',
              fontFamily: 'inherit', fontSize: 13, color: 'var(--night-ink)', outline: 'none'
            }} />
          
        </div>
      </div>

      <button onClick={() => setLocked(true)} className="mf-press" style={{
        width: '100%', marginTop: 14, height: 50, borderRadius: 14,
        background: locked ? 'var(--night-bg-2)' : 'var(--night-ink)',
        color: locked ? 'var(--night-soft-tx)' : 'var(--night-bg)',
        border: locked ? '1px solid var(--night-hair)' : 'none',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="3" y="6" width="8" height="6" rx="1" stroke={locked ? 'var(--night-soft-tx)' : 'var(--night-bg)'} strokeWidth="1.4" fill="none" />
          <path d="M5 6V4a2 2 0 014 0v2" stroke={locked ? 'var(--night-soft-tx)' : 'var(--night-bg)'} strokeWidth="1.4" fill="none" strokeLinecap="round" />
        </svg>
        {locked ? '잠겼어요 — 안전합니다' : '찰칵 — 잠그기'}
      </button>
    </div>);

}

function NightTimer() {
  return (
    <div className="mf-fade" style={{ paddingTop: 8 }}>
      <p className="mf-serif" style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--night-ink)', fontStyle: 'italic', fontWeight: 300, margin: 0 }}>
        아이디어가 멈추지 않을 때.<br />딱 5분만 쏟아내요.
      </p>

      <div style={{ marginTop: 36, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 220, height: 220 }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="96" stroke="var(--night-hair)" strokeWidth="1.5" fill="none" />
            <circle cx="110" cy="110" r="96" stroke="var(--night)" strokeWidth="2" fill="none"
            strokeDasharray="603" strokeDashoffset="120" strokeLinecap="round"
            transform="rotate(-90 110 110)" />
          </svg>
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
          }}>
            <div className="mf-mono" style={{ fontSize: 50, fontWeight: 300, color: 'var(--night-ink)', letterSpacing: '-0.04em' }}>
              4:03
            </div>
            <div className="mf-mono" style={{ fontSize: 10, color: 'var(--night-soft-tx)', letterSpacing: '0.14em', marginTop: 6 }}>
              POURING OUT
            </div>
          </div>
        </div>
      </div>

      <p className="mf-serif" style={{
        marginTop: 36, fontSize: 15, lineHeight: 1.6, color: 'var(--night-soft-tx)',
        textAlign: 'center', fontStyle: 'italic'
      }}>
        여기까지. 나머지는<br />내일의 당신이 더 잘 해낼 거예요.
      </p>
    </div>);

}

function NightFirst() {
  const items = [
  { k: 'water', icon: '💧', label: '물 한 잔 마시기' },
  { k: 'stretch', icon: '🧘', label: '스트레칭 1번' },
  { k: 'vit', icon: '💊', label: '영양제 먹기' },
  { k: 'custom', icon: '✏️', label: '직접 입력' }];

  const [pick, setPick] = React.useState('water');
  return (
    <div className="mf-fade" style={{ paddingTop: 8 }}>
      <p className="mf-serif" style={{ fontSize: 19, lineHeight: 1.55, color: 'var(--night-ink)', fontStyle: 'italic', fontWeight: 300, margin: "0px 0px 0px 70px" }}>
        내일 눈 뜨자마자 할,<br />2분짜리 하나를 골라요.
      </p>
      <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map((it) => {
          const on = pick === it.k;
          return (
            <button key={it.k} onClick={() => setPick(it.k)} className="mf-press" style={{
              padding: '20px 16px', borderRadius: 16,
              background: on ? 'var(--night-bg-3)' : 'var(--night-bg-2)',
              border: `1px solid ${on ? 'var(--night)' : 'var(--night-hair)'}`,
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
              fontFamily: 'inherit', cursor: 'pointer'
            }}>
              <div style={{ fontSize: 28 }}>{it.icon}</div>
              <div style={{ fontSize: 13.5, color: 'var(--night-ink)', textAlign: 'left' }}>{it.label}</div>
            </button>);

        })}
      </div>
      <button className="mf-press" style={{
        width: '100%', marginTop: 18, height: 50, borderRadius: 14,
        background: 'var(--night-ink)', color: 'var(--night-bg)', border: 'none',
        fontFamily: 'inherit', fontSize: 14, fontWeight: 500, cursor: 'pointer'
      }}>
        예약 — 내일 아침에 만나요
      </button>
    </div>);

}

function NightBlanket() {
  return (
    <div className="mf-fade" style={{
      paddingTop: 40, paddingBottom: 40, textAlign: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 36
    }}>
      <div className="mf-breath" style={{
        width: 140, height: 140, borderRadius: 999,
        background: 'radial-gradient(circle at 30% 30%, var(--night-soft) 0%, var(--night) 70%, var(--night-bg-2) 100%)',
        boxShadow: '0 0 80px rgba(143,136,176,0.25)'
      }} />
      <div>
        <p className="mf-serif" style={{
          margin: 0, fontSize: 22, lineHeight: 1.7, color: 'var(--night-ink)',
          fontStyle: 'italic', fontWeight: 300, letterSpacing: '-0.005em'
        }}>
          지금 덮고 있는<br />
          이불의 촉감에만 집중해요.
        </p>
        <p className="mf-serif" style={{
          marginTop: 22, fontSize: 17, lineHeight: 1.7, color: 'var(--night-soft-tx)',
          fontStyle: 'italic', fontWeight: 300
        }}>
          길게 숨을 내쉬어요.<br />
          당신은 충분히 잘하고 있어요.
        </p>
      </div>
      <div className="mf-mono" style={{ fontSize: 10.5, letterSpacing: '0.18em', color: 'var(--night-soft-tx)' }}>
        화면이 15초 후 꺼져요
      </div>
    </div>);

}

Object.assign(window, { ScreenMorning, ScreenDay, ScreenEvening, ScreenNight });