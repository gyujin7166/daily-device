type ShippingFormInputFeedbackMessageProps = {
  isValid: boolean;
  hasInvalidState: boolean;
  validMessage: string | null;
  invalidMessage: string;
};

export default function ShippingFormInputFeedbackMessage({
  isValid,
  hasInvalidState,
  validMessage,
  invalidMessage,
}: ShippingFormInputFeedbackMessageProps) {
  return (
    <>
      {isValid && validMessage !== null ? (
        <span className="text-sm text-muted sm:text-xs dark:text-dark-muted">
          {validMessage}
        </span>
      ) : null}
      {hasInvalidState ? (
        <span className="text-sm font-semibold text-danger sm:text-xs">
          {invalidMessage}
        </span>
      ) : null}
    </>
  );
}
