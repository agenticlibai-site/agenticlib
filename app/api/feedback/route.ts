import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
  try {
    const { feedback } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "agenticlib.ai@gmail.com",
      subject: "New AgenticLib Feedback",
      text: feedback,
    });

    console.log("✅ Email sent:", feedback);

    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: "anonymous",
      event: "feedback_sent",
      properties: {
        feedback_length: feedback?.length ?? 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Email error:", error);

    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}