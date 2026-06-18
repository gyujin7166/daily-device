import { useEffect, useState } from 'react';

export default function useScrollHeader() {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  useEffect(() => {
    let previousScrollY = window.scrollY;
    let frameId: number | null = null;

    setIsAtTop(previousScrollY <= 0);

    const updateHeaderState = () => {
      frameId = null;
      const currentScrollY = window.scrollY;
      const scrollChange = Math.abs(currentScrollY - previousScrollY);

      if (scrollChange < 1) {
        return;
      }

      const nextIsAtTop = currentScrollY <= 0;
      setIsAtTop((prev) => (prev === nextIsAtTop ? prev : nextIsAtTop));

      const nextHeaderVisible =
        currentScrollY < 100 ? true : currentScrollY < previousScrollY;
      setHeaderVisible((prev) =>
        prev === nextHeaderVisible ? prev : nextHeaderVisible,
      );

      previousScrollY = currentScrollY;
    };

    const handleScroll = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(updateHeaderState);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return {
    isAtTop,
    headerVisible,
  };
}
