import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart, FaArrowLeft, FaPercent, FaTags, FaTag } from 'react-icons/fa';
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
    getCartTotal,
    setCartItems,
    isInitialized
  } = useCart();
  
  const { promotions, promocodes, products } = useAdminData();
  const { createOrder } = useOrders();
  const navigate = useNavigate();
  
  // Логирование для диагностики
  console.log('Cart component: useOrders hook result:', { createOrder });
  console.log('Cart component: cart state:', { cartItems, isInitialized, cartItemsLength: cartItems?.length });
  
  const [showCheckout, setShowCheckout] = useState(false);
  const [promocode, setPromocode] = useState('');
  const [appliedPromocode, setAppliedPromocode] = useState(null);
  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryMethod: 'pickup',
    paymentMethod: 'cash',
    comment: ''
  });

  // ВСЕ ХУКИ ДОЛЖНЫ БЫТЬ ВЫЗВАНЫ ДО УСЛОВНЫХ ВОЗВРАТОВ
  // Расчет применимых скидок
  const applicableDiscounts = useMemo(() => {
    if (!isInitialized || !cartItems || !promotions || !products) {
      return [];
    }
    
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
  }, [cartItems, promotions, products, getCartTotal, isInitialized]);

  // Расчет финальных цен с учетом скидок и промокода
  const priceCalculation = useMemo(() => {
    if (!isInitialized || !cartItems) {
      return {
        subtotal: 0,
        discountAmount: 0,
        promocodeDiscount: 0,
        total: 0,
        appliedPromotion: null,
        appliedPromocode: null
      };
    }
    
    const subtotal = getCartTotal();
    let bestDiscount = applicableDiscounts[0];
    let discountAmount = bestDiscount ? Math.round(subtotal * (bestDiscount.discount / 100)) : 0;
    
    // Применяем промокод
    let promocodeDiscount = 0;
    if (appliedPromocode) {
      if (appliedPromocode.discountType === 'percent') {
        promocodeDiscount = Math.round(subtotal * (appliedPromocode.discount / 100));
        if (appliedPromocode.maxDiscount > 0) {
          promocodeDiscount = Math.min(promocodeDiscount, appliedPromocode.maxDiscount);
        }
      } else {
        promocodeDiscount = appliedPromocode.discount;
      }
    }
    
    // Если промокод не суммируется с акциями, выбираем максимальную скидку
    if (appliedPromocode && !appliedPromocode.stackable && bestDiscount) {
      const promotionDiscount = discountAmount;
      const promocodeDiscountAmount = promocodeDiscount;
      
      // Выбираем максимальную скидку
      if (promotionDiscount > promocodeDiscountAmount) {
        // Применяем только акцию
        promocodeDiscount = 0;
        bestDiscount = bestDiscount; // оставляем акцию
      } else {
        // Применяем только промокод
        discountAmount = 0;
        bestDiscount = null; // убираем акцию
      }
    }
    
    const total = subtotal - discountAmount - promocodeDiscount;

    return {
      subtotal,
      discountAmount,
      promocodeDiscount,
      total,
      appliedPromotion: bestDiscount,
      appliedPromocode
    };
  }, [getCartTotal, applicableDiscounts, appliedPromocode, isInitialized, cartItems]);

  // Показываем загрузку, пока корзина не инициализирована
  if (!isInitialized) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Загрузка корзины...</h2>
            <p>Пожалуйста, подождите</p>
          </div>
        </div>
      </div>
    );
  }

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

  const handlePromocodeChange = (e) => {
    setPromocode(e.target.value.toUpperCase());
  };

  const applyPromocode = () => {
    if (!promocode.trim()) {
      alert('Введите код промокода!');
      return;
    }

    const foundPromocode = promocodes.find(p => 
      p.code === promocode.trim() && 
      p.active && 
      (!p.validFrom || new Date(p.validFrom) <= new Date()) &&
      (!p.validUntil || new Date(p.validUntil) >= new Date()) &&
      (p.usageLimit === 0 || (p.usedCount || 0) < p.usageLimit)
    );

    if (!foundPromocode) {
      alert('Промокод не найден или недействителен!');
      setPromocode('');
      return;
    }

    const cartTotal = getCartTotal();
    if (foundPromocode.minPurchase > 0 && cartTotal < foundPromocode.minPurchase) {
      alert(`Минимальная сумма для применения промокода: ${foundPromocode.minPurchase.toLocaleString()} ₽`);
      setPromocode('');
      return;
    }

    // Проверяем, есть ли уже примененный промокод
    if (appliedPromocode) {
      alert('Сначала удалите текущий промокод!');
      setPromocode('');
      return;
    }

    setAppliedPromocode(foundPromocode);
    alert(`Промокод "${foundPromocode.description}" применен!`);
    setPromocode('');
  };

  const removePromocode = () => {
    setAppliedPromocode(null);
    alert('Промокод удален!');
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    try {
      // Генерируем номер заказа
      const orderNumber = generateOrderNumber();
      
      // Подготавливаем данные для отправки
      const orderData = {
        orderForm,
        cartItems,
        priceCalculation,
        orderNumber
      };
      
      // Сохраняем заказ в систему
      const savedOrder = await createOrder(orderData);
      console.log('Заказ сохранен в системе:', savedOrder);
      
      // Форматируем сообщение для Telegram
      const message = formatOrderMessage(orderData);
      
      // Отправляем в Telegram
      console.log('Отправляем заказ в Telegram...');
      const result = await sendTelegramMessage(message);
      
      if (result.success) {
        alert(`Заказ #${orderNumber} успешно оформлен! Мы свяжемся с вами в ближайшее время.`);
        console.log('Заказ успешно отправлен в Telegram');
      } else {
        console.error('Ошибка отправки в Telegram:', result.error);
        alert(`Заказ #${orderNumber} оформлен, но возникла ошибка при отправке уведомления. Мы обязательно с вами свяжемся!`);
      }
      
      // Очищаем корзину и переходим на главную
      clearCart();
      setShowCheckout(false);
      navigate('/');
      
    } catch (error) {
      console.error('Ошибка при оформлении заказа:', error);
      alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте еще раз или свяжитесь с нами по телефону.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="empty-cart">
            <FaShoppingCart className="empty-cart-icon" />
            <h2>Ваша корзина пуста</h2>
            <p>Добавьте товары из каталога, чтобы оформить заказ</p>
            <Link to="/catalog" className="continue-shopping-btn">
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
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft /> Назад
          </button>
          <h1>Корзина товаров</h1>
          <button onClick={clearCart} className="clear-cart-btn">
            Очистить корзину
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  className="cart-item"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="item-image">
                    {(() => {
                      const productData = products.find(p => p.id === item.id);
                      if (!productData) return (
                        <span className="item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BrandMark alt={item.title} style={{ height: 40 }} />
                        </span>
                      );
                      
                      const mainImage = getMainImage(productData);
                      if (mainImage?.data) {
                        if (
                          typeof mainImage.data === 'string' &&
                          (mainImage.data.startsWith('data:image') || mainImage.data.startsWith('/uploads/') || mainImage.data.startsWith('http'))
                        ) {
                          return <img src={mainImage.data} alt={item.title} className="item-image-img" />;
                        }
                        return (
                          <span className="item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BrandMark alt={item.title} style={{ height: 40 }} />
                          </span>
                        );
                      }
                      return (
                        <span className="item-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BrandMark alt={item.title} style={{ height: 40 }} />
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="item-info">
                    <h3>{item.title}</h3>
                    <p className="item-brand">{item.brand}</p>
                    <p className="item-price">{item.price.toLocaleString()} ₽</p>
                  </div>
                  
                  <div className="item-controls">
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="quantity-btn"
                      >
                        <FaMinus />
                      </button>
                      <input 
                        type="text" 
                        value={item.quantity} 
                        onChange={(e) => {
                          const inputValue = e.target.value.replace(/[^0-9]/g, '');
                          // Разрешаем пустое поле и любые числа
                          if (inputValue === '') {
                            // Устанавливаем пустое значение
                            setCartItems(prevItems =>
                              prevItems.map(cartItem =>
                                cartItem.id === item.id
                                  ? { ...cartItem, quantity: '' }
                                  : cartItem
                              )
                            );
                            return;
                          }
                          const value = parseInt(inputValue);
                          if (!isNaN(value)) {
                            handleQuantityChange(item.id, value);
                          }
                        }}
                        onBlur={(e) => {
                          // При потере фокуса, если поле пустое или меньше 1, ставим 1
                          const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                          if (cleanValue === '' || parseInt(cleanValue) < 1) {
                            handleQuantityChange(item.id, 1);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        placeholder="1"
                        className="quantity-input"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="quantity-btn"
                      >
                        <FaPlus />
                      </button>
                    </div>
                    
                    <div className="item-total">
                      {(item.price * item.quantity).toLocaleString()} ₽
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="remove-btn"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h3>Итого</h3>
              
              {/* Поле для промокода */}
              <div className="promocode-section">
                <h4>Промокод</h4>
                {!appliedPromocode ? (
                  <div className="promocode-input-group">
                    <input
                      type="text"
                      value={promocode}
                      onChange={handlePromocodeChange}
                      placeholder="Введите код промокода"
                      className="promocode-input"
                      maxLength="20"
                    />
                    <button 
                      onClick={applyPromocode}
                      className="promocode-apply-btn"
                      disabled={!promocode.trim()}
                    >
                      Применить
                    </button>
                  </div>
                ) : (
                  <div className="applied-promocode">
                    <div className="promocode-info">
                      <span className="promocode-code">{appliedPromocode.code}</span>
                      <span className="promocode-description">{appliedPromocode.description}</span>
                    </div>
                    <button 
                      onClick={removePromocode}
                      className="promocode-remove-btn"
                    >
                      ✕
                    </button>
                  </div>
                )}
                
                                 {/* Информация о суммировании */}
                 {appliedPromocode && (
                   <div className="promocode-stackable-info">
                     <small>
                       {appliedPromocode.stackable 
                         ? '✅ Суммируется с акциями' 
                         : '⚠️ Не суммируется с акциями!'
                       }
                     </small>
                   </div>
                 )}
              </div>
              
              <div className="summary-line">
                <span>Товары ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} шт):</span>
                <span>{priceCalculation.subtotal.toLocaleString()} ₽</span>
              </div>
              
              {priceCalculation.appliedPromotion && (
                <div className="summary-line discount-line">
                  <span>
                    <FaPercent className="discount-icon" />
                    Скидка "{priceCalculation.appliedPromotion.title}" ({priceCalculation.appliedPromotion.discount}%):
                  </span>
                  <span className="discount-amount">
                    -{priceCalculation.discountAmount.toLocaleString()} ₽
                  </span>
                </div>
              )}
              
              {priceCalculation.appliedPromocode && (
                <div className="summary-line promocode-line">
                  <span>
                    <FaTag className="promocode-icon" />
                    Промокод "{priceCalculation.appliedPromocode.description}":
                  </span>
                  <span className="promocode-amount">
                    -{priceCalculation.promocodeDiscount.toLocaleString()} ₽
                  </span>
                </div>
              )}
              
              <div className="summary-line">
                <span>Доставка:</span>
                <span>Бесплатно</span>
              </div>
              
              <div className="summary-total">
                <span>К оплате:</span>
                <span>{priceCalculation.total.toLocaleString()} ₽</span>
              </div>
              
              {(applicableDiscounts.length > 0 || priceCalculation.appliedPromocode) && (
                <div className="promotions-info">
                  <FaTags className="promo-icon" />
                  <span>
                    {priceCalculation.appliedPromocode && !priceCalculation.appliedPromocode.stackable && priceCalculation.appliedPromotion 
                      ? 'Применен промокод (акции отключены)'
                      : priceCalculation.appliedPromocode && priceCalculation.appliedPromocode.stackable && priceCalculation.appliedPromotion
                      ? 'Применены акции и промокод (суммируются)'
                      : priceCalculation.appliedPromotion && !priceCalculation.appliedPromocode
                      ? 'Применены активные акции!'
                      : 'Применен промокод!'
                    }
                  </span>
                </div>
              )}
              
              <motion.button
                className="checkout-btn"
                onClick={() => setShowCheckout(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Оформить заказ
              </motion.button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showCheckout && (
            <motion.div
              className="checkout-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="checkout-content"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
              >
                <h2>Оформление заказа</h2>
                
                <form onSubmit={handleSubmitOrder} className="order-form">
                  <div className="form-group">
                    <label htmlFor="name">Имя *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={orderForm.name}
                      onChange={handleFormChange}
                      required
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
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={orderForm.email}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="deliveryMethod">Способ получения *</label>
                    <select
                      id="deliveryMethod"
                      name="deliveryMethod"
                      value={orderForm.deliveryMethod}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="pickup">Самовывоз</option>
                      <option value="delivery">Доставка</option>
                    </select>
                  </div>
                  
                  {orderForm.deliveryMethod === 'delivery' && (
                    <div className="form-group">
                      <label htmlFor="address">Адрес доставки *</label>
                      <textarea
                        id="address"
                        name="address"
                        value={orderForm.address}
                        onChange={handleFormChange}
                        required={orderForm.deliveryMethod === 'delivery'}
                        rows="3"
                      />
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label htmlFor="paymentMethod">Способ оплаты *</label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={orderForm.paymentMethod}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="cash">Наличными</option>
                      <option value="card">Банковской картой</option>
                      <option value="transfer">Банковский перевод</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="comment">Комментарий к заказу</label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={orderForm.comment}
                      onChange={handleFormChange}
                      rows="3"
                    />
                  </div>
                  
                  <div className="order-summary">
                    <h4>Ваш заказ:</h4>
                    <div className="order-items">
                      {cartItems.map((item) => (
                        <div key={item.id} className="order-item">
                          <span>{item.title} × {item.quantity}</span>
                          <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
                        </div>
                      ))}
                    </div>
                    {priceCalculation.appliedPromotion && (
                      <div className="discount-info">
                        <div className="discount-line">
                          <span>Подытог: {priceCalculation.subtotal.toLocaleString()} ₽</span>
                        </div>
                        <div className="discount-line">
                          <span className="discount-text">
                            <FaPercent /> Скидка "{priceCalculation.appliedPromotion.title}" ({priceCalculation.appliedPromotion.discount}%):
                          </span>
                          <span className="discount-amount">
                            -{priceCalculation.discountAmount.toLocaleString()} ₽
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="order-total">
                      <strong>Итого: {priceCalculation.total.toLocaleString()} ₽</strong>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" onClick={() => setShowCheckout(false)} className="cancel-btn">
                      Отмена
                    </button>
                    <button type="submit" className="submit-btn">
                      Подтвердить заказ
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Cart;
