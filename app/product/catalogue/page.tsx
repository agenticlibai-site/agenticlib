import Screen08KnowCustomerRequests from '@/components/product/Screen08KnowCustomerRequests';
import Screen09KnowFeatureStatus from '@/components/product/Screen09KnowFeatureStatus';
import Screen10KnowImpact from '@/components/product/Screen10KnowImpact';
import Screen11KnowDocuments from '@/components/product/Screen11KnowDocuments';

export const metadata = {
  title: 'Product Catalogue – FeatureStream',
  description: 'A sidebar of sections for everything stored about each product feature — from customer requests and impact data to docs and post-launch evals.',
};

export default function CataloguePage() {
  return (
    <div className="page-gap-fix" style={{ background: '#fff', padding: '64px 24px 96px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', color: '#8A8F9B', textTransform: 'uppercase' }}>Know</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(32px, 3.5vw, 52px)', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.08, color: '#0F0B1E' }}>
            Product Catalogue
          </h1>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: '#5A5F6B', maxWidth: '52ch' }}>
            A sidebar of sections for everything stored about each product feature — from customer requests and impact data to docs and post-launch evals.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen08KnowCustomerRequests />
          </div>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen09KnowFeatureStatus />
          </div>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen10KnowImpact />
          </div>
          <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.09)' }}>
            <Screen11KnowDocuments />
          </div>
        </div>

      </div>
    </div>
  );
}
