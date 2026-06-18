import Image from 'next/image';
import Link from 'next/link';

import type { CategoryItems } from '@entities/category/model/types';

import { getCategoryHref } from '@shared/lib/routes/productRoutes';
import { getCloudinaryImageUrl } from '@shared/lib/utils/cloudinaryImage';

type CategoryItemProps = {
  category: CategoryItems;
  onNavigate?: () => void;
};

export default function CategoryItem({
  category,
  onNavigate,
}: CategoryItemProps) {
  return (
    <div className="relative w-full break-inside-avoid px-2 md:w-1/2 md:px-3 lg:w-1/3">
      <figure className="mx-auto mb-4 hidden h-20 w-full select-none overflow-hidden rounded-xl bg-canvas p-4 lg:block dark:bg-dark-panel-deep">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          {category.image_url ? (
            <Image
              src={getCloudinaryImageUrl(
                category.image_url,
                'categoryThumbnail',
              )}
              alt={category.name_ko}
              fill
              sizes="(min-width: 1280px) 240px, (min-width: 1024px) 20vw, 0px"
              className="select-none object-contain"
              draggable={false}
            />
          ) : null}
        </div>
      </figure>
      <div>
        <p className="px-2 pb-3 text-lg font-bold leading-6 text-ink dark:text-surface">
          {category.name_ko}
        </p>

        <ul className="text-sm font-medium text-muted dark:text-dark-muted">
          {category.children.map((item) => (
            <li key={item.id} className="mb-2.5">
              <Link
                href={getCategoryHref(item.slug)}
                onClick={onNavigate}
                className="block rounded-xl px-2 py-1 transition-colors hover:bg-primary-soft hover:text-primary dark:hover:bg-blue-900/30 dark:hover:text-blue-300"
              >
                {item.name_ko}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
