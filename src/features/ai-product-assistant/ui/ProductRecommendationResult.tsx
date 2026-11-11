import { useLocale, useTranslations } from 'next-intl';

import { Link } from '@shared/lib/i18n/navigation';
import { getProductPriceInfo } from '@shared/lib/price/discount';
import { getProductHref } from '@shared/lib/routes/productRoutes';

import type { ProductAssistantResult } from '../model/productSearchCandidate';

export default function ProductRecommendationResult({
  intent,
  mapping,
  candidates,
  recommendation,
}: ProductAssistantResult) {
  const t = useTranslations('AiProductAssistant');
  const locale = useLocale();
  const { min, max, currency } = intent.priceRange;
  const showUnappliedBudget =
    currency !== 'KRW' && (min !== null || max !== null);
  const candidatesById = new Map(
    candidates.map((candidate) => [candidate.id, candidate]),
  );

  return (
    <div className="mt-5 rounded-xl bg-info-soft p-4 dark:bg-dark-panel-deep">
      <h3 className="text-sm font-semibold text-ink dark:text-surface">
        {t('recommendationTitle')}
      </h3>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-ink dark:text-surface">
        {recommendation?.answer ??
          t(mapping.category ? 'noCandidates' : 'clarifyProductType')}
      </p>
      {mapping.unmatchedHardRequirements.length > 0 ? (
        <p className="mt-2 text-sm text-muted dark:text-dark-muted">
          {t('unverifiedRequirements')}
        </p>
      ) : null}
      {showUnappliedBudget ? (
        <p className="mt-2 text-sm text-muted dark:text-dark-muted">
          {t('unappliedBudget')}
        </p>
      ) : null}
      {recommendation ? (
        <ol className="mt-4 grid gap-3">
          {recommendation.recommendations.map(({ productId, reason }) => {
            const product = candidatesById.get(productId);
            if (!product) return null;

            const price = getProductPriceInfo(
              product.originalPrice,
              product.discountRate,
              locale,
            );
            const href = getProductHref({
              categorySlug: product.categorySlug,
              productSlug: product.slug,
            });

            return (
              <li
                key={productId}
                className="rounded-xl border border-line bg-surface p-4 dark:border-dark-border dark:bg-dark-panel"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h4 className="text-sm font-semibold text-ink dark:text-surface">
                    {product.name}
                  </h4>
                  <div className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="font-semibold text-ink dark:text-surface">
                      {price.priceLabel}
                    </span>
                    {price.isDiscounted ? (
                      <s className="text-xs text-muted dark:text-dark-muted">
                        {price.originalPriceLabel}
                      </s>
                    ) : null}
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-muted dark:text-dark-muted">
                  {reason}
                </p>
                <Link
                  href={href}
                  prefetch={false}
                  className="mt-2 inline-block rounded-sm text-sm font-semibold text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-surface"
                >
                  {t('viewProduct')}
                  <span className="sr-only"> {product.name}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      ) : null}
    </div>
  );
}
