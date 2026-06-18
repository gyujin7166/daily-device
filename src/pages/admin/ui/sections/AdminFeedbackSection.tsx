type AdminFeedbackSectionProps = {
  canWriteAdmin: boolean;
  message: string;
  error: string;
};

export default function AdminFeedbackSection({
  canWriteAdmin,
  message,
  error,
}: AdminFeedbackSectionProps) {
  return (
    <>
      {!canWriteAdmin ? (
        <p className="rounded-md border border-primary/20 bg-primary-soft px-4 py-3 text-sm font-semibold text-primary dark:border-primary/30 dark:bg-dark-bg-hover">
          일반 계정은 관리자 데이터를 조회할 수 있지만, 추가/수정/삭제는
          제한됩니다.
        </p>
      ) : null}

      {message ? (
        <p className="rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm font-semibold text-success">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-danger/30 bg-red-50 px-4 py-3 text-sm font-semibold text-danger dark:bg-red-950/30">
          {error}
        </p>
      ) : null}
    </>
  );
}
