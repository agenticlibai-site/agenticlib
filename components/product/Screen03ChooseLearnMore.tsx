import ScaleWrapper from './ScaleWrapper';

const HTML = `<div style="position: relative; width: 692px; height: 692px; box-sizing:border-box; padding: 14px; border-radius: 36px; background: var(--frame-gradient); overflow: hidden; font-family: 'DM Sans', system-ui, sans-serif; color: #16181D">
  <div style="position:absolute;left:-60px;top:260px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,0.55);filter:blur(34px)"></div>
  <div style="position:absolute;right:-40px;top:40px;width:240px;height:240px;border-radius:50%;background:rgba(255,255,255,0.45);filter:blur(34px)"></div>
<div style="position:relative;width:664px;height:664px;box-sizing:border-box;padding:22px 26px 20px;display:flex;flex-direction:column;gap:11px;background:#F5F4F0;border-radius:20px;box-shadow:0 24px 60px rgba(60,30,10,0.22)">
  <div style="display:flex;align-items:center;gap:10px">
    <span style="padding:3px 10px;border-radius:999px;background:#D5ECE1;color:#14503F;font-size:11.5px;font-weight:700;white-space:nowrap">New feature</span>
    <span style="font-size:16px;font-weight:600;white-space:nowrap">Let the agent refund small orders on its own</span>
    <span style="margin-left:auto;padding:3px 10px;border-radius:999px;background:#D5ECE1;color:#14503F;font-size:13px;font-weight:700">91</span>
    <span style="font-size:20px;color:#8A8F9B;line-height:1">&#215;</span>
  </div>
  <div><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">REASONING</div><div style="margin-top:2px;font-size:13.5px;line-height:1.55;color:#16181D">Refund approvals are the slowest step in our customers' support flow. Every small refund waits for a person, so customers wait days and some leave. Six lost deals this quarter named refund speed as the reason, and four of the five competitors we track already let their agent approve small refunds under a set limit.</div></div>
  <div><div style="display:flex;align-items:baseline"><span style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">WHO ASKED</span><span style="margin-left:auto;font-size:10.5px;color:#5A5F6B">+ 5 more requests &middot; 6 lost deals</span></div>
    <div style="margin-top:4px;display:flex;gap:8px">
      <div style="flex:1;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:11.5px;font-weight:600;line-height:1.35">"Can the agent refund small orders itself? Waiting costs us customers."</div><div style="margin-top:3px;font-size:10px;color:#8A8F9B">Northwind customer &middot; 2d ago</div></div>
      <div style="flex:1;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:11.5px;font-weight:600;line-height:1.35">"We nearly cancelled because a $20 refund took three days."</div><div style="margin-top:3px;font-size:10px;color:#8A8F9B">Northwind customer &middot; 5d ago</div></div>
    </div></div>
  <div style="display:flex;gap:8px">
    <div style="flex:0.8;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">BUILD TIME</div><div style="margin-top:1px;font-size:18px;line-height:1.2;color:#16181D">3 weeks</div><div style="font-size:10.5px;color:#5A5F6B">one engineer</div></div>
    <div style="flex:1.2;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">RISK</div><div style="margin-top:1px;font-size:18px;line-height:1.2;color:#7A4A00">Medium</div><div style="font-size:10.5px;color:#5A5F6B">wrong refunds above the limit</div></div>
    <div style="flex:1.3;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">SUCCESS TARGET</div><div style="margin-top:1px;font-size:18px;line-height:1.2;color:#1F6F5C">Eval 90+</div><div style="font-size:10.5px;color:#5A5F6B">refund tests, 2 weeks after</div></div>
  </div>
  <div><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">IMPACT</div><div style="margin-top:4px;display:flex;gap:8px"><div style="flex:1;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">REVENUE</div><div style="margin-top:1px;font-size:24px;line-height:1.15;color:#1F6F5C">+$140K</div><div style="font-size:11px;color:#5A5F6B">a year kept from lost deals</div></div><div style="flex:1;background:#FFFFFF;border-radius:10px;padding:8px 12px;box-shadow:0 1px 6px rgba(22,24,29,0.06)"><div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">TIME TO REFUND</div><div style="margin-top:1px;font-size:24px;line-height:1.15;color:#1F6F5C">&#8722;2 days</div><div style="font-size:11px;color:#5A5F6B">to approve each refund, now minutes</div></div></div></div>
  <div style="background:#E9F4EF;border-radius:10px;padding:8px 12px">
    <div style="font-size:10px;font-weight:600;letter-spacing:0.08em;color:#8A8F9B">HOW CUSTOMER USAGE IMPROVES</div>
    <div style="margin-top:3px;display:flex;gap:12px"><div style="flex:1"><div style="font-size:10.5px;color:#5A5F6B;white-space:nowrap">Refunds finished in chat</div><div style="margin-top:1px;font-size:15px;font-weight:600"><span style="color:#8A8F9B;font-weight:500">22%</span> &#8594; <span style="color:#1F6F5C">80%</span></div></div><div style="flex:1"><div style="font-size:10.5px;color:#5A5F6B;white-space:nowrap">Chats solved without a person</div><div style="margin-top:1px;font-size:15px;font-weight:600"><span style="color:#8A8F9B;font-weight:500">58%</span> &#8594; <span style="color:#1F6F5C">71%</span></div></div><div style="flex:1"><div style="font-size:10.5px;color:#5A5F6B;white-space:nowrap">Customers who come back</div><div style="margin-top:1px;font-size:15px;font-weight:600"><span style="color:#8A8F9B;font-weight:500">41%</span> &#8594; <span style="color:#1F6F5C">52%</span></div></div></div>
  </div>
  <div style="margin-top:auto;display:flex;align-items:center;gap:8px"><span style="height:36px;box-sizing:border-box;padding:0 22px;border-radius:9px;background:#1F6F5C;color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">Approve</span>
    <span style="height:36px;box-sizing:border-box;padding:0 22px;border-radius:9px;border:1px solid #F3B8B5;background:#FDECEC;color:#C0392B;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600">Reject</span>
  </div>
</div>
 </div>`;

export default function Screen03ChooseLearnMore() {
  return (
    <ScaleWrapper designWidth={692} designHeight={692}>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </ScaleWrapper>
  );
}
