'use client';

import dynamic from 'next/dynamic';
import { AppProvider } from '@/contexts/AppContext';
import TopBar from '@/components/TopBar';
import RightPanel from '@/components/RightPanel';

const NoiseCanvas = dynamic(() => import('@/components/NoiseCanvas'), { ssr: false });

export default function Home() {
  return (
    <AppProvider>
      <TopBar />
      <div className="main">
        <NoiseCanvas />
        <RightPanel />
      </div>
    </AppProvider>
  );
}
