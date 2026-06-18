export type UserAddress = {
  id: number;
  recipientName: string;
  recipientPhone: string;
  address1: string;
  address2: string | null;
  isDefault: boolean;
  updatedAt: string;
};
