import { useMemo } from 'react';
import type { RefObject } from 'react';

import {
  IconLifebuoy,
  IconListDetails,
  IconPackage,
  IconPlugConnected,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

import type { ProductDetailResponse } from '@entities/product/model/types';

import {
  getProductDetailLabelKey,
  getProductDetailSpecificationGroups,
} from '../../model/detail';

import ProductDetailAccordionItem from './ProductDetailAccordionItem';
import ProductDetailSpecificationGroups from './ProductDetailSpecificationGroups';
import ProductDetailSupportContent from './ProductDetailSupportContent';

import type { TablerIcon } from '@tabler/icons-react';

const SECTION_ICON_MAP: Partial<Record<string, TablerIcon>> = {
  '1': IconListDetails,
  '2': IconPlugConnected,
  '3': IconPackage,
  '4': IconLifebuoy,
};

type ProductDetailAccordionSectionProps = {
  sectionIds: number[];
  toggleState: Record<string, boolean>;
  onToggleDescription: (titleId: number) => void;
  productDetails: ProductDetailResponse['productDetails'];
  contentHeights: Record<string, number>;
  contentRefs: RefObject<Record<string, HTMLDivElement | null>>;
  onUpdateContentHeight: (
    sectionKey: string,
    node?: HTMLDivElement | null,
  ) => void;
};

export default function ProductDetailAccordionSection(
  props: ProductDetailAccordionSectionProps,
) {
  const {
    sectionIds,
    toggleState,
    onToggleDescription,
    productDetails,
    contentHeights,
    contentRefs,
    onUpdateContentHeight,
  } = props;
  const t = useTranslations('ProductDetail.accordion.sections');

  const transitionNodeRefs = useMemo(() => {
    const refs: Record<string, RefObject<HTMLDivElement | null>> = {};
    const keys = [...sectionIds.map((sectionId) => `${sectionId}`), '4'];
    keys.forEach((key) => {
      refs[key] = {
        current: null,
      };
    });

    return refs;
  }, [sectionIds]);

  const SupportSectionIcon = SECTION_ICON_MAP['4'];

  return (
    <div className="mt-10 border-t border-line dark:border-dark-border">
      {sectionIds.map((sectionId) => {
        const sectionKey = `${sectionId}`;
        const specificationGroups = getProductDetailSpecificationGroups(
          productDetails,
          sectionId,
        );

        return (
          <ProductDetailAccordionItem
            key={sectionId}
            sectionKey={sectionKey}
            titleId={sectionId}
            label={t(getProductDetailLabelKey(sectionKey))}
            Icon={SECTION_ICON_MAP[sectionKey]}
            isOpen={!!toggleState[sectionKey]}
            expandedHeight={contentHeights[sectionKey] ?? 0}
            transitionRef={transitionNodeRefs[sectionKey]}
            contentRefs={contentRefs}
            onToggle={onToggleDescription}
            onUpdateContentHeight={onUpdateContentHeight}
          >
            <ProductDetailSpecificationGroups groups={specificationGroups} />
          </ProductDetailAccordionItem>
        );
      })}

      <ProductDetailAccordionItem
        sectionKey="4"
        titleId={4}
        label={t(getProductDetailLabelKey('4'))}
        Icon={SupportSectionIcon}
        isOpen={!!toggleState['4']}
        expandedHeight={contentHeights['4'] ?? 0}
        transitionRef={transitionNodeRefs['4']}
        contentRefs={contentRefs}
        onToggle={onToggleDescription}
        onUpdateContentHeight={onUpdateContentHeight}
      >
        <ProductDetailSupportContent />
      </ProductDetailAccordionItem>
    </div>
  );
}
