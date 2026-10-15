import Screen03ChooseLearnMore from '@/components/product/Screen03ChooseLearnMore';
import Screen04ChooseCompetitors from '@/components/product/Screen04ChooseCompetitors';

export const metadata = {
  title: 'Feature Selection – FeatureStream',
  description: 'Surface the most impactful features for your AI agent — ranked by customer evidence, competitor gaps and eval signals.',
};

export default function FeatureSelectionPage() {
  return (
    <div className="page-gap-fix" style={{ background: '#fff', padding: '64px 24px 96px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: '#8A8F9B', textTransform: 'uppercase' }}>Select</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, color: '#0F0B1E' }}>
            Feature Selection
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: '#5A5F6B', maxWidth: '52ch' }}>
            Surfaces the most impactful features for your AI agent — ranked by customer evidence, competitor gaps and eval signals. Approve or reject each one, then ship straight to Jira or your product catalogue.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen03ChooseLearnMore />
          </div>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen04ChooseCompetitors />
          </div>
        </div>

      </div>
    </div>
  );
}
