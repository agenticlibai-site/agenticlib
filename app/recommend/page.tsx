"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FeedbackBox from "@/components/FeedbackBox";

export default function RecommendPage() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ AUTO FOCUS (THIS WAS THE FIX)
  useEffect(() => {
    const el = document.getElementById("input-box") as HTMLTextAreaElement;

    if (el) {
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  if (!mounted) return null;

const handleSubmit = async () => {
  console.log("🚀 HANDLE SUBMIT CALLED");

  if (!input.trim()) return;

  setLoading(true);

  const newMessages = [
    ...messages,
    { role: "user", content: input }
  ];

  setMessages(newMessages);
  setInput("");

  try {
    const res = await fetch("/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input,
        messages: newMessages
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "❌ Error: " + JSON.stringify(data) }
      ]);
      return;
    }

    setMessages([
      ...newMessages,
      { role: "assistant", content: data.output || "No output returned" }
    ]);

  } catch (err) {
    console.error("❌ FETCH ERROR:", err);

    setMessages([
      ...newMessages,
      { role: "assistant", content: "❌ Fetch failed" }
    ]);
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
          id="input-box"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your use case..."
          className="w-full h-32 p-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none mb-4"
        />

<button
  onClick={handleSubmit}
  disabled={!input.trim() || loading}
  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50"
>
          {loading ? "Thinking..." : "Get Recommendations"}
        </button>

      </div>

      {/* Output */}
{/* Output */}
{messages.length > 0 && (
  <div className="mt-10 w-full max-w-4xl px-2">

    <div className="bg-white p-6 rounded-2xl shadow border overflow-hidden">

{messages.map((msg, index) => (
  <div
    key={index}
    className={`mb-6 flex ${
      msg.role === "user" ? "justify-end" : "justify-start"
    }`}
  >

    <div
className={`p-4 rounded-2xl shadow ${
  msg.role === "user"
    ? "bg-purple-100 text-black max-w-[80%]"
    : "bg-white border w-full"
}`}
    >

      <p className="text-sm font-semibold mb-2">
        {msg.role === "user" ? "You" : "AgenticLib"}
      </p>

      <div className="w-full overflow-x-auto">
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
          {msg.content}
        </ReactMarkdown>
      </div>

    </div>

  </div>
))}

    </div>

    <div className="mt-6 bg-white p-6 rounded-xl shadow border">
      <FeedbackBox />
    </div>

  </div>
)}

    </div>
  );
}