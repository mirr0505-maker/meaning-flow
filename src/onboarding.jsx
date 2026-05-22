/* Meaning Flow — Onboarding (dual MBTI selection) */

const MBTI_OPTIONS = [
{ k: 'INFP', titleSolo: '깊은 의미를 따라가는', titleSocial: '조용히 공감하는', desc: '느낌과 가치가 먼저, 그 다음이 말' },
{ k: 'INFJ', titleSolo: '먼 곳을 바라보는', titleSocial: '사람을 읽는', desc: '드러내지 않지만 깊게 본다' },
{ k: 'INTP', titleSolo: '질문에서 멈추는', titleSocial: '관찰하고 분해하는', desc: '왜?에서 또 다른 왜?로' },
{ k: 'INTJ', titleSolo: '구조를 짓는', titleSocial: '계획을 끌고 가는', desc: '머릿속에 이미 완성된 그림' }];


function Onboarding({ step, setStep, solo, setSolo, social, setSocial, onDone }) {
  const total = 3;

  return (
    <div className="mf-screen mf-fade" data-screen-label="00 Onboarding" style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'var(--paper-warm)', paddingTop: 56
    }}>
      {/* progress */}
      <div style={{ padding: '12px 24px 0', display: 'flex', gap: 6 }}>
        {[0, 1, 2].map((i) =>
        <div key={i} style={{
          flex: 1, height: 2, borderRadius: 999,
          background: i <= step ? 'var(--ink)' : 'var(--hair)'
        }} />
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px 24px' }}>
        {step === 0 && <OBIntro />}
        {step === 1 && <OBPickMBTI
          title="방문을 닫고 혼자 있을 때,"
          subtitle="당신은 어떤 모습인가요?"
          tag="혼자일 때의 나 · Solo"
          tagColor="var(--evening)"
          value={solo} onChange={setSolo}
          field="Solo" />
        }
        {step === 2 && <OBPickMBTI
          title="사람들 사이에 있을 때,"
          subtitle="당신은 어떤 역할로 존재하나요?"
          tag="함께일 때의 나 · Social"
          tagColor="var(--day)"
          value={social} onChange={setSocial}
          field="Social" />
        }
      </div>

      {/* bottom action */}
      <div style={{ padding: '12px 24px 48px', display: 'flex', gap: 12 }}>
        {step > 0 &&
        <button className="mf-press" onClick={() => setStep(step - 1)} style={{
          flex: '0 0 auto', height: 52, padding: '0 22px', borderRadius: 999,
          border: '1px solid var(--hair)', background: 'transparent',
          fontFamily: 'inherit', fontSize: 14, color: 'var(--ink-soft)', cursor: 'pointer'
        }}>이전</button>
        }
        <button
          className="mf-press"
          disabled={step === 1 && !solo || step === 2 && !social}
          onClick={() => step < total - 1 ? setStep(step + 1) : onDone()}
          style={{
            flex: 1, height: 52, borderRadius: 999,
            border: 'none', background: 'var(--ink)', color: 'var(--paper-warm)',
            fontFamily: 'inherit', fontSize: 15, fontWeight: 500, letterSpacing: '0.02em',
            cursor: 'pointer',
            opacity: step === 1 && !solo || step === 2 && !social ? 0.3 : 1
          }}>
          
          {step === 0 && '시작할게요'}
          {step === 1 && '다음 자아로'}
          {step === 2 && '나의 조합 보기'}
        </button>
      </div>
    </div>);

}

function OBIntro() {
  return (
    <div style={{ paddingTop: 24 }}>
      <div style={{ fontSize: 13, color: 'var(--mute)', letterSpacing: '0.08em', marginBottom: 18 }}>
        MEANING FLOW
      </div>
      <h1 className="mf-serif" style={{
        margin: 0, lineHeight: 1.35, color: 'var(--ink)',
        fontWeight: 400, letterSpacing: '-0.01em', fontSize: "30px"
      }}>
        당신은 게으른 게 아니에요.<br />
        다른 연료로<br />
        움직이는 엔진일 뿐.
      </h1>
      <p style={{
        marginTop: 28, fontSize: 14.5, lineHeight: 1.7, color: 'var(--ink-soft)'
      }}>
        이 앱은 당신을 더 부지런하게 만들지 않습니다.<br />
        대신 두 가지를 묻고, 천천히 시작합니다.
      </p>

      <div style={{ marginTop: 36, borderTop: '1px solid var(--hair)' }}>
        <OBIntroRow num="01" title="혼자 있을 때의 나" desc="방문을 닫고 있을 때의 모습" />
        <OBIntroRow num="02" title="함께 있을 때의 나" desc="사람들 사이에서의 역할" />
        <OBIntroRow num="03" title="당신의 조합 닉네임" desc="앱이 당신을 부르는 이름" last />
      </div>
    </div>);

}

function OBIntroRow({ num, title, desc, last }) {
  return (
    <div style={{
      padding: '20px 4px', borderBottom: last ? 'none' : '1px solid var(--hair)',
      display: 'flex', gap: 18, alignItems: 'baseline'
    }}>
      <span className="mf-mono" style={{ fontSize: 12, color: 'var(--mute)', letterSpacing: '0.05em' }}>{num}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--mute)', marginTop: 3 }}>{desc}</div>
      </div>
    </div>);

}

function OBPickMBTI({ title, subtitle, tag, tagColor, value, onChange, field }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{ width: 6, height: 6, borderRadius: 999, background: tagColor }} />
        <span className="mf-mono" style={{ fontSize: 11, letterSpacing: '0.08em', color: 'var(--mute)' }}>
          {tag.toUpperCase()}
        </span>
      </div>
      <h2 className="mf-serif" style={{
        margin: 0, fontSize: 24, lineHeight: 1.45, color: 'var(--ink)',
        fontWeight: 400, letterSpacing: '-0.005em'
      }}>
        {title}<br />{subtitle}
      </h2>

      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {MBTI_OPTIONS.map((o) => {
          const on = value === o.k;
          const title = field === 'Solo' ? o.titleSolo : o.titleSocial;
          return (
            <button
              key={o.k}
              onClick={() => onChange(o.k)}
              className="mf-press"
              style={{
                padding: '16px 16px 18px',
                background: on ? 'var(--ink)' : 'var(--paper)',
                border: `1px solid ${on ? 'var(--ink)' : 'var(--hair-soft)'}`,
                borderRadius: 16, textAlign: 'left',
                color: on ? 'var(--paper-warm)' : 'var(--ink)',
                cursor: 'pointer', fontFamily: 'inherit',
                display: 'flex', flexDirection: 'column', gap: 6, minHeight: 122
              }}>
              
              <div className="mf-mono" style={{
                fontSize: 13, letterSpacing: '0.06em',
                color: on ? 'var(--paper-warm)' : 'var(--mute)', opacity: on ? 0.7 : 1
              }}>{o.k}</div>
              <div style={{ fontSize: 14, lineHeight: 1.35, fontWeight: 500, marginTop: 2 }}>{title}</div>
              <div style={{
                fontSize: 12, lineHeight: 1.45, marginTop: 'auto',
                color: on ? 'var(--paper-warm)' : 'var(--ink-soft)', opacity: on ? 0.75 : 1
              }}>{o.desc}</div>
            </button>);

        })}
      </div>

      <button
        onClick={() => onChange(null)}
        style={{
          marginTop: 22, background: 'transparent', border: 'none',
          fontFamily: 'inherit', fontSize: 13, color: 'var(--mute)', cursor: 'pointer',
          textDecoration: 'underline', textUnderlineOffset: 3
        }}>
        MBTI 잘 모르겠어요
      </button>
    </div>);

}

Object.assign(window, { Onboarding });