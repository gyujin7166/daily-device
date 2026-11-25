import { useCallback, useEffect, useState } from 'react';

import useEmblaCarousel from 'embla-carousel-react';

export const useHomeCategoryCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 'auto',
  });
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const syncState = useCallback(() => {
    if (!emblaApi) {
      return;
    }

    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

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
    prevBtnDisabled,
    nextBtnDisabled,
    canScroll: !prevBtnDisabled || !nextBtnDisabled,
    scrollPrev,
    scrollNext,
  };
};
