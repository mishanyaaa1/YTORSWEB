import { useCart } from '../context/CartContext';

export const useCartActions = () => {
  const { addToCart } = useCart();

  const addToCartWithNotification = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      // Простое уведомление через alert (можно заменить на более красивое позже)
      // alert(`${product.title} добавлен в корзину!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Ошибка при добавлении товара в корзину');
    }
  };

  return {
    addToCartWithNotification
  };
};
