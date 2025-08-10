import { useCart } from '../context/CartContext';
import { showToast } from '../utils/notify';

export const useCartActions = () => {
  const { addToCart } = useCart();

  const addToCartWithNotification = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      showToast(`${product.title} добавлен в корзину`, 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Ошибка при добавлении в корзину', 'error');
    }
  };

  return {
    addToCartWithNotification
  };
};
