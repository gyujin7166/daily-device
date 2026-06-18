export type BaseImage = {
  id: string | number;
  image_url: string;
  image_width?: number | null;
  image_height?: number | null;
  [key: string]: string | number | undefined | null;
};

export type ImageWithBlur = BaseImage & {
  blurHash: string;
};
