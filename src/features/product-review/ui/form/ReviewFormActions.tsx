import { IconLoader2 } from '@tabler/icons-react';

type ReviewFormActionsProps = {
  isEditing: boolean;
  isPending: boolean;
  isUploading: boolean;
  onCancel: () => void;
};

export default function ReviewFormActions({
  isEditing,
  isPending,
  isUploading,
  onCancel,
}: ReviewFormActionsProps) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 dark:border-dark-border dark:bg-dark-panel">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-primary bg-transparent px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-soft dark:border-primary dark:text-primary dark:hover:bg-primary/15"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isPending || isUploading}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-surface transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <IconLoader2 className="animate-spin" size={18} />
              이미지 업로드 중
            </>
          ) : isPending ? (
            <>
              <IconLoader2 className="animate-spin" size={18} />
              {isEditing ? '수정 중' : '등록 중'}
            </>
          ) : isEditing ? (
            '상품평 수정'
          ) : (
            '상품평 등록'
          )}
        </button>
      </div>
    </div>
  );
}
