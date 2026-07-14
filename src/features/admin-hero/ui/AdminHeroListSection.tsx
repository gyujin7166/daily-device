import { useEffect, useState } from 'react';

import { IconCheck } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@shared/lib/utils/style';
import {
  ImageUrlList,
  PaginationControls,
  RowActions,
  TableHeader,
} from '@shared/ui/AdminControls';

import type { AdminHero } from '../model/types';

const ADMIN_HERO_LIST_PAGE_SIZE = 10;

const getLocalizedName = (
  item: { name_en: string; name_ko?: string | null },
  locale: string,
) => (locale === 'en' ? item.name_en : item.name_ko) || item.name_en;

type AdminHeroListSectionProps = {
  heroes: AdminHero[];
  selectedHeroId: number | null;
  isSaving: boolean;
  onEdit: (hero: AdminHero) => void;
  onDelete: (hero: AdminHero) => void;
};

export default function AdminHeroListSection({
  heroes,
  selectedHeroId,
  isSaving,
  onEdit,
  onDelete,
}: AdminHeroListSectionProps) {
  const locale = useLocale();
  const t = useTranslations('AdminHero');
  const [page, setPage] = useState(1);
  const totalPages = Math.max(
    1,
    Math.ceil(heroes.length / ADMIN_HERO_LIST_PAGE_SIZE),
  );
  const paginatedHeroes = heroes.slice(
    (page - 1) * ADMIN_HERO_LIST_PAGE_SIZE,
    page * ADMIN_HERO_LIST_PAGE_SIZE,
  );

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  useEffect(() => {
    const selectedIndex = heroes.findIndex(
      (hero) => hero.id === selectedHeroId,
    );

    if (selectedIndex >= 0) {
      setPage(Math.floor(selectedIndex / ADMIN_HERO_LIST_PAGE_SIZE) + 1);
    }
  }, [heroes, selectedHeroId]);

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
      <TableHeader title={t('list.title')} count={heroes.length} />
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: '8%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '22%' }} />
            <col style={{ width: '28%' }} />
            <col style={{ width: '14%' }} />
          </colgroup>
          <thead className="bg-canvas text-xs uppercase text-muted dark:bg-dark-bg dark:text-dark-muted">
            <tr>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">{t('list.type')}</th>
              <th className="px-3 py-3 text-center">
                {t('list.mainImage')}
              </th>
              <th className="px-3 py-3">{t('list.name')}</th>
              <th className="px-3 py-3">{t('list.image')}</th>
              <th className="px-3 py-3">{t('list.manage')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHeroes.map((hero) => (
              <tr
                key={hero.id}
                className={cn(
                  'border-t border-line dark:border-dark-border',
                  selectedHeroId === hero.id &&
                    'bg-primary-soft/80 dark:bg-primary/15',
                )}
              >
                <td className="px-3 py-3 align-middle font-semibold">
                  {hero.id}
                </td>
                <td className="px-3 py-3 align-middle">
                  {t(`types.${hero.heroType.name}`)}
                </td>
                <td className="px-3 py-3 text-center align-middle">
                  {hero.isDefault ? (
                    <IconCheck
                      size={18}
                      stroke={2.4}
                      className="inline-block text-primary dark:text-blue-300"
                      aria-label={t('list.mainImage')}
                    />
                  ) : (
                    '-'
                  )}
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex min-h-12 flex-col justify-center">
                    <p className="font-semibold leading-snug">
                      {getLocalizedName(hero, locale)}
                    </p>
                    <p className="mt-0.5 text-xs leading-snug text-muted dark:text-dark-muted">
                      {hero.targetCategory
                        ? `${getLocalizedName(hero.targetCategory, locale)} (${hero.targetCategory.slug})`
                        : hero.name_en}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <ImageUrlList
                    items={[{ id: hero.id, url: hero.image_url }]}
                  />
                </td>
                <td className="px-3 py-3 align-middle">
                  <RowActions
                    disabled={isSaving}
                    className="flex-col items-start"
                    onEdit={() => onEdit(hero)}
                    onDelete={() => onDelete(hero)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
