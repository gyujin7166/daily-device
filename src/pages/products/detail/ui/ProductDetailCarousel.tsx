import { useEffect, useState } from 'react';

import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ProductItem } from '@features/product/ui';

import { cn } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

type ProductDetailCarouselItem = {
  id: number;
  image_url: string;
  alt: string;
  productLine?: string;
  name?: string;
  description?: string;
  price?: number;
  priceLabel?: string;
  href?: string;
  productColor?: {
    id: number;
    color: {
      name: string;
      hex: string;
    };
  }[];
  category?: {
    name_en: string;
  };
};

type ProductDetailCarouselProps = {
  items: ProductDetailCarouselItem[];
  eyebrow?: string;
  title?: string;
};

export default function ProductDetailCarousel({
  items,
  eyebrow,
  title,
}: ProductDetailCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 'auto',
    loop: false,
    dragFree: false,
  });

  const hasControls = scrollSnaps.length > 1;
  const sectionEyebrow = eyebrow ?? 'RECOMMENDED';
  const sectionTitle = title ?? '추천 상품';

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (index: number) => emblaApi?.scrollTo(index);

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    const syncState = () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    syncState();
    emblaApi.on('reInit', syncState);
    emblaApi.on('select', syncState);
  }, [emblaApi]);

  return (
    <PageWrapper as="section" padding="wide" className="pb-16">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold tracking-[0.24em] text-primary dark:text-blue-300">
            {sectionEyebrow}
          </p>
          <h2 className="text-4xl font-semibold leading-[1.2] tracking-[-0.01em] text-ink dark:text-surface">
            {sectionTitle}
          </h2>
        </div>

        {hasControls ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:border-line/70 disabled:bg-canvas disabled:text-disabled-text dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:hover:bg-dark-bg-hover dark:disabled:border-dark-border/70 dark:disabled:bg-dark-elevated"
              aria-label="이전 상품"
            >
              <IconChevronLeft size={20} stroke={1.8} />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:bg-canvas disabled:cursor-not-allowed disabled:border-line/70 disabled:bg-canvas disabled:text-disabled-text dark:border-dark-border dark:bg-dark-bg dark:text-surface dark:hover:bg-dark-bg-hover dark:disabled:border-dark-border/70 dark:disabled:bg-dark-elevated"
              aria-label="다음 상품"
            >
              <IconChevronRight size={20} stroke={1.8} />
            </button>
          </div>
        ) : null}
      </header>

      <div className="-m-3 overflow-hidden p-3" ref={emblaRef}>
        <div className="flex gap-3.5 sm:gap-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex-[0_0_calc((100%-14px)/2)] sm:flex-[0_0_calc((100%-32px)/3)] lg:flex-[0_0_calc((100%-48px)/4)] xl:flex-[0_0_calc((100%-64px)/5)]"
            >
              <ProductItem
                product={{
                  id: item.id,
                  productLine: item.productLine,
                  name_en: item.name ?? item.alt,
                  description: item.description ?? '',
                  price: item.price,
                  priceLabel: item.priceLabel,
                  href: item.href,
                  category: item.category,
                  productColor: item.productColor ?? [],
                  ProductImage: [{ image_url: item.image_url }],
                }}
                variant="catalog"
                priorityImage={index < 5}
              />
            </div>
          ))}
        </div>
      </div>

      {hasControls ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollTo(index)}
              aria-label={`${index + 1}번 페이지로 이동`}
              aria-current={index === selectedIndex}
              className={cn(
                'rounded-full transition-all duration-200',
                index === selectedIndex
                  ? 'h-2 w-5 bg-dark-bg'
                  : 'h-1.5 w-1.5 bg-line dark:bg-dark-bg-hover',
              )}
            />
          ))}
        </div>
      ) : null}
    </PageWrapper>
  );
}
