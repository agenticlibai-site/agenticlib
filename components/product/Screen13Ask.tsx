import ScaleWrapper from './ScaleWrapper';

const ICON = (paths: string, size = 18) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const BTN_RESET = 'appearance:none;font:inherit;color:inherit;text-align:left;cursor:pointer;margin:0';

const FOCUS_TILES = [
  { title: 'Product catalogue', desc: 'Ask about one feature, its signals and status', icon: '<path d="M4 5h12a2 2 0 012 2v13H6a2 2 0 01-2-2z"/><path d="M8 9h6M8 13h6"/>' },
  { title: 'Generate documents', desc: 'Draft a PRD, brief or release note from evidence', icon: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h4"/>' },
  { title: 'Agentic failures', desc: 'Find where your agent goes wrong', icon: '<path d="M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 001.7 3h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>' },
  { title: 'Competitor research', desc: 'See what rivals ship and where you trail them', icon: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>' },
  { title: 'Post-launch evaluation', desc: 'Check if a shipped fix hit its target', icon: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>' },
];

const EXAMPLES = [
  'Which agent failures came up most in chats this week?',
  'Write a PRD for letting the agent refund small orders',
  'Did the policy lookup fix move our eval pass rate?',
];

const HTML = `<div style="width:848px;height:664px;position:relative;border-radius:36px;background:linear-gradient(160deg,#6495ED 0%,#9DBCF4 50%,#D4E2FB 100%);overflow:hidden;font-family:'DM Sans',system-ui,sans-serif;color:#16181D">

  <div style="position:absolute;left:-60px;top:260px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,0.55);filter:blur(34px)"></div>
  <div style="position:absolute;right:-40px;top:40px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.45);filter:blur(34px)"></div>

  <div style="position:absolute;left:24px;top:28px;width:824px;height:760px;box-sizing:border-box;padding:20px 28px 0 20px;background:#F7F6F3;border-radius:28px 0 0 0;box-shadow:0 20px 60px rgba(30,70,150,0.22)">
    <div style="display:flex;gap:16px;height:100%">

      <!-- Sidebar -->
      <div style="width:56px;flex-shrink:0;display:flex;flex-direction:column;gap:6px;align-items:center">
        <div style="width:28px;height:28px;border-radius:9px;background:#1F6F5C;margin-bottom:10px"></div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;background:#D5ECE1;color:#14503F">
          ${ICON('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>', 20)}
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:600">Ask</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          ${ICON('<path d="M4 5h16v11H9l-5 4z"/>', 20)}
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Chats</span>
        </div>
        <div style="width:56px;height:56px;box-sizing:border-box;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;color:#6B707C">
          ${ICON('<path d="M6 3h12v18l-6-4-6 4z"/>', 20)}
          <span style="font-size:9.5px;line-height:1.1;text-align:center;font-weight:500">Saved</span>
        </div>
      </div>

      <!-- Main content -->
      <div style="flex:1;min-width:0;padding:6px 8px 0 12px">
        <div style="font-family:'Instrument Serif',Georgia,serif;font-size:40px;line-height:1.1;letter-spacing:-0.01em">Morning!<br><span style="color:#1F6F5C">What do you want to know?</span></div>

        <!-- Prompt box -->
        <div style="margin-top:18px;position:relative;box-sizing:border-box;height:88px;background:#fff;border-radius:20px;padding:16px 20px;box-shadow:0 0 0 1px #E4E2DC,0 10px 34px rgba(31,111,92,0.22)">
          <div style="font-size:15px;color:#16181D">What should we fix first to stop losing deals over refunds?<span style="display:inline-block;width:1.5px;height:17px;background:#1F6F5C;vertical-align:-3px;margin-left:2px"></span></div>
          <div style="position:absolute;left:14px;right:16px;bottom:16px;display:flex;align-items:center;gap:6px">
            <span style="margin-left:auto;color:#8A8F9B;display:flex;margin-right:6px">${ICON('<path d="M20 11l-8.5 8.5a5 5 0 01-7-7L13 4a3.5 3.5 0 015 5l-8.5 8.5a2 2 0 01-3-3L14 7"/>', 20)}</span>
            <span style="width:36px;height:36px;border-radius:50%;background:#1F6F5C;color:#fff;display:flex;align-items:center;justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></span>
          </div>
        </div>

        <!-- Focus tiles -->
        <div style="margin-top:16px;font-size:13px;color:#6B707C">Or start with a focus</div>
        <div style="margin-top:8px;display:flex;gap:8px">
          ${FOCUS_TILES.map(t => `<button type="button" style="${BTN_RESET};flex:1;min-width:0;box-sizing:border-box;background:#fff;border:1px solid #EAE8E2;border-radius:14px;padding:12px 12px 11px;box-shadow:0 2px 10px rgba(31,111,92,0.07)">
            <div style="width:30px;height:30px;border-radius:9px;background:#E3F1EB;color:#1F6F5C;display:flex;align-items:center;justify-content:center">${ICON(t.icon)}</div>
            <div style="margin-top:10px;font-size:13px;font-weight:600;line-height:1.25;height:33px">${t.title}</div>
            <div style="margin-top:4px;font-size:11px;line-height:1.3;color:#6B707C;height:43px">${t.desc}</div>
          </button>`).join('')}
        </div>

        <!-- Example questions -->
        <div style="margin-top:18px;font-size:13px;color:#6B707C">Try asking</div>
        <div style="margin-top:8px;display:flex;flex-direction:column;gap:6px">
          ${EXAMPLES.map(q => `<button type="button" style="${BTN_RESET};width:100%;display:flex;align-items:center;gap:10px;padding:9px 14px;background:#fff;border:1px solid #EAE8E2;border-radius:12px;font-size:12.5px">
            <span style="color:#8FC4B3;display:flex">${ICON('<path d="M4 5h16v11H9l-5 4z"/>', 15)}</span>
            <span style="flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${q}</span>
            <span style="color:#8A8F9B;display:flex">${ICON('<path d="M5 12h14M13 6l6 6-6 6"/>', 14)}</span>
          </button>`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;

export default function Screen13Ask() {
  return (
    <ScaleWrapper designWidth={848} designHeight={664}>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </ScaleWrapper>
  );
}
