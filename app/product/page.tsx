import Screen05PlanRoadmap from '@/components/product/Screen05PlanRoadmap';
import Screen06PlanTimeline from '@/components/product/Screen06PlanTimeline';
import Screen07KnowCatalogue from '@/components/product/Screen07KnowCatalogue';
import Screen08KnowCustomerRequests from '@/components/product/Screen08KnowCustomerRequests';
import Screen09KnowFeatureStatus from '@/components/product/Screen09KnowFeatureStatus';
import Screen10KnowImpact from '@/components/product/Screen10KnowImpact';
import Screen11KnowDocuments from '@/components/product/Screen11KnowDocuments';
export const metadata = {
  title: 'Product – FeatureStream',
  description: 'See FeatureStream in action.',
};

export default function ProductPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', background: '#fff', padding: '48px 0' }}>
<Screen05PlanRoadmap />
      <Screen06PlanTimeline />
      <Screen07KnowCatalogue />
      <Screen08KnowCustomerRequests />
      <Screen09KnowFeatureStatus />
      <Screen10KnowImpact />
      <Screen11KnowDocuments />
    </div>
  );
}
