"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart } from "lucide-react";

interface LikeButtonProps {
  slug: string;
  initialLikes?: number;
}

export default function LikeButton({ slug, initialLikes = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [pending, setPending] = useState(false);

  // Hydrate count from server and restore session state
  useEffect(() => {
    const sessionKey = `liked:${slug}`;
    setLiked(sessionStorage.getItem(sessionKey) === "1");

    fetch("/api/blog/like")
      .then((r) => r.json())
      .then((data: Record<string, number>) => {
        if (typeof data[slug] === "number") setLikes(data[slug]);
      })
      .catch(() => {});
  }, [slug]);

  const toggle = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation(); // don't trigger card navigation
      if (pending) return;

      const next = !liked;
      const sessionKey = `liked:${slug}`;

      // Optimistic update
      setLiked(next);
      setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
      sessionStorage.setItem(sessionKey, next ? "1" : "0");

      setPending(true);
      try {
        const res = await fetch("/api/blog/like", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, action: next ? "like" : "unlike" }),
        });
        const data = await res.json();
        if (typeof data.likes === "number") setLikes(data.likes);
      } catch {
        // revert on failure
        setLiked(!next);
        setLikes((n) => (!next ? n + 1 : Math.max(0, n - 1)));
        sessionStorage.setItem(sessionKey, !next ? "1" : "0");
      } finally {
        setPending(false);
      }
    },
    [liked, pending, slug]
  );

  return (
    <button
      onClick={toggle}
      title="Like this"
      aria-pressed={liked}
      className="flex flex-col items-center gap-0.5 group/heart cursor-pointer select-none"
    >
      <Heart
        size={18}
        strokeWidth={1.8}
        className={`transition-all duration-200 group-hover/heart:scale-110 ${
          liked
            ? "fill-pink-500 stroke-pink-500"
            : "stroke-zinc-400 group-hover/heart:stroke-pink-400"
        }`}
      />
      <span
        className={`text-[10px] font-medium leading-none transition-colors duration-200 ${
          liked ? "text-pink-500" : "text-zinc-400 group-hover/heart:text-pink-400"
        }`}
      >
        {likes}
      </span>
    </button>
  );
}
