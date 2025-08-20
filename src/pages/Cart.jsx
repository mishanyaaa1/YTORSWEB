import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaPercent, FaTags, FaCreditCard, FaTruck, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAdminData } from '../context/AdminDataContext';
import { useOrders } from '../context/OrdersContext';
import { getMainImage } from '../utils/imageHelpers';
import BrandMark from '../components/BrandMark';
import { sendTelegramMessage, formatOrderMessage, generateOrderNumber } from '../utils/telegramService';
import './Cart.css';

function Cart() {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getCartTotal 
  } = useCart();
  
  const { promotions, products } = useAdminData();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
    comment: ''
  });

  // Расчет применимых скидок
  const applicableDiscounts = useMemo(() => {
    const cartTotal = getCartTotal();
    const cartCategories = [...new Set(cartItems.map(item => {
      const product = products.find(p => p.id === item.id);
      return product?.category;
    }).filter(Boolean))];

    const activePromotions = promotions.filter(promo => {
      if (!promo.active) return false;
      
      // Проверяем срок действия
      if (promo.validUntil) {
        const validDate = new Date(promo.validUntil);
        if (validDate < new Date()) return false;
      }
      
      // Проверяем минимальную сумму покупки
      if (promo.minPurchase && cartTotal < promo.minPurchase) return false;
      
      // Проверяем категорию (если указана)
      if (promo.category && promo.category !== 'all' && !cartCategories.includes(promo.category)) {
        return false;
      }
      
      return true;
    });

    // Сортируем по убыванию скидки (лучшие сначала)
    return activePromotions.sort((a, b) => (b.discount || 0) - (a.discount || 0));
  }, [cartItems, promotions, products, getCartTotal]);

  // Расчет финальных цен с учетом скидок
  const priceCalculation = useMemo(() => {
    const subtotal = getCartTotal();
    const bestDiscount = applicableDiscounts[0];
    const discountAmount = bestDiscount ? Math.round(subtotal * (bestDiscount.discount / 100)) : 0;
    const total = subtotal - discountAmount;

    return {
      subtotal,
      discountAmount,
      total,
      appliedPromotion: bestDiscount
    };
  }, [getCartTotal, applicableDiscounts]);

  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
  };

  const handleFormChange = (e) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!orderForm.name || !orderForm.phone) {
      alert('Пожалуйста, заполните обязательные поля: имя и телефон');
      return;
    }

    try {
      const orderNumber = generateOrderNumber();
      const orderData = {
        orderNumber,
        items: cartItems,
        customerInfo: orderForm,
        total: priceCalculation.total,
        discount: priceCalculation.discountAmount,
        appliedPromotion: priceCalculation.appliedPromotion
      };

      // Создаем заказ в контексте
      await createOrder(orderData);

      // Отправляем уведомление в Telegram
      const message = formatOrderMessage(orderData);
      await sendTelegramMessage(message);

      // Очищаем корзину и переходим на страницу успешного заказа
      clearCart();
      navigate('/order-success', { 
        state: { orderNumber, orderData } 
      });
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      alert('Произошла ошибка при создании заказа. Попробуйте еще раз.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <FaShoppingCart />
            </div>
            <h2>Ваша корзина пуста</h2>
            <p>Добавьте товары в корзину, чтобы продолжить покупки</p>
            <Link to="/catalog" className="cta-button">
              Перейти в каталог
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <Link to="/catalog" className="back-link">
            <FaArrowLeft />
            Вернуться к покупкам
          </Link>
          <h1 className="cart-title">Корзина</h1>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <h2 className="cart-section-title">Товары в корзине</h2>
            <AnimatePresence>
              {cartItems.map((item) => {
                const product = products.find(p => p.id === item.id);
                if (!product) return null;

                return (
                  <motion.div
                    key={item.id}
                    className="cart-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="cart-item-image">
                      {(() => {
                        const mainImage = getMainImage(product);
                        if (mainImage?.data) {
                          const resolved = typeof mainImage.data === 'string' ? mainImage.data : null;
                          if (
                            (typeof mainImage.data === 'string' && mainImage.data.startsWith('data:image')) ||
                            resolved
                          ) {
                            return (
                              <img
                                src={resolved || mainImage.data}
                                alt={product.title}
                                className="cart-product-image"
                              />
                            );
                          }
                        }
                        return (
                          <span className="cart-product-icon">
                            <BrandMark alt={product.title} style={{ height: 48 }} />
                          </span>
                        );
                      })()}
                    </div>

                    <div className="cart-item-info">
                      <h3 className="cart-item-title">{product.title}</h3>
                      <div className="cart-item-meta">
                        <span className="cart-item-category">{product.category}</span>
                        {product.brand && <span className="cart-item-brand">{product.brand}</span>}
                      </div>
                      <div className="cart-item-price">{product.price.toLocaleString()} ₽</div>
                    </div>

                    <div className="cart-item-quantity">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus />
                      </button>
                      <span className="quantity-value">{item.quantity}</span>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <div className="cart-item-total">
                      {(product.price * item.quantity).toLocaleString()} ₽
                    </div>

                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveItem(item.id)}
                      title="Удалить товар"
                    >
                      <FaTrash />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="cart-sidebar">
            <div className="cart-summary">
              <h3 className="summary-title">Итого заказа</h3>
              
              {applicableDiscounts.length > 0 && (
                <div className="promotions-section">
                  <h4 className="promotions-title">
                    <FaTags />
                    Доступные скидки
                  </h4>
                  {applicableDiscounts.map((promo, index) => (
                    <div key={index} className="promotion-item">
                      <div className="promotion-info">
                        <span className="promotion-name">{promo.title}</span>
                        <span className="promotion-discount">-{promo.discount}%</span>
                      </div>
                      {promo.description && (
                        <p className="promotion-description">{promo.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Подытог:</span>
                  <span>{priceCalculation.subtotal.toLocaleString()} ₽</span>
                </div>
                {priceCalculation.discountAmount > 0 && (
                  <div className="price-row discount">
                    <span>Скидка:</span>
                    <span>-{priceCalculation.discountAmount.toLocaleString()} ₽</span>
                  </div>
                )}
                <div className="price-row total">
                  <span>Итого:</span>
                  <span>{priceCalculation.total.toLocaleString()} ₽</span>
                </div>
              </div>

              <button
                className="checkout-btn"
                onClick={() => setShowCheckout(true)}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        </div>

        {/* Форма оформления заказа */}
        {showCheckout && (
          <motion.div
            className="checkout-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="checkout-content">
              <div className="checkout-header">
                <h2>Оформление заказа</h2>
                <button
                  className="close-checkout"
                  onClick={() => setShowCheckout(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmitOrder} className="checkout-form">
                <div className="form-section">
                  <h3 className="form-section-title">
                    <FaUser />
                    Контактная информация
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="name">Имя *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={orderForm.name}
                        onChange={handleFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Телефон *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={orderForm.phone}
                        onChange={handleFormChange}
                        required
                        className="form-input"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={orderForm.email}
                        onChange={handleFormChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Адрес доставки</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={orderForm.address}
                        onChange={handleFormChange}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <FaTruck />
                    Способ доставки
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="deliveryMethod">Выберите способ доставки</label>
                      <select
                        id="deliveryMethod"
                        name="deliveryMethod"
                        value={orderForm.deliveryMethod}
                        onChange={handleFormChange}
                        className="form-select"
                      >
                        <option value="pickup">Самовывоз</option>
                        <option value="courier">Курьерская доставка</option>
                        <option value="post">Почтовая доставка</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">
                    <FaCreditCard />
                    Способ оплаты
                  </h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="paymentMethod">Выберите способ оплаты</label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={orderForm.paymentMethod}
                        onChange={handleFormChange}
                        className="form-select"
                      >
                        <option value="cash">Наличными при получении</option>
                        <option value="card">Банковской картой</option>
                        <option value="transfer">Банковский перевод</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="form-section-title">Комментарий к заказу</h3>
                  <div className="form-group">
                    <textarea
                      name="comment"
                      value={orderForm.comment}
                      onChange={handleFormChange}
                      placeholder="Дополнительная информация о заказе..."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowCheckout(false)}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="submit-btn">
                    Подтвердить заказ
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Cart;
