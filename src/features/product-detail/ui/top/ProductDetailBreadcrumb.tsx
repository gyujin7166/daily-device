import { IconChevronRight } from '@tabler/icons-react';

import { useProductDescription } from '@entities/product/queries/useProductDescription';

import { Link } from '@shared/lib/i18n/navigation';
import { getCategoryHref } from '@shared/lib/routes/productRoutes';

type ProductDetailBreadcrumbProps = {
  detail: string;
};

export default function ProductDetailBreadcrumb({
  detail,
}: ProductDetailBreadcrumbProps) {
  const { data: productDescription } = useProductDescription(detail);

  if (!productDescription?.product) {
    return null;
  }

  const category = productDescription.product.category;

  return (
    <div className="pb-4 sm:pb-5">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted dark:text-dark-muted">
        <li>
          <Link
            href="/"
            className="transition-colors hover:text-ink dark:hover:text-surface"
          >
            Home
          </Link>
        </li>
        <IconChevronRight
          size={14}
          className="text-disabled-text dark:text-dark-muted"
        />
        <li>
          <Link
            href={getCategoryHref(category.slug)}
            className="transition-colors hover:text-ink dark:hover:text-surface"
          >
            {category.name_en}
          </Link>
        </li>
        <IconChevronRight
          size={14}
          className="text-disabled-text dark:text-dark-muted"
        />
        <li className="font-semibold text-primary dark:text-primary">
          {productDescription.product.name_en}
        </li>
      </ol>
    </div>
  );
}
