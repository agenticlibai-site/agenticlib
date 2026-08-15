"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { blogs, Blog } from "@/data/blogs";

// ─────────────────────────────────────────────────────────────────────────────
// Custom thumbnail illustrations — one per post
// Light pastel backgrounds, rich editorial diagrams
// ─────────────────────────────────────────────────────────────────────────────

function ThumbTopAgents() {
  const agents = ["Coveo","Cognigy","Amelia","Darktrace","Rex","Joy","ONEai","curatle","Likely.AI","CrowdStrike"];
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="560" height="294" fill="url(#g1)"/>
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="560" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EDE9FF"/>
          <stop offset="1" stopColor="#F5F0FF"/>
        </linearGradient>
      </defs>
      {/* subtle dot grid */}
      {Array.from({length:8},(_,x)=>Array.from({length:5},(_,y)=>(
        <circle key={`${x}${y}`} cx={32+x*72} cy={30+y*60} r="1.5" fill="rgba(108,76,241,0.12)"/>
      )))}
      {/* big number */}
      <text x="36" y="108" fontSize="90" fontWeight="800" fill="rgba(108,76,241,0.09)" fontFamily="system-ui,sans-serif" letterSpacing="-4">10</text>
      {/* heading */}
      <text x="36" y="52" fontSize="13" fontWeight="700" fill="#6C4CF1" fontFamily="system-ui,sans-serif" letterSpacing="2">TOP 10</text>
      <text x="36" y="74" fontSize="18" fontWeight="800" fill="#2D1B69" fontFamily="system-ui,sans-serif" letterSpacing="-0.5">AI Agents of 2025</text>
      {/* agent pills — 2 columns of 5 */}
      {agents.map((name, i) => {
        const col = i < 5 ? 0 : 1;
        const row = i % 5;
        const x = col === 0 ? 30 : 300;
        const y = 120 + row * 34;
        return (
          <g key={name}>
            <rect x={x} y={y} width={col===0?240:210} height="26" rx="13" fill="white" fillOpacity="0.85" stroke="rgba(108,76,241,0.2)" strokeWidth="1"/>
            <circle cx={x+16} cy={y+13} r="8" fill={`rgba(108,76,241,${0.4+i*0.06})`}/>
            <text x={x+16} y={y+17} textAnchor="middle" fontSize="8" fontWeight="700" fill="white" fontFamily="system-ui,sans-serif">{i+1}</text>
            <text x={x+30} y={y+17} fontSize="10.5" fontWeight="500" fill="#2D1B69" fontFamily="system-ui,sans-serif">{name}</text>
          </g>
        );
      })}
      {/* AgenticLib watermark */}
      <text x="530" y="284" textAnchor="end" fontSize="9" fill="rgba(108,76,241,0.35)" fontFamily="system-ui,sans-serif" fontWeight="600">AgenticLib</text>
    </svg>
  );
}

function ThumbEverydayAssistants() {
  const tasks = [
    { angle: -90, label: "Schedule Meetings",  icon: "📅" },
    { angle: -18, label: "Write Emails",        icon: "✉️"  },
    { angle:  54, label: "Analyse Data",        icon: "📊"  },
    { angle: 126, label: "Manage Tasks",        icon: "✅"  },
    { angle: 198, label: "Research Topics",     icon: "🔍"  },
  ];
  const cx = 280, cy = 152, R = 108;
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="560" height="294" fill="url(#g2)"/>
      <defs>
        <linearGradient id="g2" x1="0" y1="0" x2="560" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDF2FF"/>
          <stop offset="1" stopColor="#F9EEFF"/>
        </linearGradient>
      </defs>
      {/* orbit ring */}
      <circle cx={cx} cy={cy} r={R} stroke="rgba(147,51,234,0.15)" strokeWidth="1.5" strokeDasharray="6 5"/>
      {/* connector lines */}
      {tasks.map(({angle}) => {
        const rad = (angle*Math.PI)/180;
        const nx = cx + R*Math.cos(rad), ny = cy + R*Math.sin(rad);
        return <line key={angle} x1={cx} y1={cy} x2={nx} y2={ny} stroke="rgba(147,51,234,0.18)" strokeWidth="1.2"/>;
      })}
      {/* task nodes */}
      {tasks.map(({angle, label, icon}) => {
        const rad = (angle*Math.PI)/180;
        const nx = cx + R*Math.cos(rad), ny = cy + R*Math.sin(rad);
        const isLeft = nx < cx - 10;
        return (
          <g key={label}>
            <circle cx={nx} cy={ny} r="28" fill="white" fillOpacity="0.9" stroke="rgba(147,51,234,0.25)" strokeWidth="1.2"/>
            <text x={nx} y={ny+5} textAnchor="middle" fontSize="16">{icon}</text>
            <text x={isLeft ? nx-36 : nx+36} y={ny+4} textAnchor={isLeft?"end":"start"} fontSize="10.5" fontWeight="600" fill="#5B21B6" fontFamily="system-ui,sans-serif">{label}</text>
          </g>
        );
      })}
      {/* centre */}
      <circle cx={cx} cy={cy} r="42" fill="white" stroke="rgba(147,51,234,0.3)" strokeWidth="1.8"/>
      <text x={cx} y={cy-6} textAnchor="middle" fontSize="18" fontWeight="800" fill="#7C3AED" fontFamily="system-ui,sans-serif">AI</text>
      <text x={cx} y={cy+12} textAnchor="middle" fontSize="10" fill="#9585C8" fontFamily="system-ui,sans-serif">Agent</text>
      {/* header */}
      <text x="36" y="32" fontSize="13" fontWeight="700" fill="#9333EA" fontFamily="system-ui,sans-serif" letterSpacing="1.5">EVERYDAY WORK</text>
      <text x="530" y="284" textAnchor="end" fontSize="9" fill="rgba(147,51,234,0.35)" fontFamily="system-ui,sans-serif" fontWeight="600">AgenticLib</text>
    </svg>
  );
}

function ThumbAgentsVsSoftware() {
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="560" height="294" fill="url(#g3)"/>
      <defs>
        <linearGradient id="g3" x1="0" y1="0" x2="560" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EFF4FF"/>
          <stop offset="1" stopColor="#EDE9FF"/>
        </linearGradient>
      </defs>

      {/* LEFT panel */}
      <rect x="20" y="20" width="238" height="254" rx="16" fill="white" fillOpacity="0.7" stroke="rgba(108,76,241,0.15)" strokeWidth="1"/>
      <text x="139" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill="#9585C8" fontFamily="system-ui,sans-serif" letterSpacing="2">TRADITIONAL</text>
      {/* flow boxes */}
      {[["📥 Input",60],["⚙️ Rule Check",100],["✅ Execute",140],["📤 Output",180]].map(([label,y])=>(
        <g key={String(y)}>
          <rect x="44" y={Number(y)} width="170" height="30" rx="8" fill="rgba(108,76,241,0.07)" stroke="rgba(108,76,241,0.18)" strokeWidth="1"/>
          <text x="129" y={Number(y)+20} textAnchor="middle" fontSize="11" fill="#4B3A8A" fontFamily="system-ui,sans-serif">{label as string}</text>
        </g>
      ))}
      {[60,100,140].map(y=>(
        <path key={y} d={`M129 ${y+30} L129 ${y+36}`} stroke="rgba(108,76,241,0.3)" strokeWidth="1.5" strokeLinecap="round" markerEnd="url(#arr)"/>
      ))}
      <text x="139" y="232" textAnchor="middle" fontSize="10" fill="#9585C8" fontFamily="system-ui,sans-serif" fontStyle="italic">Rigid. Predictable.</text>

      {/* RIGHT panel */}
      <rect x="302" y="20" width="238" height="254" rx="16" fill="white" fillOpacity="0.7" stroke="rgba(124,58,237,0.25)" strokeWidth="1.5"/>
      <text x="421" y="52" textAnchor="middle" fontSize="11" fontWeight="700" fill="#7C3AED" fontFamily="system-ui,sans-serif" letterSpacing="2">AI AGENT</text>
      {/* reasoning nodes */}
      {[["🎯 Goal",78],["🧠 Reason",118],["🔧 Use Tools",158],["💬 Adapt",198]].map(([label,y])=>(
        <g key={String(y)}>
          <rect x="326" y={Number(y)} width="190" height="30" rx="8" fill="rgba(124,58,237,0.08)" stroke="rgba(124,58,237,0.3)" strokeWidth="1.2"/>
          <text x="421" y={Number(y)+20} textAnchor="middle" fontSize="11" fontWeight="500" fill="#3B1E7A" fontFamily="system-ui,sans-serif">{label as string}</text>
        </g>
      ))}
      {/* curved connections */}
      {[78,118,158].map(y=>(
        <path key={y} d={`M421 ${y+30} Q440 ${y+37} 421 ${y+36}`} stroke="rgba(124,58,237,0.35)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      <text x="421" y="240" textAnchor="middle" fontSize="10" fill="#7C3AED" fontFamily="system-ui,sans-serif" fontStyle="italic">Adaptive. Intelligent.</text>

      {/* VS badge */}
      <circle cx="280" cy="147" r="22" fill="white" stroke="rgba(108,76,241,0.35)" strokeWidth="1.5"/>
      <text x="280" y="153" textAnchor="middle" fontSize="14" fontWeight="800" fill="#6C4CF1" fontFamily="system-ui,sans-serif">vs</text>

      <text x="530" y="284" textAnchor="end" fontSize="9" fill="rgba(108,76,241,0.35)" fontFamily="system-ui,sans-serif" fontWeight="600">AgenticLib</text>
    </svg>
  );
}

function ThumbAppsWontBeSame() {
  const appLabels = ["Search","Shop","Plan","Book","Compare"];
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="560" height="294" fill="url(#g4)"/>
      <defs>
        <linearGradient id="g4" x1="0" y1="0" x2="560" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF0F9"/>
          <stop offset="1" stopColor="#FDF2FF"/>
        </linearGradient>
      </defs>

      {/* BEFORE label */}
      <text x="40" y="36" fontSize="11" fontWeight="700" fill="#9585C8" fontFamily="system-ui,sans-serif" letterSpacing="2">BEFORE</text>
      {/* scattered app tiles */}
      {appLabels.map((label, i) => {
        const positions = [[28,52],[28,110],[28,168],[104,80],[104,140]];
        const [ax,ay] = positions[i];
        return (
          <g key={label} opacity={0.55 + i*0.07}>
            <rect x={ax} y={ay} width="64" height="54" rx="12" fill="white" stroke="rgba(219,39,119,0.2)" strokeWidth="1.2"/>
            <text x={ax+32} y={ay+22} textAnchor="middle" fontSize="18">
              {["🔍","🛍️","📅","🎫","⚖️"][i]}
            </text>
            <text x={ax+32} y={ay+40} textAnchor="middle" fontSize="8.5" fill="#9585C8" fontFamily="system-ui,sans-serif">{label}</text>
          </g>
        );
      })}

      {/* arrow */}
      <path d="M200 147 L310 147" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M302 140 L312 147 L302 154" stroke="#DB2777" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="255" y="138" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#DB2777" fontFamily="system-ui,sans-serif">delegate</text>

      {/* AFTER: AI Agent card */}
      <rect x="322" y="72" width="208" height="150" rx="18" fill="white" stroke="rgba(219,39,119,0.28)" strokeWidth="1.5"/>
      <text x="402" y="102" textAnchor="middle" fontSize="11" fontWeight="700" fill="#9585C8" fontFamily="system-ui,sans-serif" letterSpacing="2">AI AGENT</text>
      <circle cx="426" cy="143" r="30" fill="#FDF2FF" stroke="rgba(219,39,119,0.3)" strokeWidth="1.5"/>
      <text x="426" y="139" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7C3AED" fontFamily="system-ui,sans-serif">AI</text>
      <text x="426" y="155" textAnchor="middle" fontSize="9" fill="#DB2777" fontFamily="system-ui,sans-serif">handles it</text>
      <rect x="342" y="186" width="168" height="8" rx="4" fill="rgba(219,39,119,0.1)"/>
      <rect x="356" y="200" width="138" height="7" rx="3.5" fill="rgba(219,39,119,0.07)"/>

      {/* AFTER label */}
      <text x="426" y="238" textAnchor="middle" fontSize="11" fontWeight="700" fill="#DB2777" fontFamily="system-ui,sans-serif" letterSpacing="2">AFTER</text>

      <text x="530" y="284" textAnchor="end" fontSize="9" fill="rgba(219,39,119,0.35)" fontFamily="system-ui,sans-serif" fontWeight="600">AgenticLib</text>
    </svg>
  );
}

function ThumbSearchToDelegation() {
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width:"100%", height:"100%", display:"block" }}>
      <rect width="560" height="294" fill="url(#g5)"/>
      <defs>
        <linearGradient id="g5" x1="0" y1="0" x2="560" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EDEAFF"/>
          <stop offset="1" stopColor="#F0EEFF"/>
        </linearGradient>
      </defs>

      {/* top label */}
      <text x="280" y="30" textAnchor="middle" fontSize="13" fontWeight="700" fill="#6C4CF1" fontFamily="system-ui,sans-serif" letterSpacing="1">The Internet is Shifting</text>

      {/* FROM row */}
      <text x="36" y="62" fontSize="10" fontWeight="700" fill="#9585C8" fontFamily="system-ui,sans-serif" letterSpacing="2">FROM</text>
      {["Search","Compare","Decide","Act"].map((label,i)=>(
        <g key={label}>
          <rect x={36+i*122} y={70} width="104" height="34" rx="10" fill="rgba(255,255,255,0.7)" stroke="rgba(108,76,241,0.2)" strokeWidth="1"/>
          <text x={88+i*122} y={92} textAnchor="middle" fontSize="12" fill="#9585C8" fontFamily="system-ui,sans-serif">{label}</text>
          {i<3 && <path d={`M${140+i*122} 87 L${150+i*122} 87`} stroke="rgba(108,76,241,0.25)" strokeWidth="1.5" strokeLinecap="round"/>}
        </g>
      ))}
      {/* strikethrough */}
      <line x1="36" y1="87" x2="524" y2="87" stroke="rgba(224,64,160,0.4)" strokeWidth="1.5" strokeDasharray="8 5"/>

      {/* divider */}
      <line x1="40" y1="128" x2="520" y2="128" stroke="rgba(108,76,241,0.1)" strokeWidth="1"/>

      {/* TO row */}
      <text x="36" y="154" fontSize="10" fontWeight="700" fill="#6C4CF1" fontFamily="system-ui,sans-serif" letterSpacing="2">TO</text>
      {[
        { label:"Ask",      sub:"Your goal",     active:false },
        { label:"Delegate", sub:"AI handles it", active:true  },
        { label:"Review",   sub:"Check result",  active:false },
        { label:"Approve",  sub:"You decide",    active:false },
      ].map(({label,sub,active},i)=>(
        <g key={label}>
          <rect x={36+i*122} y={162} width="104" height="52" rx="12"
            fill={active ? "rgba(108,76,241,0.12)" : "rgba(255,255,255,0.75)"}
            stroke={active ? "#7C3AED" : "rgba(108,76,241,0.2)"}
            strokeWidth={active ? 1.8 : 1}/>
          <text x={88+i*122} y={185} textAnchor="middle" fontSize="12.5" fontWeight={active?"700":"500"} fill={active?"#6C4CF1":"#4B3A8A"} fontFamily="system-ui,sans-serif">{label}</text>
          <text x={88+i*122} y={202} textAnchor="middle" fontSize="9.5" fill={active?"#9333EA":"#9585C8"} fontFamily="system-ui,sans-serif">{sub}</text>
          {i<3 && <path d={`M${140+i*122} 188 L${150+i*122} 188`} stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"/>}
        </g>
      ))}

      {/* agent pill */}
      <rect x="156" y="230" width="248" height="32" rx="16" fill="white" stroke="rgba(108,76,241,0.3)" strokeWidth="1.2"/>
      <circle cx="176" cy="246" r="11" fill="#6C4CF1"/>
      <text x="176" y="250" textAnchor="middle" fontSize="8" fontWeight="800" fill="white" fontFamily="system-ui,sans-serif">AI</text>
      <text x="290" y="251" textAnchor="middle" fontSize="11" fill="#6C4CF1" fontFamily="system-ui,sans-serif" fontWeight="500">Agent handles the heavy lifting</text>

      <text x="530" y="284" textAnchor="end" fontSize="9" fill="rgba(108,76,241,0.35)" fontFamily="system-ui,sans-serif" fontWeight="600">AgenticLib</text>
    </svg>
  );
}

const THUMBNAILS: Record<string, React.ReactNode> = {
  "top-ai-agents-2025":            <ThumbTopAgents />,
  "ai-agents-everyday-assistants": <ThumbEverydayAssistants />,
  "ai-agents-vs-software":         <ThumbAgentsVsSoftware />,
  "ai-agents-everyday-life":       <ThumbAppsWontBeSame />,
  "search-to-delegation":          <ThumbSearchToDelegation />,
};

function Thumbnail({ slug }: { slug: string }) {
  return (
    <div style={{ width:"100%", aspectRatio:"16/9", overflow:"hidden", background:"#F5F0FF" }}>
      {THUMBNAILS[slug] ?? <div style={{ width:"100%", height:"100%", background:"#EDE9FF" }}/>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const ALL_CATEGORIES = ["All", ...Array.from(new Set(blogs.map(b => b.category)))];

export default function BlogPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const navigate = (slug: string, title: string) => {
    trackEvent("blog_post_clicked", { blog_slug: slug, blog_title: title });
    router.push(`/blog/${slug}`);
  };

  const sorted   = [...blogs].reverse();
  const featured = sorted[0];
  const rest     = sorted.slice(1);
  const showingAll = activeCategory === "All" && !search;

  const filtered = sorted.filter(b => {
    const matchCat    = activeCategory === "All" || b.category === activeCategory;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen page-gap-fix" style={{ background:"#FAFAFA" }}>
      <div style={{ maxWidth:1040, margin:"0 auto", padding:"48px 24px 80px" }}>

        {/* ── Featured ─────────────────────────────────────────────── */}
        {showingAll && (
          <div
            onClick={() => navigate(featured.slug, featured.title)}
            className="featured-card"
            style={{
              display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)",
              borderRadius:16, overflow:"hidden", background:"white",
              border:"1px solid #E8E4F4", boxShadow:"0 2px 20px rgba(80,40,180,0.07)",
              cursor:"pointer", marginBottom:40,
            }}
          >
            <Thumbnail slug={featured.slug}/>
            <div style={{ padding:"36px 40px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <CategoryBadge label={featured.category}/>
              <h2 style={{ fontSize:"clamp(1.1rem,2.2vw,1.45rem)", fontWeight:700, color:"#0A0618", lineHeight:1.3, margin:"14px 0 12px", letterSpacing:"-0.02em" }}>
                {featured.title}
              </h2>
              <p style={{ fontSize:14, color:"#6B5E8A", lineHeight:1.65, margin:"0 0 22px" }}>
                {featured.description}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <AuthorAvatar/>
                <span style={{ fontSize:13, color:"#0A0618", fontWeight:500 }}>{featured.author}</span>
                <span style={{ fontSize:13, color:"#9585C8" }}>{featured.date}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters ──────────────────────────────────────────────── */}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:28, flexWrap:"wrap" }}>
          {ALL_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding:"6px 14px", borderRadius:999,
              border: activeCategory===cat ? "1px solid #7C3AED" : "1px solid #DDD8F0",
              background: activeCategory===cat ? "#7C3AED" : "white",
              color: activeCategory===cat ? "white" : "#5B4E8A",
              fontSize:13, fontWeight: activeCategory===cat ? 600 : 400,
              cursor:"pointer", transition:"all 0.15s",
            }}>{cat}</button>
          ))}
          <div style={{ marginLeft:"auto", position:"relative" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9585C8", pointerEvents:"none" }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search blog posts" value={search} onChange={e=>setSearch(e.target.value)} style={{
              paddingLeft:32, paddingRight:12, paddingTop:7, paddingBottom:7,
              fontSize:13, border:"1px solid #DDD8F0", borderRadius:999,
              background:"white", color:"#0A0618", outline:"none", width:190,
            }}/>
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────── */}
        {filtered.length === 0
          ? <p style={{ color:"#9585C8", fontSize:14 }}>No posts match your search.</p>
          : (
            <div className="blog-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
              {(showingAll ? rest : filtered).map(blog => (
                <BlogCard key={blog.slug} blog={blog} onNavigate={navigate}/>
              ))}
            </div>
          )
        }
      </div>

      <style>{`
        @media (max-width:860px) {
          .featured-card { grid-template-columns:1fr !important; }
          .blog-grid     { grid-template-columns:repeat(2,1fr) !important; }
        }
        @media (max-width:560px) {
          .blog-grid { grid-template-columns:1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ── BlogCard ──────────────────────────────────────────────────────────────────

function BlogCard({ blog, onNavigate }: { blog: Blog; onNavigate:(slug:string,title:string)=>void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onNavigate(blog.slug, blog.title)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:"white", border:"1px solid #E8E4F4", borderRadius:14,
        overflow:"hidden", cursor:"pointer",
        boxShadow: hovered ? "0 8px 28px rgba(80,40,180,0.12)" : "0 1px 6px rgba(80,40,180,0.05)",
        transform: hovered ? "translateY(-3px)" : "none",
        transition:"all 0.2s ease", display:"flex", flexDirection:"column",
      }}
    >
      <Thumbnail slug={blog.slug}/>
      <div style={{ padding:"18px 20px 20px", display:"flex", flexDirection:"column", flex:1 }}>
        <h3 style={{ fontSize:15, fontWeight:700, color:"#0A0618", lineHeight:1.4, margin:"0 0 10px", letterSpacing:"-0.01em", flex:1 }}>
          {blog.title}
        </h3>
        <p style={{ fontSize:13, color:"#6B5E8A", lineHeight:1.6, margin:"0 0 16px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
          {blog.description}
        </p>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:"auto" }}>
          <CategoryBadge label={blog.category} small/>
          <span style={{ fontSize:11.5, color:"#9585C8" }}>•</span>
          <span style={{ fontSize:11.5, color:"#9585C8" }}>{blog.date}</span>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function CategoryBadge({ label, small }: { label:string; small?:boolean }) {
  const colors: Record<string,{bg:string;color:string}> = {
    "AI Agents":  { bg:"#EDE9FF", color:"#6C4CF1" },
    "Industry":   { bg:"#FDF2FF", color:"#9333EA" },
    "Guide":      { bg:"#EFF6FF", color:"#2563EB" },
    "Comparison": { bg:"#FFF1F5", color:"#DB2777" },
  };
  const { bg, color } = colors[label] ?? { bg:"#F3F4F6", color:"#374151" };
  return (
    <span style={{ fontSize:small?11:11.5, fontWeight:600, padding:small?"2px 8px":"3px 10px", borderRadius:999, background:bg, color, display:"inline-block", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function AuthorAvatar() {
  return (
    <div style={{ width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg,#6C4CF1,#E040A0)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <span style={{ fontSize:10, fontWeight:700, color:"white" }}>A</span>
    </div>
  );
}
