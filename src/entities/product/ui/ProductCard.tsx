import { cn } from '@shared/lib/utils/style';

type ProductCardProps = {
  children: React.ReactNode;
  width?: 'w-full' | 'w-1/2' | 'w-1/3' | 'w-1/4';
};

export default function ProductCard({
  children,
  width = 'w-1/3',
}: ProductCardProps) {
  return <div className={cn(width)}>{children}</div>;
}
