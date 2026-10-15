import Screen06PlanTimeline from '@/components/product/Screen06PlanTimeline';

export const metadata = {
  title: 'Roadmap – FeatureStream',
  description: 'Approved features drop straight into your roadmap — sorted into Now, Next and Later. Ship the whole column to Jira in one click.',
};

export default function RoadmapPage() {
  return (
    <div className="page-gap-fix" style={{ background: '#fff', padding: '64px 24px 96px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: '#8A8F9B', textTransform: 'uppercase' }}>Plan</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, color: '#0F0B1E' }}>
            Roadmap
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: '#5A5F6B', maxWidth: '52ch' }}>
            Approved features drop straight into your roadmap — sorted into Now, Next and Later. Drag to reprioritise, then ship the whole column to Jira in one click.
          </p>
        </div>

        <div style={{ maxWidth: 900 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen06PlanTimeline />
          </div>
        </div>

      </div>
    </div>
  );
}
