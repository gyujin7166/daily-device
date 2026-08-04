import { useTranslations } from 'next-intl';

import { inputClass, labelClass } from '@shared/ui/AdminControls';

import type { AdminColor, ProductFormState } from '../model/types';
import type { UseFormRegister } from 'react-hook-form';

type AdminProductColorFieldsProps = {
  colors: AdminColor[];
  colorIds: string[];
  selectedFormColors: AdminColor[];
  locale: string;
  register: UseFormRegister<ProductFormState>;
  onToggleColor: (colorId: string, isChecked: boolean) => void;
};

const getLocalizedColorName = (color: AdminColor, locale: string) =>
  color.translations.find((translation) => translation.locale === locale)
    ?.name ?? color.name;

export default function AdminProductColorFields({
  colors,
  colorIds,
  selectedFormColors,
  locale,
  register,
  onToggleColor,
}: AdminProductColorFieldsProps) {
  const t = useTranslations('AdminProduct.colors');

  return (
    <>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium text-ink dark:text-surface">
          {t('title')}
        </legend>
        <div className="grid gap-2">
          {colors.map((color) => {
            const colorId = String(color.id);

            return (
              <label
                key={color.id}
                className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold transition hover:border-primary dark:border-dark-border"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={colorIds.includes(colorId)}
                  onChange={(event) =>
                    onToggleColor(colorId, event.target.checked)
                  }
                />
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-line dark:border-dark-border"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate">
                  {getLocalizedColorName(color, locale)}
                </span>
              </label>
            );
          })}
        </div>
        {colors.length === 0 ? (
          <p className="text-sm text-muted dark:text-dark-muted">
            {t('empty')}
          </p>
        ) : null}
      </fieldset>
      {selectedFormColors.length > 0 ? (
        <label className={labelClass}>
          {t('defaultColor')}
          <select
            className={inputClass}
            {...register('defaultColorId')}
            required
          >
            {selectedFormColors.map((color) => (
              <option key={color.id} value={color.id}>
                {getLocalizedColorName(color, locale)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}
