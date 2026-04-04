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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center justify-center px-6">
      
      <h1 className="text-4xl font-semibold mb-8 text-center">
        Find the best AI agent
      </h1>

      <div className="relative z-10 w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg border">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your use case..."
          className="w-full h-32 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          className="relative z-50 w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          {loading ? "Thinking..." : "Get Recommendations"}
        </button>
      </div>

      {output && (
        <div className="mt-10 w-full max-w-4xl">
          <div className="bg-white p-6 rounded-2xl shadow border">
            <div className="prose max-w-none [&_table]:border [&_th]:border [&_td]:border [&_th]:bg-gray-100 [&_th]:p-2 [&_td]:p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {output}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}