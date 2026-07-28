'use client';

import dynamic from 'next/dynamic';
import type { MapCenter, MembreCarte } from './types';

const CarteClient = dynamic(() => import('@/components/features/carte/CarteClient').then(m => m.CarteClient), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

type Props = {
  membres: MembreCarte[];
  center: MapCenter;
};

export function CarteWrapper({ membres, center }: Props) {
  return <CarteClient membres={membres} center={center} />;
}
