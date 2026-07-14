import { useCallback, useState } from 'react';

import { useTranslations } from 'next-intl';

import { ADMIN_ERROR_CODE } from '@shared/constants/adminErrorCode';
import { HttpError } from '@shared/lib/errors/httpError';
import { toast } from '@shared/lib/toast';

const adminErrorMessageKeyByCode = {
  [ADMIN_ERROR_CODE.ADMIN_LOGIN_REQUIRED]: 'loginRequired',
  [ADMIN_ERROR_CODE.ADMIN_WRITE_FORBIDDEN]: 'writeForbidden',
  [ADMIN_ERROR_CODE.UNIQUE_CONSTRAINT]: 'uniqueConstraint',
  [ADMIN_ERROR_CODE.RELATION_CONSTRAINT]: 'relationConstraint',
  [ADMIN_ERROR_CODE.HOME_SECTION_UPDATE_FAILED]: 'homeSectionUpdateFailed',
  [ADMIN_ERROR_CODE.HOME_SECTION_NOT_FOUND]: 'homeSectionNotFound',
  [ADMIN_ERROR_CODE.HOME_CARD_CAROUSEL_FIELDS_REQUIRED]:
    'homeCardCarouselFieldsRequired',
  [ADMIN_ERROR_CODE.HOME_CARD_UNSUPPORTED_LAYOUT]: 'homeCardUnsupportedLayout',
  [ADMIN_ERROR_CODE.HOME_CARD_PRESET_CONFLICT]: 'homeCardPresetConflict',
  [ADMIN_ERROR_CODE.HOME_CARD_AREA_CONFLICT]: 'homeCardAreaConflict',
  [ADMIN_ERROR_CODE.HOME_CARD_LAYOUT_LIMIT_EXCEEDED]:
    'homeCardLayoutLimitExceeded',
  [ADMIN_ERROR_CODE.HOME_CARD_CREATE_FAILED]: 'homeCardCreateFailed',
  [ADMIN_ERROR_CODE.HOME_CARD_NOT_FOUND]: 'homeCardNotFound',
  [ADMIN_ERROR_CODE.HOME_CARD_UPDATE_FAILED]: 'homeCardUpdateFailed',
  [ADMIN_ERROR_CODE.HERO_TYPE_NOT_FOUND]: 'heroTypeNotFound',
  [ADMIN_ERROR_CODE.HERO_TYPE_UNSUPPORTED]: 'heroTypeUnsupported',
  [ADMIN_ERROR_CODE.HERO_PRODUCT_CATEGORY_REQUIRED]:
    'heroProductCategoryRequired',
  [ADMIN_ERROR_CODE.HERO_TARGET_CATEGORY_NOT_FOUND]: 'heroTargetCategoryNotFound',
  [ADMIN_ERROR_CODE.HERO_CREATE_FAILED]: 'heroCreateFailed',
  [ADMIN_ERROR_CODE.HERO_UPDATE_FAILED]: 'heroUpdateFailed',
  [ADMIN_ERROR_CODE.HERO_DELETE_FAILED]: 'heroDeleteFailed',
  [ADMIN_ERROR_CODE.PRODUCT_IMAGE_COLOR_REQUIRED]: 'productImageColorRequired',
  [ADMIN_ERROR_CODE.PRODUCT_IMAGE_COMMON_ONLY]: 'productImageCommonOnly',
  [ADMIN_ERROR_CODE.PRODUCT_IMAGE_COLOR_NOT_FOUND]:
    'productImageColorNotFound',
  [ADMIN_ERROR_CODE.PRODUCT_COLOR_NOT_FOUND]: 'productColorNotFound',
  [ADMIN_ERROR_CODE.PRODUCT_COLOR_DELETE_BLOCKED]:
    'productColorDeleteBlocked',
  [ADMIN_ERROR_CODE.PRODUCT_NOT_FOUND]: 'productNotFound',
  [ADMIN_ERROR_CODE.PRODUCT_CREATE_FAILED]: 'productCreateFailed',
  [ADMIN_ERROR_CODE.PRODUCT_UPDATE_FAILED]: 'productUpdateFailed',
  [ADMIN_ERROR_CODE.PRODUCT_DELETE_BLOCKED]: 'productDeleteBlocked',
  [ADMIN_ERROR_CODE.PRODUCT_DELETE_FAILED]: 'productDeleteFailed',
} as const;

export const useAdminFeedback = () => {
  const t = useTranslations('Admin.feedback');
  const tApiError = useTranslations('Admin.apiErrors');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const showMessage = useCallback((nextMessage: string) => {
    setError('');
    setMessage(nextMessage);
  }, []);

  const showError = useCallback(
    (nextError: unknown) => {
      setMessage('');

      if (nextError instanceof HttpError && nextError.code) {
        const messageKey =
          adminErrorMessageKeyByCode[
            nextError.code as keyof typeof adminErrorMessageKeyByCode
          ];

        if (messageKey) {
          setError(tApiError(messageKey));
          return;
        }
      }

      setError(nextError instanceof Error ? nextError.message : String(nextError));
    },
    [tApiError],
  );

  const showReadOnlyNotice = useCallback(() => {
    toast.info(t('readOnlyToast'));
  }, [t]);

  return {
    message,
    error,
    showMessage,
    showError,
    showReadOnlyNotice,
  };
};
