"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { blogs, Blog } from "@/data/blogs";

// ─────────────────────────────────────────────────────────────────────────────
// Blog thumbnail illustrations — one per post
// Style: white card bg, bold dark title, purple→pink gradient illustration
// ─────────────────────────────────────────────────────────────────────────────

function ThumbTopAgents() {
  const bars: [string, string][] = [
    ["Coveo",     "#7C3AED"],
    ["Cognigy",   "#9130DF"],
    ["Amelia",    "#A525CA"],
    ["Darktrace", "#B82DAF"],
    ["Salesloft", "#CB3089"],
    ["Likely.AI", "#DB3468"],
    ["ONEai",     "#F43F5E"],
  ];
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",display:"block"}}>
      <defs>
        <radialGradient id="ta-glow" cx="78%" cy="50%" r="55%">
          <stop stopColor="#FCA5A5" stopOpacity="0.35"/>
          <stop offset="0.6" stopColor="#F9A8D4" stopOpacity="0.18"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="560" height="294" fill="white"/>
      <rect width="560" height="294" fill="url(#ta-glow)"/>
      <text x="28" y="52" fontSize="20" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">Top 10 AI Agents</text>
      <text x="28" y="73" fontSize="13" fill="#7C6EA8" fontFamily="system-ui,sans-serif">You Need to Know About in 2025</text>
      <line x1="28" y1="87" x2="195" y2="87" stroke="#EDE9FF" strokeWidth="1.5"/>
      {bars.map(([label, color], i) => (
        <g key={label}>
          <rect x={222} y={22+i*38} width={316} height={32} rx="9" fill={color}/>
          <rect x={222} y={22+i*38} width={36} height={32} rx="9" fill="rgba(255,255,255,0.18)"/>
          <text x={240} y={22+i*38+22} textAnchor="middle" fontSize="11" fontWeight="800" fill="white" fontFamily="system-ui,sans-serif">{i+1}</text>
          <text x={268} y={22+i*38+22} fontSize="12" fill="rgba(255,255,255,0.95)" fontFamily="system-ui,sans-serif">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function ThumbEverydayAssistants() {
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",display:"block"}}>
      <defs>
        <radialGradient id="ea-p1" cx="33%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#C4B5FD"/>
          <stop offset="45%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#4C1D95"/>
        </radialGradient>
        <radialGradient id="ea-p2" cx="33%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#F0ABFC"/>
          <stop offset="45%" stopColor="#A21CAF"/>
          <stop offset="100%" stopColor="#6B21A8"/>
        </radialGradient>
        <radialGradient id="ea-p3" cx="33%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#FBCFE8"/>
          <stop offset="45%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#9D174D"/>
        </radialGradient>
        <radialGradient id="ea-glow" cx="50%" cy="65%" r="58%">
          <stop stopColor="#F9A8D4" stopOpacity="0.28"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="560" height="294" fill="white"/>
      <rect width="560" height="294" fill="url(#ea-glow)"/>
      <text x="28" y="46" fontSize="16" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">How AI Agents Are Becoming</text>
      <text x="28" y="66" fontSize="16" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">Our Everyday Assistants</text>
      {/* dashed connectors */}
      <line x1="192" y1="174" x2="252" y2="168" stroke="#C084FC" strokeWidth="1.5" strokeDasharray="5 4"/>
      <line x1="318" y1="167" x2="372" y2="174" stroke="#E879F9" strokeWidth="1.5" strokeDasharray="5 4"/>
      {/* Person 1 — purple */}
      <ellipse cx="165" cy="218" rx="46" ry="37" fill="url(#ea-p1)" style={{filter:"drop-shadow(0 8px 16px rgba(108,76,241,0.25))"}}/>
      <circle cx="165" cy="168" r="32" fill="url(#ea-p1)" style={{filter:"drop-shadow(0 5px 12px rgba(108,76,241,0.22))"}}/>
      {/* Person 2 — purple-pink */}
      <ellipse cx="283" cy="213" rx="48" ry="39" fill="url(#ea-p2)" style={{filter:"drop-shadow(0 8px 16px rgba(162,28,175,0.25))"}}/>
      <circle cx="283" cy="160" r="34" fill="url(#ea-p2)" style={{filter:"drop-shadow(0 5px 12px rgba(162,28,175,0.22))"}}/>
      {/* Person 3 — pink */}
      <ellipse cx="400" cy="218" rx="46" ry="37" fill="url(#ea-p3)" style={{filter:"drop-shadow(0 8px 16px rgba(236,72,153,0.25))"}}/>
      <circle cx="400" cy="168" r="32" fill="url(#ea-p3)" style={{filter:"drop-shadow(0 5px 12px rgba(236,72,153,0.22))"}}/>
      {/* Speech bubble — left figure */}
      <rect x="22" y="96" width="128" height="54" rx="12" fill="white" stroke="#E9D5FF" strokeWidth="1.5" style={{filter:"drop-shadow(0 2px 10px rgba(108,76,241,0.1))"}}/>
      <polygon points="78,150 86,163 92,150" fill="white" stroke="#E9D5FF" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="38" y="113" width="96" height="7" rx="3.5" fill="#EDE9FF"/>
      <rect x="38" y="126" width="72" height="7" rx="3.5" fill="#EDE9FF"/>
      <circle cx="38" cy="146" r="6" fill="#F9A8D4"/>
      {/* Speech bubble — center figure */}
      <rect x="218" y="84" width="130" height="54" rx="12" fill="white" stroke="#F5D0FE" strokeWidth="1.5" style={{filter:"drop-shadow(0 2px 10px rgba(192,38,211,0.1))"}}/>
      <polygon points="272,138 280,151 288,138" fill="white" stroke="#F5D0FE" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="234" y="101" width="100" height="7" rx="3.5" fill="#F5D0FE"/>
      <rect x="234" y="114" width="80" height="7" rx="3.5" fill="#F5D0FE"/>
      <circle cx="320" cy="128" r="6" fill="#DDD6FE"/>
      {/* Speech bubble — right figure */}
      <rect x="410" y="90" width="128" height="54" rx="12" fill="white" stroke="#FBCFE8" strokeWidth="1.5" style={{filter:"drop-shadow(0 2px 10px rgba(236,72,153,0.1))"}}/>
      <polygon points="462,144 470,157 478,144" fill="white" stroke="#FBCFE8" strokeWidth="1.5" strokeLinejoin="round"/>
      <rect x="426" y="107" width="98" height="7" rx="3.5" fill="#FBCFE8"/>
      <rect x="426" y="120" width="76" height="7" rx="3.5" fill="#FBCFE8"/>
      <circle cx="506" cy="134" r="6" fill="#C084FC"/>
    </svg>
  );
}

function ThumbAgentsVsSoftware() {
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",display:"block"}}>
      <defs>
        <radialGradient id="avs-fig" cx="33%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#DDD6FE"/>
          <stop offset="40%" stopColor="#8B5CF6"/>
          <stop offset="75%" stopColor="#7C3AED"/>
          <stop offset="100%" stopColor="#4C1D95"/>
        </radialGradient>
        <radialGradient id="avs-glow" cx="28%" cy="70%" r="52%">
          <stop stopColor="#A78BFA" stopOpacity="0.22"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="560" height="294" fill="white"/>
      <rect width="560" height="294" fill="url(#avs-glow)"/>
      <text x="28" y="44" fontSize="15.5" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">AI Agents vs Traditional Software:</text>
      <text x="28" y="63" fontSize="15.5" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">What&apos;s Actually Different?</text>
      {/* AI Agent blob figure */}
      <ellipse cx="128" cy="220" rx="54" ry="44" fill="url(#avs-fig)" style={{filter:"drop-shadow(0 8px 18px rgba(108,76,241,0.28))"}}/>
      <circle cx="128" cy="160" r="40" fill="url(#avs-fig)" style={{filter:"drop-shadow(0 6px 14px rgba(108,76,241,0.25))"}}/>
      <text x="128" y="278" textAnchor="middle" fontSize="11" fontWeight="600" fill="#7C3AED" fontFamily="system-ui,sans-serif">AI Agent</text>
      {/* VS badge */}
      <circle cx="278" cy="185" r="30" fill="white" stroke="#EDE9FF" strokeWidth="2" style={{filter:"drop-shadow(0 4px 14px rgba(108,76,241,0.15))"}}/>
      <text x="278" y="192" textAnchor="middle" fontSize="15" fontWeight="800" fill="#7C3AED" fontFamily="system-ui,sans-serif">VS</text>
      {/* Software window */}
      <rect x="346" y="98" width="198" height="155" rx="14" fill="#170D2F" style={{filter:"drop-shadow(0 8px 22px rgba(23,13,47,0.35))"}}/>
      <circle cx="367" cy="119" r="5.5" fill="#F87171"/>
      <circle cx="382" cy="119" r="5.5" fill="#FBBF24"/>
      <circle cx="397" cy="119" r="5.5" fill="#34D399"/>
      <line x1="346" y1="132" x2="544" y2="132" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
      <rect x="362" y="145" width="120" height="6" rx="3" fill="rgba(255,255,255,0.15)"/>
      <rect x="362" y="157" width="96" height="6" rx="3" fill="rgba(167,139,250,0.45)"/>
      <rect x="362" y="169" width="140" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
      <rect x="362" y="181" width="76" height="6" rx="3" fill="rgba(249,168,212,0.45)"/>
      <rect x="362" y="193" width="110" height="6" rx="3" fill="rgba(255,255,255,0.12)"/>
      <rect x="362" y="205" width="90" height="6" rx="3" fill="rgba(167,139,250,0.3)"/>
      <rect x="362" y="217" width="130" height="6" rx="3" fill="rgba(255,255,255,0.1)"/>
      <text x="445" y="278" textAnchor="middle" fontSize="10.5" fontWeight="500" fill="#9585C8" fontFamily="system-ui,sans-serif">Traditional Software</text>
    </svg>
  );
}

function ThumbAppsWontBeSame() {
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",display:"block"}}>
      <defs>
        <linearGradient id="waw-wave" x1="0" y1="294" x2="560" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7C3AED"/>
          <stop offset="40%" stopColor="#C026D3"/>
          <stop offset="70%" stopColor="#EC4899"/>
          <stop offset="100%" stopColor="#FB7185" stopOpacity="0.75"/>
        </linearGradient>
        <radialGradient id="waw-glow" cx="55%" cy="50%" r="55%">
          <stop stopColor="#F9A8D4" stopOpacity="0.25"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="560" height="294" fill="white"/>
      <rect width="560" height="294" fill="url(#waw-glow)"/>
      {/* gradient wave ribbon */}
      <path d="M-10 222 C90 168 200 148 322 116 C402 94 462 70 582 50 L582 160 C462 180 402 204 322 226 C200 258 90 278 -10 332 Z"
        fill="url(#waw-wave)" opacity="0.72"/>
      {/* Floating app icon circles */}
      <circle cx="316" cy="110" r="22" fill="#7C3AED"/>
      <text x="316" y="118" textAnchor="middle" fontSize="16">💬</text>
      <circle cx="358" cy="74" r="17" fill="#A855F7"/>
      <text x="358" y="80" textAnchor="middle" fontSize="11" fill="white" fontWeight="700">✓</text>
      <circle cx="287" cy="76" r="15" fill="#EC4899"/>
      <text x="287" y="82" textAnchor="middle" fontSize="11" fill="white">★</text>
      <circle cx="382" cy="107" r="19" fill="#C026D3"/>
      <text x="382" y="114" textAnchor="middle" fontSize="13">👤</text>
      <circle cx="350" cy="144" r="14" fill="#DB2777" style={{opacity:0.8}}/>
      {/* Phone */}
      <rect x="398" y="50" width="130" height="222" rx="22" fill="white" stroke="#18103E" strokeWidth="3" style={{filter:"drop-shadow(0 8px 22px rgba(0,0,0,0.12))"}}/>
      <rect x="438" y="64" width="50" height="7" rx="3.5" fill="#D1D5DB"/>
      <rect x="410" y="84" width="106" height="170" rx="8" fill="#F8F7FF"/>
      <rect x="422" y="98" width="35" height="35" rx="10" fill="#EDE9FF"/>
      <rect x="465" y="98" width="35" height="35" rx="10" fill="#FDF2FF"/>
      <rect x="422" y="141" width="35" height="35" rx="10" fill="#FDF4FF"/>
      <rect x="465" y="141" width="35" height="35" rx="10" fill="#F0EEFF"/>
      <rect x="422" y="184" width="35" height="35" rx="10" fill="#F5F3FF"/>
      <rect x="465" y="184" width="35" height="35" rx="10" fill="#FEF3C7"/>
      <circle cx="463" cy="262" r="11" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
      {/* Title */}
      <text x="28" y="48" fontSize="18" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">You Won&apos;t Use Apps</text>
      <text x="28" y="70" fontSize="18" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">the Same Way Again</text>
    </svg>
  );
}

function ThumbSearchToDelegation() {
  return (
    <svg viewBox="0 0 560 294" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%",display:"block"}}>
      <defs>
        <radialGradient id="std-orb" cx="34%" cy="28%" r="72%">
          <stop offset="0%" stopColor="#EDE9FE"/>
          <stop offset="22%" stopColor="#A855F7"/>
          <stop offset="52%" stopColor="#7C3AED"/>
          <stop offset="76%" stopColor="#BE185D"/>
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.9"/>
        </radialGradient>
        <radialGradient id="std-bg" cx="50%" cy="62%" r="62%">
          <stop stopColor="#F9A8D4" stopOpacity="0.18"/>
          <stop offset="0.5" stopColor="#DDD6FE" stopOpacity="0.12"/>
          <stop offset="1" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <rect width="560" height="294" fill="white"/>
      <rect width="560" height="294" fill="url(#std-bg)"/>
      <text x="28" y="44" fontSize="16" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">The Internet Is Shifting</text>
      <text x="28" y="65" fontSize="16" fontWeight="800" fill="#18103E" fontFamily="system-ui,sans-serif">From <tspan fill="#7C3AED">Search</tspan> to <tspan fill="#EC4899">Delegation</tspan></text>
      {/* Search bar */}
      <rect x="28" y="108" width="148" height="48" rx="24" fill="white" stroke="#E5E7EB" strokeWidth="1.5" style={{filter:"drop-shadow(0 2px 10px rgba(0,0,0,0.07))"}}/>
      <circle cx="52" cy="132" r="10" fill="none" stroke="#9CA3AF" strokeWidth="2.5"/>
      <line x1="59" y1="140" x2="66" y2="147" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"/>
      <rect x="72" y="126" width="80" height="10" rx="5" fill="#F3F4F6"/>
      {/* Arrow 1 */}
      <path d="M178 132 L205 150" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M200 144 L207 151 L199 154" stroke="#C084FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Gradient orb */}
      <circle cx="278" cy="170" r="80" fill="url(#std-orb)" style={{filter:"drop-shadow(0 10px 24px rgba(124,58,237,0.3))"}}/>
      {/* Arrow 2 */}
      <path d="M358 155 L384 136" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M380 141 L386 135 L378 132" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Checklist card */}
      <rect x="394" y="82" width="154" height="164" rx="16" fill="white" stroke="#EDE9FF" strokeWidth="1.5" style={{filter:"drop-shadow(0 4px 16px rgba(108,76,241,0.1))"}}/>
      {[
        {y:118, done:true,  fill:"#7C3AED"},
        {y:146, done:true,  fill:"#A855F7"},
        {y:174, done:true,  fill:"#C026D3"},
        {y:202, done:false, fill:"#E9D5FF"},
      ].map(({y, done, fill}, i) => (
        <g key={i}>
          <circle cx="416" cy={y} r="10" fill={fill} fillOpacity={done ? 1 : 0.5}/>
          {done && <path d={`M410 ${y} L414 ${y+4} L422 ${y-4}`} stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>}
          <rect x="432" y={y-5} width={100} height="9" rx="4.5" fill={done ? "#EDE9FF" : "#F3F4F6"}/>
          <rect x="432" y={y+9} width={76} height="7" rx="3.5" fill={done ? "#F5F3FF" : "#F9FAFB"}/>
        </g>
      ))}
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
