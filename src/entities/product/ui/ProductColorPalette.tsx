import { useEffect, useState } from 'react';

import { cn } from '@shared/lib/utils/style';
import type { CSSVariableStyle } from '@shared/lib/utils/style';

type ProductPaletteColorItem = {
  id?: number;
  isDefault?: boolean;
  color: {
    id?: number;
    name: string;
    hex: string;
  };
};

const getColorId = (item: ProductPaletteColorItem, index: number) =>
  item.id ?? item.color.id ?? index;

type ProductColorPaletteProps = {
  colors?: ProductPaletteColorItem[];
  size?: 'sm' | 'md';
  showLabel?: boolean;
  interactive?: boolean;
  singleRow?: boolean;
  inline?: boolean;
  selectedColorId?: number | null;
  onColorChange?: (color: { id: number; name: string; hex: string }) => void;
};

export default function ProductColorPalette({
  colors = [],
  size = 'md',
  showLabel = true,
  interactive = true,
  singleRow = false,
  inline = false,
  selectedColorId: controlledSelectedColorId,
  onColorChange,
}: ProductColorPaletteProps) {
  const [selectedColor, setSelectedColor] = useState('');
  const [uncontrolledSelectedColorId, setUncontrolledSelectedColorId] =
    useState<number | null>(null);
  const isControlled = typeof controlledSelectedColorId !== 'undefined';
  const selectedColorId = isControlled
    ? controlledSelectedColorId
    : uncontrolledSelectedColorId;

  const sizeClasses =
    size === 'sm'
      ? {
          button: 'w-5 h-5 sm:w-6 sm:h-6',
          dot: 'w-4 h-4 sm:w-5 sm:h-5',
          margin: 'm-1.25 sm:m-1.5',
          wrap: 'ml-[-5px] sm:ml-[-6px]',
          label: 'text-xs',
        }
      : {
          button: 'w-9.5 h-9.5',
          dot: 'w-8 h-8',
          margin: 'm-1.75',
          wrap: 'ml-[-7px]',
          label: 'text-xs',
        };

  useEffect(() => {
    if (colors.length && selectedColorId === null) {
      const defaultColorIndex = Math.max(
        0,
        colors.findIndex((item) => item.isDefault),
      );
      const defaultColor = colors[defaultColorIndex];
      const firstColorId = getColorId(defaultColor, defaultColorIndex);
      setSelectedColor(defaultColor.color.name);
      setUncontrolledSelectedColorId(firstColorId);
      onColorChange?.({
        id: firstColorId,
        name: defaultColor.color.name,
        hex: defaultColor.color.hex,
      });
    }
  }, [colors, onColorChange, selectedColorId]);

  useEffect(() => {
    if (selectedColorId === null) {
      setSelectedColor('');
      return;
    }

    const selectedItem = colors.find((item, index) => {
      const colorId = getColorId(item, index);

      return colorId === selectedColorId;
    });

    if (selectedItem) {
      setSelectedColor(selectedItem.color.name);
    }
  }, [colors, selectedColorId]);

  if (!colors.length) {
    return null;
  }

  return (
    <div>
      <div
        className={cn(
          singleRow ? (inline ? 'mt-0' : 'mt-1') : 'mt-1',
          'flex',
          singleRow
            ? inline
              ? 'w-auto flex-nowrap items-center gap-2'
              : 'w-auto flex-nowrap gap-2 overflow-x-auto pb-1'
            : `w-full flex-wrap ${sizeClasses.wrap}`,
        )}
      >
        {colors.map((item, index) => {
          const colorId = getColorId(item, index);
          const isSelected = selectedColorId === colorId;
          const isHoverAnimated = interactive && !isSelected;
          const colorStyle: CSSVariableStyle = {
            '--color': item.color.hex,
          };

          return (
            <button
              key={`${colorId}-${index}`}
              type="button"
              aria-label={`${item.color.name} 색상 선택`}
              aria-pressed={interactive ? isSelected : undefined}
              className={cn(
                'group relative rounded-full',
                singleRow ? '' : sizeClasses.margin,
                sizeClasses.button,
                interactive ? 'cursor-pointer' : 'cursor-default',
                interactive ? 'active:scale-[0.96]' : '',
                'before:absolute before:top-1/2 before:left-1/2 before:bg-ink dark:before:bg-surface before:w-full before:h-full before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2 before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.18,0.89,0.38,1.2)]',
                isSelected ? 'before:scale-100' : 'before:scale-[0.84]',
                isHoverAnimated ? 'hover:before:scale-[0.96]' : '',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary/30',
              )}
              onClick={() => {
                if (!interactive) {
                  return;
                }
                setSelectedColor(item.color.name);
                setUncontrolledSelectedColorId(colorId);
                onColorChange?.({
                  id: colorId,
                  name: item.color.name,
                  hex: item.color.hex,
                });
              }}
            >
              <span
                className={cn(
                  'absolute block rounded-full',
                  sizeClasses.dot,
                  'bg-(--color) top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-ink dark:border-surface transition-transform duration-200 ease-out',
                  isHoverAnimated ? 'group-hover:scale-[1.02]' : '',
                )}
                style={colorStyle}
              />
            </button>
          );
        })}
      </div>
      {showLabel && selectedColor ? (
        <div className={cn('pt-1 leading-none', sizeClasses.label)}>
          {selectedColor}
        </div>
      ) : null}
    </div>
  );
}
