'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';

interface Props {
  /** Generated frame fragment: a <style> block plus one 848×532 frame <div>. */
  html: string;
  /** Accessible description of what the animation shows. */
  label: string;
  /** Negative animation-delay held under prefers-reduced-motion, e.g. "-6s". */
  hold: string;
}

/**
 * Renders a generated 848×532 animated frame scaled to the container width.
 * The box is reserved with aspect-ratio and scaled with container units, so nothing
 * shifts before hydration. Animations play from the first frame each time the frame scrolls into view, pause while it is off screen, and hold
 * on a representative frame under prefers-reduced-motion (see .fs-anim in globals.css).
 */
export default function AnimatedFrame({ html, label, hold }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Starts paused on its first frame, so the animation begins only once the card is scrolled into view.
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      // Restart from the first frame each time the card comes into view.
      if (entry.isIntersecting) el.getAnimations({ subtree: true }).forEach((a) => { a.currentTime = 0; });
      setInView(entry.isIntersecting);
    }, { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={`fs-anim${inView ? '' : ' is-paused'}`}
      style={{ '--fs-hold': hold } as CSSProperties}
    >
      <div className="fs-anim-inner" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
