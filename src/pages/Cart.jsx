import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaPercent } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAdminData } from '../context/AdminDataContext';
import { useOrders } from '../context/OrdersContext';
import { getMainImage } from '../utils/imageHelpers';
import { sendTelegramMessage, formatOrderMessage, generateOrderNumber } from '../utils/telegramService';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const { promotions, products } = useAdminData();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [orderForm, setOrderForm] = useState({
    name: '', phone: '', email: '', address: '',
    deliveryMethod: 'pickup', paymentMethod: 'cash', comment: ''
  });

  const priceCalculation = useMemo(() => {
    const subtotal = getCartTotal();
    const cartCategories = [...new Set(cartItems.map(item => products.find(p => p.id === item.id)?.category).filter(Boolean))];
    
    const applicablePromotions = promotions.filter(promo => {
      if (!promo.active) return false;
      if (promo.validUntil && new Date(promo.validUntil) < new Date()) return false;
      if (promo.minPurchase && subtotal < promo.minPurchase) return false;
      if (promo.category && promo.category !== 'all' && !cartCategories.includes(promo.category)) return false;
      return true;
    }).sort((a, b) => (b.discount || 0) - (a.discount || 0));

    const bestDiscount = applicablePromotions[0];
    const discountAmount = bestDiscount ? Math.round(subtotal * (bestDiscount.discount / 100)) : 0;
    const total = subtotal - discountAmount;

    return { subtotal, discountAmount, total, appliedPromotion: bestDiscount };
  }, [cartItems, promotions, products, getCartTotal]);

  const handleFormChange = (e) => {
    setOrderForm({ ...orderForm, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    try {
      const orderNumber = generateOrderNumber();
      const orderData = { orderForm, cartItems, priceCalculation, orderNumber };
      
      await createOrder(orderData);
      const message = formatOrderMessage(orderData);
      const result = await sendTelegramMessage(message);

      if (result.success) {
        alert(`Заказ #${orderNumber} успешно оформлен! Мы свяжемся с вами.`);
      } else {
        alert(`Заказ #${orderNumber} оформлен, но при отправке уведомления произошла ошибка. Мы свяжемся с вами!`);
      }
      
      clearCart();
      navigate('/');
    } catch (error) {
      alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <div className="empty-cart">
          <FaShoppingCart className="icon" />
          <h2>Ваша корзина пуста</h2>
          <p>Добавьте товары из каталога, чтобы сделать заказ.</p>
          <Link to="/catalog" className="cta-button">Перейти в каталог</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Корзина</h1>
      </div>
      <div className="cart-layout">
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={getMainImage(products.find(p => p.id === item.id))?.data || '/placeholder.png'} alt={item.title} className="item-image" />
              <div className="item-details">
                <Link to={`/product/${item.id}`} className="item-title">{item.title}</Link>
                <p className="item-price">{item.price.toLocaleString()} ₽</p>
                <div className="quantity-control">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                  <input type="text" value={item.quantity} readOnly />
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <div className="item-subtotal">
                <p>{(item.price * item.quantity).toLocaleString()} ₽</p>
                <button onClick={() => removeFromCart(item.id)} className="remove-item-btn"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="checkout-section">
          <div className="cart-summary">
            <h3>Итог заказа</h3>
            <div className="summary-line">
              <span>Товары ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
              <span>{priceCalculation.subtotal.toLocaleString()} ₽</span>
            </div>
            {priceCalculation.appliedPromotion && (
              <div className="summary-line discount">
                <span><FaPercent /> Скидка "{priceCalculation.appliedPromotion.title}"</span>
                <span>-{priceCalculation.discountAmount.toLocaleString()} ₽</span>
              </div>
            )}
            <div className="summary-total">
              <span>Итого</span>
              <span>{priceCalculation.total.toLocaleString()} ₽</span>
            </div>
          </div>

          <form onSubmit={handleSubmitOrder} className="checkout-form">
            <h3>Оформление заказа</h3>
            <div className="form-group">
              <label>Имя*</label>
              <input type="text" name="name" value={orderForm.name} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Телефон*</label>
              <input type="tel" name="phone" value={orderForm.phone} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={orderForm.email} onChange={handleFormChange} />
            </div>
            <div className="form-group">
              <label>Способ получения*</label>
              <select name="deliveryMethod" value={orderForm.deliveryMethod} onChange={handleFormChange}>
                <option value="pickup">Самовывоз</option>
                <option value="delivery">Доставка</option>
              </select>
            </div>
            {orderForm.deliveryMethod === 'delivery' && (
              <div className="form-group">
                <label>Адрес доставки*</label>
                <textarea name="address" value={orderForm.address} onChange={handleFormChange} required rows="3"></textarea>
              </div>
            )}
            <div className="form-group">
              <label>Комментарий</label>
              <textarea name="comment" value={orderForm.comment} onChange={handleFormChange} rows="3"></textarea>
            </div>
            <button type="submit" className="submit-order-btn">Подтвердить заказ</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Cart;
