import ScaleWrapper from './ScaleWrapper';

const HTML = `<div style="width:848px;height:664px;position:relative;border-radius:36px;background:linear-gradient(160deg,#F2D067 0%,#F7E1A0 50%,#FCF1CF 100%);overflow:hidden;font-family:'DM Sans',system-ui,sans-serif;color:#16181D">

  <div style="position:absolute;left:-60px;top:260px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,0.55);filter:blur(34px)"></div>
  <div style="position:absolute;right:-40px;top:40px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.45);filter:blur(34px)"></div>
  <div style="position:absolute;right:80px;bottom:-80px;width:340px;height:340px;border-radius:50%;background:rgba(255,255,255,0.5);filter:blur(40px)"></div>

  <div style="position:absolute;left:24px;top:28px;width:824px;height:760px;box-sizing:border-box;padding:20px 28px 0 20px;background:#F7F6F3;border-radius:28px 0 0 0;box-shadow:0 20px 60px rgba(120,90,10,0.2)">
    <div style="display:flex;gap:16px;height:100%">

      <!-- Sidebar -->
      <div style="width:56px;flex-shrink:0;display:flex;flex-direction:column;gap:6px;align-items:center">
        <div style="width:28px;height:28px;border-radius:9px;background:#1F6F5C;margin-bottom:10px"></div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Overview</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Customer requests</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="10" rx="1.5"/><rect x="17" y="4" width="4" height="13" rx="1.5"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Feature status</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20V10M12 20V4M19 20v-7"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Impact</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Changelog</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Documents</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:#D5ECE1;color:#14503F">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:600">Post-launch evaluation</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h12a2 2 0 012 2v14H7a2 2 0 01-2-2z"/><path d="M9 8h6M9 12h6"/></svg>
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Historical features</span>
        </div>
      </div>

      <!-- Main content -->
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;height:43px">
          <div style="font-family:'Instrument Serif',Georgia,serif;font-size:40px;line-height:1.1;letter-spacing:-0.01em;white-space:nowrap">Post-launch evaluation</div>
          <div style="margin-left:auto;display:flex;gap:8px;align-items:center">
            <span style="padding:4px 12px;border-radius:999px;background:#D5ECE1;color:#14503F;font-size:12px;font-weight:700;white-space:nowrap">Live traces</span>
            <div style="height:36px;box-sizing:border-box;padding:0 16px;border-radius:18px;background:#1F6F5C;color:#FFFFFF;display:flex;align-items:center;font-size:13px;font-weight:600;white-space:nowrap">Run evaluation</div>
          </div>
        </div>

        <div style="margin-top:8px;height:1px;background:#DAD8D2"></div>

        <!-- Stats -->
        <div style="margin-top:10px;background:#FFFFFF;border-radius:14px;box-shadow:0 1px 8px rgba(22,24,29,0.06);padding:12px 18px">
          <div style="display:flex;gap:10px">
            <div style="flex:1"><div style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">EVALUATED</div><div style="margin-top:1px;font-size:24px;line-height:1.1;color:#16181D">2</div></div>
            <div style="flex:1"><div style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">ON TARGET</div><div style="margin-top:1px;font-size:24px;line-height:1.1;color:#1F6F5C">1</div></div>
            <div style="flex:1"><div style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">NEAR TARGET</div><div style="margin-top:1px;font-size:24px;line-height:1.1;color:#7A4A00">1</div></div>
            <div style="flex:1"><div style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">NOT LAUNCHED</div><div style="margin-top:1px;font-size:24px;line-height:1.1;color:#8A8F9B">1</div></div>
          </div>
        </div>

        <!-- Table -->
        <div style="margin-top:10px;padding:8px;border-radius:16px;background:#F0EEE9">
          <div style="display:grid;grid-template-columns:minmax(0,1fr) 92px 70px 104px 62px 68px;gap:10px;padding:2px 14px 7px;font-size:11px;font-weight:600;color:#6B707C">
            <div>Feature and what was checked</div><div>Verdict</div><div>Target</div><div>Result</div><div>Traces</div><div>Trend</div>
          </div>
          <div style="display:flex;flex-direction:column;gap:5px">

            <div style="display:grid;grid-template-columns:minmax(0,1fr) 92px 70px 104px 62px 68px;gap:10px;align-items:center;padding:10px 14px;background:#FFFFFF;border:1px solid #EAE8E2;border-radius:12px">
              <div style="min-width:0"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Stop hallucinated refund policies</div><div style="margin-top:3px;display:flex;align-items:center;gap:7px;white-space:nowrap;overflow:hidden"><span style="flex-shrink:0;padding:1px 8px;border-radius:999px;background:#FFF1D6;color:#7A4A00;font-size:10.5px;font-weight:700">Agentic fix</span><span style="font-size:11px;color:#5A5F6B;overflow:hidden;text-overflow:ellipsis">Wrong policy in 31 of 1,000 chats</span></div></div>
              <div><span style="padding:3px 9px;border-radius:999px;background:#FFF1D6;color:#7A4A00;font-size:11px;font-weight:700;white-space:nowrap">Near target</span></div>
              <div style="font-size:12px;color:#5A5F6B;white-space:nowrap">Eval 94</div>
              <div style="white-space:nowrap"><div style="font-size:12px;font-weight:700">Eval 81 to 93</div><div style="font-size:10.5px;color:#5A5F6B">Day 14 of 14</div></div>
              <div style="font-size:12px;color:#5A5F6B;white-space:nowrap">10 failing</div>
              <div><svg width="64" height="24" viewBox="0 0 64 24"><polyline points="2,21 6.3,18 10.6,15 14.9,16.5 19.1,12 23.4,10.5 27.7,9 32,7.5 36.3,7.5 40.6,6 44.9,4.5 49.1,4.5 53.4,3 57.7,3 62,3" fill="none" stroke="#C98A1B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>

            <div style="display:grid;grid-template-columns:minmax(0,1fr) 92px 70px 104px 62px 68px;gap:10px;align-items:center;padding:10px 14px;background:#FFFFFF;border:1px solid #EAE8E2;border-radius:12px">
              <div style="min-width:0"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Reply in the customer&#39;s language</div><div style="margin-top:3px;display:flex;align-items:center;gap:7px;white-space:nowrap;overflow:hidden"><span style="flex-shrink:0;padding:1px 8px;border-radius:999px;background:#D5ECE1;color:#14503F;font-size:10.5px;font-weight:700">New feature</span><span style="font-size:11px;color:#5A5F6B;overflow:hidden;text-overflow:ellipsis">Spanish and German chats</span></div></div>
              <div><span style="padding:3px 9px;border-radius:999px;background:#D5ECE1;color:#14503F;font-size:11px;font-weight:700;white-space:nowrap">On target</span></div>
              <div style="font-size:12px;color:#5A5F6B;white-space:nowrap">+$8K / mo</div>
              <div style="white-space:nowrap"><div style="font-size:12px;font-weight:700">+$9K / mo</div><div style="font-size:10.5px;color:#5A5F6B">2 weeks</div></div>
              <div style="font-size:12px;color:#5A5F6B;white-space:nowrap">2 failing</div>
              <div><svg width="64" height="24" viewBox="0 0 64 24"><polyline points="2,21 17,21 32,21 47,17 62,3" fill="none" stroke="#1F6F5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
            </div>

            <div style="display:grid;grid-template-columns:minmax(0,1fr) 92px 70px 104px 62px 68px;gap:10px;align-items:center;padding:10px 14px;background:#FFFFFF;border:1px solid #EAE8E2;border-radius:12px">
              <div style="min-width:0"><div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Let the agent refund small orders</div><div style="margin-top:3px;display:flex;align-items:center;gap:7px;white-space:nowrap;overflow:hidden"><span style="flex-shrink:0;padding:1px 8px;border-radius:999px;background:#D5ECE1;color:#14503F;font-size:10.5px;font-weight:700">New feature</span><span style="font-size:11px;color:#5A5F6B;overflow:hidden;text-overflow:ellipsis">In development</span></div></div>
              <div><span style="padding:3px 9px;border-radius:999px;background:#ECEAE5;color:#5A5F6B;font-size:11px;font-weight:700;white-space:nowrap">Not launched</span></div>
              <div style="font-size:12px;color:#5A5F6B;white-space:nowrap">Eval 90+</div>
              <div style="white-space:nowrap"><div style="font-size:12px;font-weight:700">&#8212;</div><div style="font-size:10.5px;color:#5A5F6B">After launch</div></div>
              <div style="font-size:12px;color:#5A5F6B;white-space:nowrap">&#8212;</div>
              <div style="font-size:11px;color:#8A8F9B">&#8212;</div>
            </div>

          </div>
        </div>

        <!-- Bottom: chart + still failing -->
        <div style="margin-top:10px;display:flex;gap:10px">

          <div style="flex:1.1;min-width:0;background:#FFFFFF;border-radius:14px;box-shadow:0 1px 8px rgba(22,24,29,0.06);padding:12px 14px 8px">
            <div style="display:flex;align-items:center"><span style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">EVAL PASS RATE</span></div>
            <div style="margin-top:6px">
              <svg style="display:block;width:100%;height:auto" viewBox="0 0 372 150">
                <line x1="30" x2="360" y1="114.4" y2="114.4" stroke="#EEECE7"/><text x="24" y="117.9" text-anchor="end" font-size="9.5" fill="#8A8F9B">80</text>
                <line x1="30" x2="360" y1="85.4" y2="85.4" stroke="#EEECE7"/><text x="24" y="88.9" text-anchor="end" font-size="9.5" fill="#8A8F9B">85</text>
                <line x1="30" x2="360" y1="56.4" y2="56.4" stroke="#EEECE7"/><text x="24" y="59.9" text-anchor="end" font-size="9.5" fill="#8A8F9B">90</text>
                <line x1="30" x2="360" y1="27.4" y2="27.4" stroke="#EEECE7"/><text x="24" y="30.9" text-anchor="end" font-size="9.5" fill="#8A8F9B">95</text>
                <line x1="30" x2="360" y1="33.2" y2="33.2" stroke="#1F6F5C" stroke-width="1.5" stroke-dasharray="5 4"/>
                <text x="34" y="29.2" font-size="10" font-weight="700" fill="#1F6F5C">Target 94%</text>
                <line x1="30" x2="360" y1="108.6" y2="108.6" stroke="#B9B6AD" stroke-width="1.5" stroke-dasharray="3 4"/>
                <text x="34" y="121.6" font-size="10" font-weight="600" fill="#6B6F7B">Before launch 81%</text>
                <path d="M30,126 L30,108.6 L53.6,97 L77.1,85.4 L100.7,91.2 L124.3,73.8 L147.9,68 L171.4,62.2 L195,56.4 L218.6,56.4 L242.1,50.6 L265.7,44.8 L289.3,44.8 L312.9,39 L336.4,39 L360,39 L360,126 Z" fill="#1F6F5C" fill-opacity="0.10"/>
                <polyline points="30,108.6 53.6,97 77.1,85.4 100.7,91.2 124.3,73.8 147.9,68 171.4,62.2 195,56.4 218.6,56.4 242.1,50.6 265.7,44.8 289.3,44.8 312.9,39 336.4,39 360,39" fill="none" stroke="#1F6F5C" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
                <circle cx="171.4" cy="62.2" r="4" fill="#fff" stroke="#C98A1B" stroke-width="2"/>
                <text x="171.4" y="53.2" text-anchor="middle" font-size="10" font-weight="600" fill="#7A4A00">Policy lookup tool added</text>
                <circle cx="360" cy="39" r="4.5" fill="#1F6F5C"/>
                <text x="352" y="56" text-anchor="end" font-size="11.5" font-weight="700" fill="#14503F">93%</text>
                <text x="30" y="143" font-size="9.5" fill="#8A8F9B">24 Sep · launch</text>
                <text x="195" y="143" text-anchor="middle" font-size="9.5" fill="#8A8F9B">1 Oct</text>
                <text x="360" y="143" text-anchor="end" font-size="9.5" fill="#8A8F9B">8 Oct</text>
              </svg>
            </div>
          </div>

          <div style="flex:1;min-width:0;background:#FFFFFF;border-radius:14px;box-shadow:0 1px 8px rgba(22,24,29,0.06);padding:12px 14px;display:flex;flex-direction:column">
            <div style="font-size:10.5px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B;margin-bottom:6px">STILL FAILING IN LIVE TRACES</div>
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #EFEDE8">
              <span style="width:52px;text-align:center;padding:2px 0;border-radius:999px;background:#FDECEC;color:#B3261E;font-size:10.5px;font-weight:700">High</span>
              <span style="flex:1;min-width:0;font-size:12.5px;font-weight:600;line-height:1.25">Agent says gift cards are refundable</span>
              <span style="font-size:11.5px;color:#5A5F6B;white-space:nowrap">5 traces</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #EFEDE8">
              <span style="width:52px;text-align:center;padding:2px 0;border-radius:999px;background:#FFF1D6;color:#7A4A00;font-size:10.5px;font-weight:700">Medium</span>
              <span style="flex:1;min-width:0;font-size:12.5px;font-weight:600;line-height:1.25">Final-sale items offered a full refund</span>
              <span style="font-size:11.5px;color:#5A5F6B;white-space:nowrap">3 traces</span>
            </div>
            <div style="margin-top:auto;display:flex;align-items:center;gap:8px;padding-top:10px">
              <div style="height:34px;box-sizing:border-box;padding:0 14px;border-radius:17px;background:#1F6F5C;color:#FFFFFF;display:flex;align-items:center;font-size:12.5px;font-weight:600;white-space:nowrap">Add follow-up to Choose</div>
              <span style="font-size:11px;color:#5A5F6B">Example data</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>`;

export default function Screen12PostLaunchEval() {
  return (
    <ScaleWrapper designWidth={848} designHeight={664}>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </ScaleWrapper>
  );
}
