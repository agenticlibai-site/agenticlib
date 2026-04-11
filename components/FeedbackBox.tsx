"use client";

import { useState } from "react";
import posthog from "posthog-js";

export default function FeedbackBox() {
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      });

      if (res.ok) {
        posthog.capture("feedback_submitted", {
          feedback_length: feedback.trim().length,
        });
        setSubmitted(true);
        setFeedback("");
      } else {
       const errorData = await res.json();
alert("Error: " + JSON.stringify(errorData));
      }
    } catch (err) {
      console.error(err);
      posthog.captureException(err);
      alert("Error sending feedback");
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <p className="text-center text-green-600 font-medium">
        Thank you for your feedback 🙌
      </p>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">
        Please provide feedback on our recommendation
      </h3>

      <textarea
        placeholder="What were you actually looking for? What could we improve?"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        rows={4}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
      >
        {loading ? "Sending..." : "Submit Feedback"}
      </button>
    </div>
  );
}