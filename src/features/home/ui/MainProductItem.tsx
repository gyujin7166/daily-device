import type React from 'react';

import Image from 'next/image';

import { IconArrowRight } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';


import type { HomeSection } from '@entities/home/model/types';

import { IMAGE_FALLBACK_URL } from '@shared/constants/images';
import { Link } from '@shared/lib/i18n/navigation';
import { toast } from '@shared/lib/toast';
import { cn } from '@shared/lib/utils/style';
import PageWrapper from '@shared/ui/Wrapper/PageWrapper';

import HomeSectionHeader from './HomeSectionHeader';

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
  const t = useTranslations('Home.featured');
  const items: readonly MainProductCardItem[] =
    section?.items
      .slice()
      .sort((left, right) => left.displayOrder - right.displayOrder)
      .map((item) => ({
        imageSrc: item.image_url,
        imageAlt: item.imageAlt ?? item.title,
        eyebrow: item.label ?? '',
        title: item.title,
        description: item.description ?? '',
        href: item.href ?? '#',
        cta: item.cta ?? t('defaultCta'),
      })) ?? [];

  if (!section || items.length === 0) {
    return null;
  }

  return (
    <PageWrapper as="section" className="pt-10 sm:pt-14 lg:pt-16">
      <HomeSectionHeader
        eyebrow={section?.eyebrow ?? t('eyebrow')}
        title={section?.title ?? t('title')}
        subtitle={section?.subtitle ?? t('subtitle')}
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
  const t = useTranslations('Common.feedback');
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
    toast.info(t('notImplemented'));
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
            alt={item.imageAlt}
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
