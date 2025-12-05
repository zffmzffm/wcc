'use client';
import dynamic from 'next/dynamic';

const WorldCupMap = dynamic(() => import('@/components/WorldCupMap'), {
  ssr: false, // Leaflet 不支持 SSR
  loading: () => <p>Loading map...</p>
});

export default function Home() {
  return <WorldCupMap />;
}
