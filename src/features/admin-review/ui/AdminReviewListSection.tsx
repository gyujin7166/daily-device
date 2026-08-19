import { IconEye, IconEyeOff } from '@tabler/icons-react';
import { useLocale, useTranslations } from 'next-intl';

import { maskEmail, maskName } from '@shared/lib/utils/mask';
import { cn } from '@shared/lib/utils/style';
import {
  DebouncedSearchInput,
  ImageUrlList,
  PaginationControls,
  TableHeader,
  inputClass,
} from '@shared/ui/AdminControls';

import type {
  AdminReview,
  AdminReviewListParams,
  AdminReviewPayload,
  AdminReviewStatus,
} from '../model/types';

const getLocalizedProductName = (review: AdminReview, locale: string) =>
  review.product.translations.find(
    (translation) => translation.locale === locale,
  )?.name ??
  (locale === 'en' ? review.product.name_en : review.product.name_ko) ??
  review.product.name_en;

const getLocalizedColorName = (review: AdminReview, locale: string) =>
  review.orderItem.colorTranslations.find(
    (translation) => translation.locale === locale,
  )?.name ?? review.orderItem.colorName?.trim();

type AdminReviewListSectionProps = {
  params: AdminReviewListParams;
  reviewPage?: AdminReviewPayload['reviews'];
  reviews: AdminReview[];
  isFetching: boolean;
  isSaving: boolean;
  canWriteAdmin: boolean;
  onKeywordChange: (keyword: string) => void;
  onStatusChange: (status: AdminReviewStatus) => void;
  onPageChange: (page: number) => void;
  onToggleHidden: (review: AdminReview) => void;
};

export default function AdminReviewListSection({
  params,
  reviewPage,
  reviews,
  isFetching,
  isSaving,
  canWriteAdmin,
  onKeywordChange,
  onStatusChange,
  onPageChange,
  onToggleHidden,
}: AdminReviewListSectionProps) {
  const locale = useLocale();
  const t = useTranslations('AdminReview.list');

  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
      <TableHeader title={t('title')} count={reviewPage?.total ?? 0} />
      <div className="grid gap-3 border-b border-line p-4 dark:border-dark-border md:grid-cols-[1fr_160px]">
        <DebouncedSearchInput
          className={inputClass}
          value={params.keyword}
          onChange={onKeywordChange}
          placeholder={t('searchPlaceholder')}
        />
        <select
          aria-label={t('status')}
          className={inputClass}
          value={params.status}
          onChange={(event) =>
            onStatusChange(event.target.value as AdminReviewStatus)
          }
        >
          <option value="all">{t('allStatus')}</option>
          <option value="visible">{t('visibleFilter')}</option>
          <option value="hidden">{t('hiddenFilter')}</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col style={{ width: '6%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '14%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '34%' }} />
            <col style={{ width: '13%' }} />
            <col style={{ width: '12%' }} />
            <col style={{ width: '9%' }} />
          </colgroup>
          <thead className="bg-canvas text-xs uppercase text-muted dark:bg-dark-bg dark:text-dark-muted">
            <tr>
              <th className="px-3 py-3">ID</th>
              <th className="px-3 py-3">{t('status')}</th>
              <th className="px-3 py-3">{t('product')}</th>
              <th className="px-2 py-3">{t('rating')}</th>
              <th className="px-3 py-3">{t('content')}</th>
              <th className="px-3 py-3">{t('imageUrl')}</th>
              <th className="px-3 py-3">{t('author')}</th>
              <th className="px-3 py-3">{t('manage')}</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : undefined}>
            {reviews.map((review) => {
              const reviewColorName = getLocalizedColorName(review, locale);
              const reviewColorHex = review.orderItem.colorHex;
              const authorName = review.user.name?.trim();
              const authorEmail = review.user.email?.trim();
              const displayAuthorName =
                authorName && !canWriteAdmin
                  ? maskName(authorName)
                  : authorName;
              const displayAuthorEmail =
                authorEmail && !canWriteAdmin
                  ? maskEmail(authorEmail)
                  : authorEmail;

              return (
                <tr
                  key={review.id}
                  className={cn(
                    'border-t border-line dark:border-dark-border',
                    review.adminHiddenAt ? 'opacity-55' : '',
                  )}
                >
                  <td className="px-3 py-3 font-semibold">{review.id}</td>
                  <td className="px-3 py-3">
                    <span
                      className={cn(
                        'inline-flex min-w-10 justify-center rounded-full px-2 py-1 text-xs font-bold',
                        review.adminHiddenAt
                          ? 'bg-disabled-bg text-muted'
                          : 'bg-success-soft text-success',
                      )}
                    >
                      {review.adminHiddenAt ? t('hidden') : t('visible')}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold">
                      {getLocalizedProductName(review, locale)}
                    </p>
                    <p className="text-xs text-muted dark:text-dark-mute">
                      {review.product.slug}
                    </p>
                    {reviewColorName ? (
                      <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-line px-2 py-1 text-xs font-semibold text-muted dark:border-dark-border dark:text-dark-muted">
                        {reviewColorHex ? (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border border-line dark:border-dark-border"
                            style={{ backgroundColor: reviewColorHex }}
                          />
                        ) : null}
                        <span className="truncate">{reviewColorName}</span>
                      </div>
                    ) : null}
                  </td>
                  <td className="px-2 py-3 text-center">{review.rating}</td>
                  <td className="px-3 py-3 align-top">
                    <p className="break-words font-semibold">
                      {review.title || '-'}
                    </p>
                    <p className="mt-1 whitespace-pre-line break-words text-xs leading-5 text-muted dark:text-dark-muted">
                      {review.content}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <ImageUrlList
                      items={review.images.map((image) => ({
                        id: image.id,
                        url: image.image_url,
                      }))}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <p>{displayAuthorName || '-'}</p>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      {displayAuthorEmail || '-'}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => onToggleHidden(review)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs font-semibold transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-dark-border"
                    >
                      {review.adminHiddenAt ? (
                        <IconEye size={16} />
                      ) : (
                        <IconEyeOff size={16} />
                      )}
                      {review.adminHiddenAt ? t('restore') : t('hidden')}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls
        page={reviewPage?.page ?? 1}
        totalPages={reviewPage?.totalPages ?? 1}
        onPageChange={onPageChange}
      />
    </section>
  );
}
