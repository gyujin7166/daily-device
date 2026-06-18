const cartVariantMutationRevisions = new Map<string, number>();

export function getCartVariantMutationRevision(variantKey: string) {
  return cartVariantMutationRevisions.get(variantKey) ?? 0;
}

export function bumpCartVariantMutationRevision(variantKey: string) {
  const nextRevision = getCartVariantMutationRevision(variantKey) + 1;
  cartVariantMutationRevisions.set(variantKey, nextRevision);
  return nextRevision;
}

export function isCartVariantMutationCurrent(
  variantKey: string,
  revision: number | undefined,
) {
  if (typeof revision !== 'number') {
    return true;
  }

  return revision === getCartVariantMutationRevision(variantKey);
}
