import type { Dispatch, SetStateAction } from 'react';

import { inputClass, labelClass } from '@pages/admin/ui/shared/AdminControls';

import type { AdminColor, ProductFormState } from '../model/types';

type AdminProductColorFieldsProps = {
  form: ProductFormState;
  colors: AdminColor[];
  selectedFormColors: AdminColor[];
  setForm: Dispatch<SetStateAction<ProductFormState>>;
  onToggleColor: (colorId: string) => void;
};

export default function AdminProductColorFields({
  form,
  colors,
  selectedFormColors,
  setForm,
  onToggleColor,
}: AdminProductColorFieldsProps) {
  return (
    <>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium text-ink dark:text-surface">
          상품 색상
        </legend>
        <div className="grid gap-2">
          {colors.map((color) => {
            const colorId = String(color.id);
            const checked = form.colorIds.includes(colorId);

            return (
              <label
                key={color.id}
                className="flex min-w-0 cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm font-semibold transition hover:border-primary dark:border-dark-border"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={checked}
                  onChange={() => onToggleColor(colorId)}
                />
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-line dark:border-dark-border"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="truncate">{color.name}</span>
              </label>
            );
          })}
        </div>
        {colors.length === 0 ? (
          <p className="text-sm text-muted dark:text-dark-muted">
            등록된 색상이 없습니다.
          </p>
        ) : null}
      </fieldset>
      {selectedFormColors.length > 0 ? (
        <label className={labelClass}>
          기본 색상
          <select
            className={inputClass}
            value={form.defaultColorId}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                defaultColorId: event.target.value,
              }))
            }
            required
          >
            {selectedFormColors.map((color) => (
              <option key={color.id} value={color.id}>
                {color.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </>
  );
}
