import { IconEye, IconEyeOff } from '@tabler/icons-react';

import {
  ImageUrlList,
  PaginationControls,
  TableHeader,
  inputClass,
} from '@pages/admin/ui/shared/AdminControls';

import { maskEmail, maskName } from '@shared/lib/utils/mask';
import { cn } from '@shared/lib/utils/style';

import type {
  AdminReview,
  AdminReviewListParams,
  AdminReviewPayload,
  AdminReviewStatus,
} from '../model/types';

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
  return (
    <section className="overflow-hidden rounded-md border border-line bg-surface dark:border-dark-border dark:bg-dark-panel">
      <TableHeader title="상품평 목록" count={reviewPage?.total ?? 0} />
      <div className="grid gap-3 border-b border-line p-4 dark:border-dark-border md:grid-cols-[1fr_160px]">
        <input
          className={inputClass}
          value={params.keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="상품명, 작성자, 제목, 내용"
        />
        <select
          className={inputClass}
          value={params.status}
          onChange={(event) =>
            onStatusChange(event.target.value as AdminReviewStatus)
          }
        >
          <option value="all">전체 상태</option>
          <option value="visible">공개</option>
          <option value="hidden">숨김</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-canvas text-xs uppercase text-muted dark:bg-dark-bg dark:text-dark-muted">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">상태</th>
              <th className="px-4 py-3">상품</th>
              <th className="px-4 py-3">평점</th>
              <th className="px-4 py-3">내용</th>
              <th className="px-4 py-3">이미지 URL</th>
              <th className="px-4 py-3">작성자</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody className={isFetching ? 'opacity-60' : undefined}>
            {reviews.map((review) => {
              const reviewColorName = review.orderItem.colorName?.trim();
              const reviewColorHex = review.orderItem.colorHex;
              const authorName = review.user.name?.trim();
              const authorEmail = review.user.email?.trim();
              const displayAuthorName =
                authorName && !canWriteAdmin ? maskName(authorName) : authorName;
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
                  <td className="px-4 py-3 font-semibold">{review.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-bold',
                        review.adminHiddenAt
                          ? 'bg-disabled-bg text-muted'
                          : 'bg-success-soft text-success',
                      )}
                    >
                      {review.adminHiddenAt ? '숨김' : '공개'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">
                      {review.product.name_ko || review.product.name_en}
                    </p>
                    <p className="text-xs text-muted dark:text-dark-muted">
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
                  <td className="px-4 py-3">{review.rating}</td>
                  <td className="max-w-md px-4 py-3">
                    <p className="font-semibold">{review.title || '-'}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted dark:text-dark-muted">
                      {review.content}
                    </p>
                  </td>
                  <td className="max-w-72 px-4 py-3">
                    <ImageUrlList
                      items={review.images.map((image) => ({
                        id: image.id,
                        url: image.image_url,
                      }))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p>{displayAuthorName || '-'}</p>
                    <p className="text-xs text-muted dark:text-dark-muted">
                      {displayAuthorEmail || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => onToggleHidden(review)}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold transition hover:border-primary hover:text-primary disabled:opacity-60 dark:border-dark-border"
                    >
                      {review.adminHiddenAt ? (
                        <IconEye size={16} />
                      ) : (
                        <IconEyeOff size={16} />
                      )}
                      {review.adminHiddenAt ? '복원' : '숨김'}
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
