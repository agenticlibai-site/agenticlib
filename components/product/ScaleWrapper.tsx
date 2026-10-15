'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';

interface Props {
  designWidth: number;
  designHeight: number;
  children: ReactNode;
}

export default function ScaleWrapper({ designWidth, designHeight, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setScale(w / designWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [designWidth]);

  return (
    <div
      ref={wrapRef}
      style={{ width: '100%', overflow: 'hidden', height: designHeight * scale }}
    >
      <div
        style={{
          width: designWidth,
          height: designHeight,
          transformOrigin: 'top left',
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
