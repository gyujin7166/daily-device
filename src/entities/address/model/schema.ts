import { z } from 'zod';

import { normalizePhoneNumber, validateAddressField } from './form';

export const addressFormSchema = z.object({
  name: z.string().refine((value) => validateAddressField(value, 'name'), {
    error: 'name',
  }),
  phone_number: z
    .string()
    .refine((value) => validateAddressField(value, 'phone_number'), {
      error: 'phone_number',
    }),
  address_1: z
    .string()
    .refine((value) => validateAddressField(value, 'address_1'), {
      error: 'address_1',
    }),
  address_2: z.string(),
});

export type AddressFormValues = z.infer<typeof addressFormSchema>;

export const addressCreateFormSchema = addressFormSchema.extend({
  isDefault: z.boolean(),
});

export type AddressCreateFormValues = z.infer<typeof addressCreateFormSchema>;

export type AddressFormPayload = {
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2?: string;
  isDefault: boolean;
};

export const toAddressFormPayload = (
  formValues: AddressFormValues,
  isDefault: boolean,
): AddressFormPayload => {
  const address2 = formValues.address_2.trim();

  return {
    recipientName: formValues.name.trim(),
    recipientPhone: normalizePhoneNumber(formValues.phone_number),
    address1: formValues.address_1.trim(),
    address2: address2 || undefined,
    isDefault,
  };
};
