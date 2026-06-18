import { splitProductDetailSpecification } from '../../model/detail';

import type { ProductDetailSpecificationGroup } from '../../model/detail';

type ProductDetailSpecificationGroupsProps = {
  groups: ProductDetailSpecificationGroup[];
};

export default function ProductDetailSpecificationGroups({
  groups,
}: ProductDetailSpecificationGroupsProps) {
  return (
    <>
      {groups.map((group) => (
        <div key={group.id} className="pb-6 last:pb-0">
          {group.titleMiddle ? (
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.26em] text-primary dark:text-primary">
              {group.titleMiddle}
            </h4>
          ) : null}

          <div className="space-y-5">
            {group.items.map((item) => (
              <div key={item.id} className="min-w-0">
                {item.title_sub ? (
                  <h5 className="text-base font-semibold leading-[1.45] text-ink dark:text-surface">
                    {item.title_sub}
                  </h5>
                ) : null}

                {item.specifications.length > 0 ? (
                  <ul className="mt-1 space-y-1 text-sm leading-[1.7] text-muted dark:text-dark-muted">
                    {item.specifications.map((spec, idx) => {
                      const { label, value } =
                        splitProductDetailSpecification(spec);

                      return (
                        <li
                          key={`${item.id}-${idx}`}
                          className="wrap-break-word"
                        >
                          {label ? (
                            <strong className="font-semibold text-ink dark:text-surface">
                              {label}
                            </strong>
                          ) : null}
                          {label && value ? `: ${value}` : value}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}

                {item.note ? (
                  <p className="mt-2 text-sm leading-[1.65] text-muted dark:text-dark-muted">
                    {item.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
