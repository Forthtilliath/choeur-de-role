'use client';

import Lightbox from 'yet-another-react-lightbox';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/styles.css';

type Slide = { src: string; alt: string; description?: string };

type Props = {
  open: boolean;
  index: number;
  slides: Slide[];
  onCloseAction: () => void;
};

export function GalerieLightbox({ open, index, slides, onCloseAction }: Props) {
  return (
    <Lightbox
      open={open}
      close={onCloseAction}
      index={index}
      plugins={[Captions]}
      slides={slides}
    />
  );
}
