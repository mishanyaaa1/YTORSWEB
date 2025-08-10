import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export const useCartActions = () => {
  const { addToCart } = useCart();

  const addToCartWithNotification = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      const title = product?.title || 'Товар';
      const price = product?.price != null ? ` — ${product.price} ₽` : '';
      toast.success(`${title} добавлен в корзину${price}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Ошибка при добавлении товара в корзину');
    }
  };

  return {
    addToCartWithNotification
  };
};
