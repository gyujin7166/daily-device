type ProductCardProps = {
  children: React.ReactNode;
};

export default function ProductCard({ children }: ProductCardProps) {
  return <div className="w-full">{children}</div>;
}
