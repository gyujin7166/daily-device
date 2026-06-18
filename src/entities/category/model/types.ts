type CategoryChildItem = {
  id: number;
  name_en: string;
  name_ko: string;
  slug: string;
  displayOrder: number;
};

export type CategoryItems = {
  id: number;
  name_en: string;
  name_ko: string;
  slug: string;
  image_url: string | null;
  displayOrder: number;
  children: CategoryChildItem[];
};
