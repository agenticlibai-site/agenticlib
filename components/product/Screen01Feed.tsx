import ScaleWrapper from './ScaleWrapper';

const HTML = `<div style="width: 1440px; height: 760px; box-sizing: border-box; padding: 48px; background: #EFEDE8; font-family: 'DM Sans', system-ui, sans-serif; color: #16181D; display: flex; gap: 56px; align-items: stretch; overflow: hidden">

  <div style="width: 440px; flex-shrink: 0; display: flex; flex-direction: column; justify-content: center; gap: 20px">
    <h2 style="margin: 0; font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; font-size: 104px; line-height: 1; letter-spacing: -0.02em">Feed</h2>
    <p style="margin: 0; font-size: 24px; line-height: 1.4; color: #5A5F6B">Drop in lost deal notes, calls and tickets. Duplicates and noise are skipped.</p>
  </div>

  <div style="position: relative; flex: 1; min-width: 0; border-radius: 32px; background: #CDE6E1; overflow: hidden">
    <div style="position: absolute; left: -90px; top: -70px; width: 320px; height: 320px; border-radius: 50%; background: rgba(255,255,255,0.4)"></div>
    <div style="position: absolute; right: -60px; bottom: -90px; width: 360px; height: 360px; border-radius: 50%; background: rgba(255,255,255,0.3)"></div>

    <div style="position: absolute; left: 64px; top: 64px; width: 820px; height: 720px; box-sizing: border-box; padding: 28px 32px; background: #FFFFFF; border-radius: 24px; box-shadow: 0 24px 60px rgba(22,24,29,0.14)">
      <div style="display: flex; align-items: center; gap: 12px">
        <div style="width: 22px; height: 22px; border-radius: 7px; background: #1F6F5C"></div>
        <div style="font-size: 16px; font-weight: 700">FeatureStream</div>
        <div style="margin-left: auto; padding: 4px 12px; border-radius: 999px; background: #FFF1D6; color: #7A4A00; font-size: 13px; font-weight: 600">Sample data</div>
      </div>
      <div style="margin-top: 28px; font-size: 24px; font-weight: 600">Upload signals</div>
      <div style="margin-top: 4px; font-size: 14px; color: #5A5F6B">One CSV, one column of text.</div>

      <div style="margin-top: 20px; padding: 32px; border: 2px dashed #B9CFC1; border-radius: 20px; background: #F1F8F4; text-align: center">
        <div style="width: 48px; height: 48px; margin: 0 auto; border-radius: 50%; background: #D5ECE1; display: flex; align-items: center; justify-content: center; color: #14503F"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M6.5 9.5L12 4l5.5 5.5M5 20h14"/></svg></div>
        <div style="margin-top: 12px; font-size: 18px; font-weight: 600">sample_signals.csv</div>
        <div style="margin-top: 4px; font-size: 14px; color: #5A5F6B">60 rows</div>
      </div>

      <div style="margin-top: 14px; display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 14px; background: #D5ECE1; color: #14503F; font-size: 15px; font-weight: 500">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>
        Uploaded 60 new signals, skipped 0 duplicates. Ranked 8, held back 4.
      </div>

      <div style="margin-top: 16px; border: 1px solid #ECEAE5; border-radius: 14px; overflow: hidden; font-size: 14px">
        <div style="display: flex; align-items: center; padding: 12px 16px"><div style="flex: 1">Customers repeat their issue after the bot hands off</div><div style="width: 200px; font-weight: 600">Human handoff</div><span style="padding: 2px 10px; border-radius: 999px; background: #D5ECE1; color: #14503F; font-size: 12px; font-weight: 700">High</span></div>
        <div style="display: flex; align-items: center; padding: 12px 16px; border-top: 1px solid #ECEAE5"><div style="flex: 1">Need replies in Portuguese and Spanish</div><div style="width: 200px; font-weight: 600">Multilingual</div><span style="padding: 2px 10px; border-radius: 999px; background: #D5ECE1; color: #14503F; font-size: 12px; font-weight: 700">High</span></div>
        <div style="display: flex; align-items: center; padding: 12px 16px; border-top: 1px solid #ECEAE5"><div style="flex: 1">Office coffee machine is broken again</div><div style="width: 200px; color: #5A5F6B">No match</div><span style="padding: 2px 10px; border-radius: 999px; background: #FFF1D6; color: #7A4A00; font-size: 12px; font-weight: 700">Skipped</span></div>
      </div>
    </div>

  </div>
</div>`;

export default function Screen01Feed() {
  return (
    <ScaleWrapper designWidth={1440} designHeight={760}>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </ScaleWrapper>
  );
}
