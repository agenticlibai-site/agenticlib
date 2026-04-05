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

  if (!mounted) return null;

  const handleSubmit = async () => {
    console.log("🚀 HANDLE SUBMIT CALLED");

    setLoading(true);

    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      console.log("📡 STATUS:", res.status);

      const data = await res.json();
      console.log("📦 DATA:", data);

      if (!res.ok) {
        setOutput("❌ Error: " + JSON.stringify(data));
        return;
      }

      setOutput(data.output || "No output returned");
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      setOutput("❌ Fetch failed");
    }

    setLoading(false);
  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center px-6">

      {/* Title */}
      <h1 className="text-4xl font-semibold mb-8 text-center">
        Find the best AI agent for your workflows
      </h1>

      {/* Input Card */}
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-lg border">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your use case..."
          className="w-full h-32 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none mb-4"
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition"
        >
          {loading ? "Thinking..." : "Get Recommendations"}
        </button>

      </div>

      {/* Output */}
      {output && (
        <div className="mt-10 w-full max-w-4xl px-2">
          <div className="bg-white p-6 rounded-2xl shadow border overflow-hidden">

            {/* 🔥 FIXED TABLE CONTAINER */}
            <div className="w-full overflow-x-auto max-w-full">

<ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    table: ({ children }) => (
      <table className="w-full min-w-[900px] border-collapse border text-sm">
        {children}
      </table>
    ),
    th: ({ children }) => (
      <th className="border bg-gray-100 p-2 whitespace-nowrap text-left">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border p-2 whitespace-nowrap">
        {children}
      </td>
    ),
  }}
>
  {output}
</ReactMarkdown>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}