import { useCartLocalStore } from '../store/cartLocalStore';

export default function useLocalCartActions() {
  const { updateLocalCart, deleteLocalCartItem } = useCartLocalStore(
    (state) => state.actions,
  );

  return {
    updateLocalCart,
    deleteLocalCartItem,
  };
}
