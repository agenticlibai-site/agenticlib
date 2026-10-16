import Link from "next/link";

/** Hero "Watch the demo video" link. Registration and the video live on /demo-video. */
export default function DemoVideoGate() {
  return (
    <>
      <style>{`
        .dv-link { display: inline-flex; align-items: center; gap: 8px; padding: 4px 2px; font-size: 15px; color: #000; text-decoration: none; }
        .dv-link span { text-decoration: underline; text-underline-offset: 3px; text-decoration-color: rgba(0,0,0,0.35); transition: text-decoration-color 0.15s; }
        .dv-link:hover span { text-decoration-color: #000; }
      `}</style>
      <Link href="/demo-video" className="dv-link">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="8.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8.3 6.9v6.2l4.9-3.1z" fill="currentColor" /></svg>
        <span>Want to see how it works first? Watch the demo video.</span>
      </Link>
    </>
  );
}
