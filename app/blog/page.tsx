"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { blogs, Blog } from "@/data/blogs";


// Images come directly from each blog's `image` field (set in data/blogs.ts)
function Thumbnail({ src }: { src: string }) {
  return (
    <div style={{ width:"100%", aspectRatio:"16/9", overflow:"hidden", background:"#F0EEFF" }}>
      <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
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
            <Thumbnail src={featured.image}/>
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
      <Thumbnail src={blog.image}/>
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
