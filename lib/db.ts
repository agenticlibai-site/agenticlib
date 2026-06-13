import { sql } from "@vercel/postgres";
import type { AgentResult } from "./run-brand-intelligence";

let dbInitialised = false;

async function initDB() {
  if (dbInitialised) return;
  await sql`
    CREATE TABLE IF NOT EXISTS brand_snapshots (
      id SERIAL PRIMARY KEY,
      agent_name VARCHAR(100) NOT NULL,
      domain VARCHAR(50) NOT NULL,
      mentions INTEGER DEFAULT 0,
      avg_position FLOAT DEFAULT 0,
      visibility_score FLOAT DEFAULT 0,
      claude_visibility FLOAT DEFAULT 0,
      gpt_visibility FLOAT DEFAULT 0,
      recorded_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS
    brand_snapshots_unique
    ON brand_snapshots(agent_name, domain, recorded_date)
  `;
  dbInitialised = true;
}

export async function saveSnapshot(agents: AgentResult[], domain: string): Promise<void> {
  await initDB();
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  for (const agent of agents) {
    await sql`
      INSERT INTO brand_snapshots
        (agent_name, domain, mentions, avg_position, visibility_score, claude_visibility, gpt_visibility, recorded_date)
      VALUES
        (${agent.name}, ${domain}, ${agent.mentions}, ${agent.avgPosition}, ${agent.visibilityScore},
         ${agent.perLLM.claude}, ${agent.perLLM.gpt}, ${today})
      ON CONFLICT (agent_name, domain, recorded_date)
      DO UPDATE SET
        mentions          = EXCLUDED.mentions,
        avg_position      = EXCLUDED.avg_position,
        visibility_score  = EXCLUDED.visibility_score,
        claude_visibility = EXCLUDED.claude_visibility,
        gpt_visibility    = EXCLUDED.gpt_visibility
    `;
  }
}

export async function getHistory(
  domain: string,
  days: number,
): Promise<{ recorded_date: string; agent_name: string; visibility_score: number }[]> {
  await initDB();

  // Compute the cutoff date in JS to avoid SQL interval parameterisation issues
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const result = await sql`
    SELECT recorded_date::text AS recorded_date, agent_name, visibility_score
    FROM brand_snapshots
    WHERE domain      = ${domain}
      AND recorded_date >= ${cutoffStr}::date
    ORDER BY recorded_date ASC, agent_name ASC
  `;

  return result.rows as { recorded_date: string; agent_name: string; visibility_score: number }[];
}
