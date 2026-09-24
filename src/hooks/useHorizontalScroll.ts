import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_STEP = 240;

// Suit la possibilité de défiler horizontalement un conteneur (ombres, boutons)
// et active le défilement aux flèches du clavier hors champs de saisie.
export function useHorizontalScroll<TInner extends HTMLElement>() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<TInner>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const inner = innerRef.current;
    if (!el) return;
    // ResizeObserver appelle updateScrollState dès l'observation initiale
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    if (inner) ro.observe(inner);
    return () => ro.disconnect();
  }, [updateScrollState]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') scrollByStep(-1);
      if (e.key === 'ArrowRight') scrollByStep(1);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [scrollByStep]);

  return { scrollRef, innerRef, canScrollLeft, canScrollRight, updateScrollState, scrollByStep };
}
