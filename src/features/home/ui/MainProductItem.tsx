import type React from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { IconArrowRight } from '@tabler/icons-react';

import type { HomeSection } from '@entities/home/model/types';

import { NOT_IMPLEMENTED_MESSAGE } from '@shared/constants/feedback';
import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import {
  getCategoryHref,
  getProductHref,
} from '@shared/lib/routes/productRoutes';
import { toast } from '@shared/lib/toast';
import { cn } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import HomeSectionHeader from './HomeSectionHeader';

const MAIN_PRODUCT_ITEMS = [
  {
    imageSrc: '/images/main/brio-100-hpb-feature.jpg',
    image_url: '/images/main/brio-100-hpb-feature.jpg',
    imageAlt: 'BRIO 100 웹캠',
    label: 'Webcam',
    eyebrow: 'Webcam',
    title: '더 깨끗하게 더 밝게 더 좋게',
    description:
      'Brio 100으로 더 나은 사진, 오디오 및 통화를 경험하십시오. 화상 통화에서 최고의 모습을 보여줄 수 있는 간단하고 저렴한 웹캠입니다.',
    href: getCategoryHref('mice'),
    cta: 'BRIO 100 더 알아보기',
  },
  {
    imageSrc: '/images/main/pebble-2-collection-hpb-secondary-2.jpg',
    image_url: '/images/main/pebble-2-collection-hpb-secondary-2.jpg',
    imageAlt: 'Pebble 2 컬렉션',
    label: 'Color Collection',
    eyebrow: 'Color Collection',
    title: '나만의 컬러. 나만의 감성.',
    description:
      '새로운 5가지 컬러를 만나보세요. 휴대하기 좋은 슬림하고 컴팩트한 디자인으로 어디서든 나만의 감성을 표현할 수 있습니다.',
    href: getCategoryHref('keyboards'),
    cta: 'K380S 보기',
  },
  {
    imageSrc: '/images/main/lift-hpb-secondary.png',
    image_url: '/images/main/lift-hpb-secondary.png',
    imageAlt: 'Lift 인체공학 마우스',
    label: 'Ergonomic',
    eyebrow: 'Ergonomic',
    title: '이제 리프트로 업해보세요',
    description:
      '손목에 부담을 줄이는 각도와 부드러운 조작감으로 더 편안한 작업 환경을 만들어보세요.',
    href: getProductHref({ categorySlug: 'mice', productSlug: 'lift' }),
    cta: '리프트 알아보기',
  },
] as const;
type MainProductItemProps = {
  section?: HomeSection;
};

type MainProductCardItem = {
  imageSrc: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

export default function MainProductItem({ section }: MainProductItemProps) {
  const items: readonly MainProductCardItem[] =
    section?.items.map((item) => ({
      imageSrc: item.image_url,
      imageAlt: item.imageAlt ?? item.title,
      eyebrow: item.label ?? '',
      title: item.title,
      description: item.description ?? '',
      href: item.href ?? '#',
      cta: item.cta ?? '자세히 보기',
    })) ?? MAIN_PRODUCT_ITEMS;

  return (
    <PageWrapper as="section" className="pt-10 sm:pt-14 lg:pt-16">
      <HomeSectionHeader
        eyebrow={section?.eyebrow ?? 'Featured'}
        title={section?.title ?? '매일의 작업을 바꾸는 제품'}
        subtitle={
          section?.subtitle ??
          '작업, 통화, 이동까지 이어지는 사용 흐름에 맞춰 Ecommerce의 대표 제품을 골라보세요.'
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item, index) => (
          <MainProductCard
            key={item.title}
            item={item}
            priorityImage={index < 3}
          />
        ))}
      </div>
    </PageWrapper>
  );
}

function MainProductCard({
  item,
  priorityImage,
}: {
  item: MainProductCardItem;
  priorityImage: boolean;
}) {
  const hasImage = item.imageSrc.trim().length > 0;
  const imageSrc = hasImage ? item.imageSrc : IMAGE_FALLBACK_URL;
  const isUnavailableLink = !item.href || item.href === '#';
  const handleUnavailableLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    if (!isUnavailableLink) {
      return;
    }

    event.preventDefault();
    toast.info(NOT_IMPLEMENTED_MESSAGE);
  };

  return (
    <article className="group overflow-hidden rounded-[26px] border border-line bg-surface p-3 shadow-[0_24px_80px_-56px_rgba(17,24,39,0.82)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_34px_90px_-58px_rgba(17,24,39,0.95)] dark:border-dark-border dark:bg-dark-panel">
      <Link
        href={isUnavailableLink ? '#' : item.href}
        onClick={handleUnavailableLinkClick}
        aria-disabled={isUnavailableLink}
        draggable={false}
        className="block select-none"
      >
        <div className="relative aspect-4/3 overflow-hidden rounded-[22px] bg-line dark:bg-dark-bg-hover">
          <Image
            src={imageSrc}
            alt={hasImage ? item.imageAlt : '상품 이미지 준비 중'}
            fill
            priority={priorityImage}
            sizes="(max-width: 768px) 100vw, 33vw"
            className={cn(
              'transition duration-500 group-hover:scale-105',
              hasImage ? 'object-cover' : 'object-contain p-10 opacity-70',
            )}
            draggable={false}
          />
          <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-ink shadow-xs backdrop-blur-sm dark:bg-dark-bg/80 dark:text-surface">
            {item.eyebrow}
          </span>
        </div>

        <div className="p-4 sm:p-5">
          <h3 className="text-xl font-bold leading-tight tracking-normal">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted dark:text-dark-muted">
            {item.description}
          </p>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary transition group-hover:text-primary-hover">
            {item.cta}
            <IconArrowRight size={16} />
          </span>
        </div>
      </Link>
    </article>
  );
}
