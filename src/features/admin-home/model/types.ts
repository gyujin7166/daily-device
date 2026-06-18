export type AdminHomeCategory = {
  id: number;
  name_en: string;
  name_ko: string;
  slug: string;
};

export type AdminHomeProduct = {
  id: number;
  name_en: string;
  name_ko: string | null;
  slug: string;
  category: {
    slug: string;
  };
};

export type AdminHomeSectionItem = {
  id: number;
  sectionId: number;
  label: string | null;
  title: string;
  description: string | null;
  cta: string | null;
  href: string | null;
  targetCategoryId: number | null;
  targetCategory: AdminHomeCategory | null;
  targetProductId: number | null;
  targetProduct: AdminHomeProduct | null;
  image_url: string;
  imageAlt: string | null;
  displayOrder: number;
  isVisible: boolean;
  layoutGroup: number;
  layoutGroupClassName: string | null;
  layoutAreaClassName: string | null;
  labelPosition: string | null;
  imageClassName: string | null;
};

export type AdminHomeSection = {
  id: number;
  key: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  displayOrder: number;
  isVisible: boolean;
  items: AdminHomeSectionItem[];
};

export type AdminHomePayload = {
  sections: AdminHomeSection[];
  categories: AdminHomeCategory[];
  products: AdminHomeProduct[];
};

export type HomeSectionFormState = {
  id: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  displayOrder: string;
  isVisible: boolean;
};

export type HomeSectionItemTargetType =
  | 'category'
  | 'product'
  | 'custom'
  | 'none';

export type HomeSectionItemFormState = {
  id: number | null;
  sectionId: number;
  targetType: HomeSectionItemTargetType;
  label: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  targetCategoryId: string;
  targetProductId: string;
  image_url: string;
  imageAlt: string;
  displayOrder: string;
  isVisible: boolean;
  layoutGroup: string;
  layoutGroupClassName: string;
  layoutAreaClassName: string;
  labelPosition: string;
  imageClassName: string;
};

export const createHomeSectionForm = (
  section: AdminHomeSection,
): HomeSectionFormState => ({
  id: section.id,
  eyebrow: section.eyebrow ?? '',
  title: section.title,
  subtitle: section.subtitle ?? '',
  displayOrder: String(section.displayOrder),
  isVisible: section.isVisible,
});

const getItemTargetType = (
  item: AdminHomeSectionItem,
): HomeSectionItemTargetType => {
  if (item.targetProductId) {
    return 'product';
  }

  if (item.targetCategoryId) {
    return 'category';
  }

  if (item.href) {
    return 'custom';
  }

  return 'none';
};

export const createHomeSectionItemForm = (
  item: AdminHomeSectionItem,
): HomeSectionItemFormState => ({
  id: item.id,
  sectionId: item.sectionId,
  targetType: getItemTargetType(item),
  label: item.label ?? '',
  title: item.title,
  description: item.description ?? '',
  cta: item.cta ?? '',
  href: item.href ?? '',
  targetCategoryId: item.targetCategoryId ? String(item.targetCategoryId) : '',
  targetProductId: item.targetProductId ? String(item.targetProductId) : '',
  image_url: item.image_url,
  imageAlt: item.imageAlt ?? '',
  displayOrder: String(item.displayOrder),
  isVisible: item.isVisible,
  layoutGroup: String(item.layoutGroup),
  layoutGroupClassName: item.layoutGroupClassName ?? '',
  layoutAreaClassName: item.layoutAreaClassName ?? '',
  labelPosition: item.labelPosition ?? '',
  imageClassName: item.imageClassName ?? '',
});

export const createEmptyHomeSectionItemForm = (
  sectionId: number,
  displayOrder: number,
): HomeSectionItemFormState => ({
  id: null,
  sectionId,
  targetType: 'none',
  label: '',
  title: '',
  description: '',
  cta: '',
  href: '',
  targetCategoryId: '',
  targetProductId: '',
  image_url: '',
  imageAlt: '',
  displayOrder: String(displayOrder),
  isVisible: false,
  layoutGroup: '0',
  layoutGroupClassName: '',
  layoutAreaClassName: '',
  labelPosition: '',
  imageClassName: '',
});
