import { useCallback, useEffect, useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

export const useHomeCategoryCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    containScroll: 'trimSnaps',
    dragFree: false,
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const syncState = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setScrollSnaps(emblaApi.scrollSnapList());
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    syncState();
    emblaApi.on('reInit', syncState);
    emblaApi.on('select', syncState);

    return () => {
      emblaApi.off('reInit', syncState);
      emblaApi.off('select', syncState);
    };
  }, [emblaApi, syncState]);

  return {
    emblaRef,
    selectedIndex,
    scrollSnaps,
    prevBtnDisabled,
    nextBtnDisabled,
    showPrevButton: selectedIndex > 0,
    showNextButton:
      scrollSnaps.length > 0 && selectedIndex < scrollSnaps.length - 1,
    scrollPrev,
    scrollNext,
    scrollTo,
  };
};
