/* Meaning Flow — main app */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "mode": "morning",
  "comboIdx": 0,
  "showOnboarding": false,
  "accentSet": "soft"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [tab, setTab] = React.useState('flow');
  const [view, setView] = React.useState(t.showOnboarding ? 'onboarding' : 'app');

  // onboarding state
  const [obStep, setObStep] = React.useState(0);
  const [obSolo, setObSolo] = React.useState(null);
  const [obSocial, setObSocial] = React.useState(null);

  // current combo
  const combo = COMBOS[t.comboIdx] || COMBOS[0];

  // dark mode on night
  const isDark = t.mode === 'night' && tab === 'flow';

  React.useEffect(() => {
    if (t.showOnboarding) setView('onboarding');
  }, [t.showOnboarding]);

  const finishOnboarding = () => {
    // find matching combo, fall back to current
    const match = COMBOS.findIndex(c =>
      (c.solo === obSolo && c.social === obSocial) || (c.solo === obSocial && c.social === obSolo)
    );
    if (match >= 0) setTweak('comboIdx', match);
    setView('app');
    setTweak('showOnboarding', false);
    setObStep(0); setObSolo(null); setObSocial(null);
  };

  let screen;
  if (view === 'onboarding') {
    screen = <Onboarding
      step={obStep} setStep={setObStep}
      solo={obSolo} setSolo={setObSolo}
      social={obSocial} setSocial={setObSocial}
      onDone={finishOnboarding}
    />;
  } else if (tab === 'flow') {
    if (t.mode === 'morning')  screen = <ScreenMorning combo={combo} />;
    if (t.mode === 'day')      screen = <ScreenDay />;
    if (t.mode === 'evening')  screen = <ScreenEvening combo={combo}
                                          onShared={() => {}}
                                          onGoGarden={() => setTab('garden')} />;
    if (t.mode === 'night')    screen = <ScreenNight />;
  } else if (tab === 'garden') {
    screen = <ScreenGarden />;
  } else if (tab === 'me') {
    screen = <ScreenMe combo={combo} setView={setView} />;
  }

  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <IOSDevice width={402} height={874} dark={isDark}>
        <div style={{ position: 'relative', height: '100%' }}>
          {screen}
          {view !== 'onboarding' && (
            <BottomNav tab={tab} onPick={setTab} dark={isDark} />
          )}
        </div>
      </IOSDevice>

      <TweaksPanel title="Tweaks">
        <TweakSection title="시간대 (Flow 탭)">
          <TweakSelect
            label="현재 모드"
            value={t.mode}
            onChange={v => setTweak('mode', v)}
            options={[
              { value: 'morning', label: '🌅 점화 (06–10시)' },
              { value: 'day',     label: '☀️ 실행 (10–18시)' },
              { value: 'evening', label: '🌆 통합 (18–22시)' },
              { value: 'night',   label: '🌙 착륙 (22–02시)' },
            ]}
          />
        </TweakSection>

        <TweakSection title="두 자아 조합">
          <TweakSelect
            label="조합 닉네임"
            value={t.comboIdx}
            onChange={v => setTweak('comboIdx', Number(v))}
            options={COMBOS.map((c, i) => ({
              value: i, label: `${c.solo} × ${c.social} — ${c.name}`,
            }))}
          />
          <TweakButton onClick={() => { setView('onboarding'); setTweak('showOnboarding', true); }}>
            온보딩 다시 보기
          </TweakButton>
        </TweakSection>

        <TweakSection title="빠른 이동">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            <TweakButton onClick={() => { setView('app'); setTab('flow'); }}>흐름</TweakButton>
            <TweakButton onClick={() => { setView('app'); setTab('garden'); }}>정원</TweakButton>
            <TweakButton onClick={() => { setView('app'); setTab('me'); }}>나</TweakButton>
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
