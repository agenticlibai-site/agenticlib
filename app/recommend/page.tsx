"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function RecommendPage() {
  const [mounted, setMounted] = useState(false);

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚨 Prevent hydration mismatch
  if (!mounted) return null;

  const handleSubmit = async () => {
    console.log("🚀 BUTTON CLICKED");

    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      const data = await res.json();
      setOutput(data.output);
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
    }

    setLoading(false);
  };

  return (
  <div style={{ padding: "100px" }}>
    <button
      onClick={() => alert("CLICK WORKS")}
      style={{ padding: "20px", background: "red", color: "white" }}
    >
      TEST BUTTON
    </button>
  </div>
);