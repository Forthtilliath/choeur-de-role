'use client';

import dynamic from 'next/dynamic';
import type { Coords } from './types';

const GeoValidationPopup = dynamic(() => import('./GeoValidationPopup').then(m => m.GeoValidationPopup), {
  ssr: false,
  loading: () => null,
});

type Props = {
  coords: Coords;
  address: string;
  onConfirmAction: (coords: Coords) => void;
  onCloseAction: () => void;
};

export function GeoValidationPopupWrapper(props: Props) {
  return <GeoValidationPopup {...props} />;
}
