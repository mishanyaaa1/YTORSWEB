import React from 'react';
import { motion } from 'framer-motion';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaTools,
  FaTruck,
  FaStore,
  FaShippingFast,
  FaCreditCard,
  FaShieldAlt,
  FaFileInvoice,
  FaUniversity,
  FaCcVisa,
  FaCcMastercard,
  FaMoneyBillWave
} from 'react-icons/fa';
import './About.css';
import { getIconForEmoji } from '../utils/iconMap.jsx';
import Reveal from '../components/Reveal';

export default function About() {
  // Статичные данные для страницы "О компании"
  const aboutContent = {
    aboutSection: {
      title: 'О компании ЮТОРС',
      description: 'Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок. Наша компания работает на рынке уже более 10 лет и зарекомендовала себя как надежный поставщик.',
      image: '/img/vehicles/1757657975220-561708050.png'
    },
    advantages: [
      {
        icon: "🚚",
        title: "Быстрая доставка",
        description: "Доставка по всей России в кратчайшие сроки. Экспресс-доставка по Москве и области."
      },
      {
        icon: "💰",
        title: "Выгодные цены",
        description: "Конкурентные цены на все товары. Скидки для постоянных клиентов и оптовых покупателей."
      },
      {
        icon: "🔧",
        title: "Широкий ассортимент",
        description: "Более 15000 наименований запчастей для всех типов и марок вездеходов."
      },
      {
        icon: "✅",
        title: "Гарантия качества",
        description: "Полная гарантия на все товары и профессиональная поддержка. Обменяем или вернем деньги в случае брака."
      }
    ],
    contacts: {
      phone: '+7 (800) 123-45-67',
      email: 'info@vezdehod-zapchasti.ru',
      address: '40-летия Победы, 16а, Курчатовский район, Челябинск, 454100',
      workingHours: 'Пн-Пт: 9:00-18:00, Сб: 10:00-16:00'
    },
    team: {
      title: 'Наша команда',
      members: [
        {
          name: 'Александр Иванов',
          position: 'Директор',
          photo: '/img/vehicles/1757657975220-561708050.png',
          description: 'Опыт работы в сфере запчастей для вездеходов более 15 лет'
        },
        {
          name: 'Мария Петрова',
          position: 'Менеджер по продажам',
          photo: '/img/vehicles/1757658286691-822575460.jpg',
          description: 'Специалист по подбору запчастей для различных типов вездеходов'
        }
      ]
    },
    history: {
      title: 'История компании',
      content: 'Компания ЮТОРС была основана в 2014 году с целью обеспечения качественными запчастями владельцев вездеходов по всей России.',
      milestones: {
        title: 'Основные этапы развития:',
        items: [
          { year: '2014', event: 'Основание компании' },
          { year: '2016', event: 'Расширение ассортимента до 5000 позиций' },
          { year: '2018', event: 'Открытие филиала в Москве' },
          { year: '2020', event: 'Запуск интернет-магазина' },
          { year: '2024', event: 'Ассортимент более 15000 позиций' }
        ]
      }
    },
    deliveryAndPayment: {
      steps: [
        { step: '1', title: 'Выбор товара', description: 'Выберите нужные запчасти в каталоге' },
        { step: '2', title: 'Оформление заказа', description: 'Заполните форму заказа с контактными данными' },
        { step: '3', title: 'Подтверждение', description: 'Менеджер свяжется с вами для подтверждения заказа' },
        { step: '4', title: 'Оплата', description: 'Оплатите заказ удобным способом' },
        { step: '5', title: 'Доставка', description: 'Получите товар в указанное время' }
      ],
      deliveryMethods: [
        { name: 'Курьерская доставка', description: 'По Москве и области - 1-2 дня' },
        { name: 'Почта России', description: 'По всей России - 3-7 дней' },
        { name: 'Транспортная компания', description: 'Крупногабаритные товары - 5-10 дней' }
      ],
      deliveryNote: 'Стоимость доставки рассчитывается индивидуально в зависимости от веса и габаритов товара.',
      payment: {
        whyPrepay: 'Предоплата позволяет нам быстрее обработать ваш заказ и отправить товар.',
        whyPrepayExtra: 'Это особенно важно для редких запчастей, которые мы заказываем специально для вас.',
        trust: 'Мы работаем официально и предоставляем все необходимые документы.',
        trustExtra: 'В случае возникновения вопросов вы всегда можете связаться с нами.',
        requisites: 'ООО "ЮТОРС"\nИНН: 1234567890\nКПП: 123456789\nр/с: 40702810123456789012\nБанк: ПАО "Сбербанк"\nБИК: 044525225\nк/с: 30101810400000000225'
      }
    },
    whyChooseUs: [
      { icon: '🏆', title: 'Опыт', description: 'Более 10 лет на рынке запчастей для вездеходов' },
      { icon: '🔧', title: 'Качество', description: 'Только оригинальные и сертифицированные запчасти' },
      { icon: '🚚', title: 'Доставка', description: 'Быстрая доставка по всей России' },
      { icon: '💰', title: 'Цены', description: 'Конкурентные цены и гибкая система скидок' }
    ]
  };


  // Используем данные команды из админки или дефолтные данные
  const team = aboutContent.team && aboutContent.team.members && aboutContent.team.members.length > 0 
    ? aboutContent.team.members 
    : [
        {
          name: "Алексей Петров",
          position: "Генеральный директор",
          experience: "15 лет в автомобильной индустрии",
          photo: "👨‍💼",
          description: "Основатель компании, эксперт по вездеходной технике"
        },
        {
          name: "Мария Сидорова",
          position: "Технический директор",
          experience: "12 лет работы с вездеходами",
          photo: "👩‍🔧",
          description: "Отвечает за техническую экспертизу и качество продукции"
        },
        {
          name: "Дмитрий Иванов",
          position: "Менеджер по продажам",
          experience: "8 лет в сфере запчастей",
          photo: "👨‍💻",
          description: "Помогает клиентам найти нужные запчасти и решает вопросы"
        }
      ];


  const contactsData = aboutContent.contacts || {};
  const contacts = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Адрес",
      info: contactsData.address || "40-летия Победы, 16а, Курчатовский район, Челябинск, 454100",
      link: "#"
    },
    {
      icon: <FaPhone />,
      title: "Телефон",
      info: contactsData.phone || "+7 (800) 123-45-67",
      link: `tel:${contactsData.phone || '+78001234567'}`
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      info: contactsData.email || "info@vezdehod-zapchasti.ru",
      link: `mailto:${contactsData.email || 'info@vezdehod-zapchasti.ru'}`
    },
    {
      icon: <FaClock />,
      title: "Время работы",
      info: contactsData.workingHours || "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
      link: null
    }
  ];

  const getDeliveryIcon = (title) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('самовывоз')) return <FaStore />;
    if (lower.includes('бесплатная')) return <FaTruck />;
    if (lower.includes('россии') || lower.includes('снг') || lower.includes('доставка')) return <FaShippingFast />;
    return <FaTruck />;
  };

  return (
    <div className="about-page">
      {/* Hero секция */}
      <section className="about-hero">
        <div className="container">
          <Reveal type="up">
            <div className="hero-content">
              <h1 className="about-title">
                {(() => {
                  const title = aboutContent.title || "О компании ВездеходЗапчасти";
                  if (title.includes('\n')) {
                    return title.split('\n').map((line, index) => (
                      <span key={index} style={{ display: 'block' }}>
                        {line}
                      </span>
                    ));
                  }
                  return title;
                })()}
              </h1>
              <div className="about-description">
                {(() => {
                  const description = aboutContent.description || "Мы специализируемся на поставке качественных запчастей для вездеходов всех типов и марок. Наша цель — обеспечить вас надежными комплектующими для безопасной и комфортной эксплуатации вашей техники.";
                  if (description.includes('\n')) {
                    return description.split('\n').map((line, index) => (
                      <p key={index} style={{ margin: index > 0 ? '0.05em 0 0 0' : '0' }}>
                        {line}
                      </p>
                    ));
                  }
                  return <p>{description}</p>;
                })()}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Наши преимущества */}
      <section className="advantages">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Наши преимущества
          </motion.h2>
          
          <div className="advantages-grid">
            {aboutContent.advantages.map((advantage, index) => (
              <motion.div 
                key={index}
                className="advantage-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="advantage-icon">
                  {typeof advantage.icon === 'string' 
                    ? getIconForEmoji(advantage.icon)
                    : aboutContent.advantages[index]?.icon}
                </div>
                <h3 className="advantage-title">
                  {(() => {
                    const title = advantage.title || advantage;
                    if (title.includes('\n')) {
                      return title.split('\n').map((line, index) => (
                        <span key={index} style={{ display: 'block' }}>
                          {line}
                        </span>
                      ));
                    }
                    return title;
                  })()}
                </h3>
                <p>{advantage.description || ''}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Почему выбирают нас */}
      <section className="features-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Почему выбирают нас
          </motion.h2>
          
          <div className="features-grid">
            {aboutContent.whyChooseUs.map((feature, index) => (
              <motion.div 
                key={index}
                className="feature-item"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="feature-icon">
                  {typeof feature.icon === 'string' 
                    ? getIconForEmoji(feature.icon)
                    : aboutContent.whyChooseUs[index]?.icon}
                </div>
                <div className="feature-content">
                  <h3 className="feature-title">
                    {(() => {
                      const title = feature.title;
                      if (title.includes('\n')) {
                        return title.split('\n').map((line, index) => (
                          <span key={index} style={{ display: 'block' }}>
                            {line}
                          </span>
                        ));
                      }
                      return title;
                    })()}
                  </h3>
                  <p>{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Наша команда */}
      <section className="team-section">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {aboutContent.team?.title || 'Наша команда'}
          </motion.h2>
          
          <div className="team-grid">
            {team.map((member, index) => (
              <motion.div 
                key={index}
                className="team-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="member-photo">
                  {member.photo && member.photo.startsWith('data:image') ? (
                    <img src={member.photo} alt={member.name} className="member-photo-img" />
                  ) : (
                    <span className="member-photo-emoji">{member.photo || "👤"}</span>
                  )}
                </div>
                <h3>{member.name}</h3>
                <p className="member-position">{member.position}</p>
                <p className="member-experience">{member.experience}</p>
                {member.description && (
                  <p className="member-description">{member.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* О нас подробнее */}
      <section className="company-story">
        <div className="container">
          <div className="story-content">
            <motion.div 
              className="story-text"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2>{aboutContent.history?.title || "История компании"}</h2>
              <div className="history-content">
                <p>
                  {aboutContent.history?.content || 
                    "Компания ВездеходЗапчасти была основана в 2013 году группой энтузиастов, увлеченных вездеходной техникой. Начав с небольшого магазина в Москве, мы постепенно расширили свою деятельность и сегодня являемся одним из ведущих поставщиков запчастей для вездеходов в России."
                  }
                </p>
                
                {aboutContent.history?.milestones && aboutContent.history.milestones.items && aboutContent.history.milestones.items.length > 0 && (
                  <div className="milestones">
                    <h3>{aboutContent.history.milestones.title || 'Основные этапы развития:'}</h3>
                    <div className="milestones-list">
                      {aboutContent.history.milestones.items.map((milestone, index) => (
                        <div key={index} className="milestone-item">
                          <div className="milestone-year">{milestone.year}</div>
                          <div className="milestone-content">
                            <h4>{milestone.title}</h4>
                            <p>{milestone.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
            
            <motion.div 
              className="story-image"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="story-placeholder">
                <FaTools />
                <p>Наш склад с запчастями</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Доставка и оплата */}
      <section className="delivery-payment" id="delivery">
        <div className="container">
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Доставка и оплата
          </motion.h2>

          {/* Шаги получения товара */}
          <div className="steps-grid">
            {(aboutContent.deliveryAndPayment?.steps || []).map((step, index) => (
              <motion.div
                key={index}
                className="step-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
              >
                <div className="step-number">{index + 1}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Способы доставки */}
          {aboutContent.deliveryAndPayment?.deliveryMethods && (
            <div className="delivery-methods">
              <h3>Способы доставки</h3>
              <div className="methods-grid advantages-grid">
                {aboutContent.deliveryAndPayment.deliveryMethods.map((method, i) => (
                  <motion.div
                    key={i}
                    className="advantage-card method-card"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="advantage-icon">{getDeliveryIcon(method.title)}</div>
                    <h4>{method.title}</h4>
                    {method.description && (
                      <p className="method-description">{method.description}</p>
                    )}
                    {Array.isArray(method.items) && method.items.length > 0 && (
                      <ul className="method-list">
                        {method.items.map((it, idx) => (
                          <li key={idx}>{it}</li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
              {aboutContent.deliveryAndPayment.deliveryNote && (
                <p className="delivery-note">{aboutContent.deliveryAndPayment.deliveryNote}</p>
              )}
            </div>
          )}

          {/* Оплата */}
          {aboutContent.deliveryAndPayment?.payment && (
            <div className="payment-section">
              <h3>Оплата</h3>
              <div className="payment-cards advantages-grid">
                <div className="advantage-card payment-card">
                  <div className="advantage-icon"><FaMoneyBillWave /></div>
                  <h4>Почему предоплата</h4>
                  <p>{aboutContent.deliveryAndPayment.payment.whyPrepay}</p>
                  {aboutContent.deliveryAndPayment.payment.whyPrepayExtra && (
                    <p>{aboutContent.deliveryAndPayment.payment.whyPrepayExtra}</p>
                  )}
                </div>
                <div className="advantage-card payment-card">
                  <div className="advantage-icon"><FaShieldAlt /></div>
                  <h4>Гарантии честной сделки</h4>
                  <p>{aboutContent.deliveryAndPayment.payment.trust}</p>
                  {aboutContent.deliveryAndPayment.payment.trustExtra && (
                    <p>{aboutContent.deliveryAndPayment.payment.trustExtra}</p>
                  )}
                </div>
                <div className="advantage-card payment-card">
                  <div className="advantage-icon"><FaFileInvoice /></div>
                  <h4>Реквизиты</h4>
                  <p className="requisites-text">{aboutContent.deliveryAndPayment.payment.requisites}</p>
                </div>
              </div>
              <div className="payment-logos" aria-hidden>
                <span className="logo"><FaCcVisa /></span>
                <span className="logo"><FaCcMastercard /></span>
                <span className="logo"><FaUniversity /></span>
                <span className="logo"><FaCreditCard /></span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Контакты */}
      <section className="contacts-section" id="contacts">
        <div className="container">
          <motion.h2 
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Контакты
          </motion.h2>
          
          <div className="contacts-grid">
            {contacts.map((contact, index) => (
              <motion.div 
                key={index}
                className="contact-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="contact-icon">
                  {contact.icon}
                </div>
                <h3>{contact.title}</h3>
                {contact.title === "Адрес" ? (
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      window.open('https://yandex.ru/maps/org/yutors/164193756613/?indoorLevel=1&ll=61.295870%2C55.187646&z=17', '_blank');
                    }}
                    className="contact-info"
                    style={{ cursor: 'pointer' }}
                  >
                    {contact.info}
                  </a>
                ) : contact.link ? (
                  <a href={contact.link} className="contact-info">
                    {contact.info}
                  </a>
                ) : (
                  <p className="contact-info">{contact.info}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}