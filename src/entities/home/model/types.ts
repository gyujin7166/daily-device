type HomeSectionItem = {
  id: number;
  label: string | null;
  title: string;
  description: string | null;
  cta: string | null;
  href: string | null;
  image_url: string;
  imageAlt: string | null;
  displayOrder: number;
  layoutGroup: number;
  layoutGroupClassName: string | null;
  layoutAreaClassName: string | null;
  labelPosition: string | null;
  imageClassName: string | null;
};

export type HomeSection = {
  id: number;
  key: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  displayOrder: number;
  items: HomeSectionItem[];
};
