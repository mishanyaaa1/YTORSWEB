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
  FaMoneyBillWave,
  FaRocket,
  FaCog,
  FaLightbulb,
  FaStar
} from 'react-icons/fa';
import { useAdminData } from '../context/AdminDataContext';
import './About.css';
import { getIconForEmoji } from '../utils/iconMap.jsx';
import Reveal from '../components/Reveal';

export default function About() {
  const { aboutContent } = useAdminData();

  // Дефолтные преимущества (если не заданы в админке)
  const defaultAdvantages = [
    {
      icon: <FaRocket />,
      title: "Молниеносная доставка",
      description: "Доставка по всей России в течение 24-48 часов. Экспресс-доставка по Москве и области."
    },
    {
      icon: <FaCog />,
      title: "Премиум качество",
      description: "Конкурентные цены на все товары. Скидки для постоянных клиентов и оптовых покупателей."
    },
    {
      icon: <FaLightbulb />,
      title: "Инновационные решения",
      description: "Более 15000 наименований запчастей для всех типов и марок вездеходов."
    },
    {
      icon: <FaStar />,
      title: "Экспертная поддержка",
      description: "Полная гарантия на все товары и профессиональная поддержка. Обменяем или вернем деньги в случае брака."
    }
  ];

  // Используем данные команды из админки или дефолтные данные
  const team = aboutContent.team && aboutContent.team.length > 0 
    ? aboutContent.team 
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

  // Дефолтные фичи (если не заданы в админке)
  const defaultFeatures = [
    {
      icon: <FaStar />,
      title: "Профессиональная консультация",
      description: "Наши эксперты помогут подобрать именно те запчасти, которые подходят вашему вездеходу."
    },
    {
      icon: <FaShieldAlt />,
      title: "Официальная гарантия",
      description: "На все товары предоставляется официальная гарантия производителя от 6 месяцев до 2 лет."
    },
    {
      icon: <FaTools />,
      title: "Точность подбора",
      description: "Благодаря нашему опыту, мы точно определим нужную деталь по VIN-коду или фотографии."
    }
  ];

  const contactsData = aboutContent.contacts || {};
  const contacts = [
    {
      icon: <FaPhone />,
      title: "Телефон",
      value: contactsData.phone || "+7 (800) 123-45-67",
      link: `tel:${(contactsData.phone || "+7 (800) 123-45-67").replace(/[^+\d]/g, '')}`
    },
    {
      icon: <FaEnvelope />,
      title: "Email",
      value: contactsData.email || "info@vezdehod-zapchasti.ru",
      link: `mailto:${contactsData.email || "info@vezdehod-zapchasti.ru"}`
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Адрес",
      value: contactsData.address || "г. Москва, ул. Примерная, 123",
      link: "#"
    },
    {
      icon: <FaClock />,
      title: "Время работы",
      value: contactsData.workingHours || "Пн-Пт: 9:00-18:00, Сб: 10:00-16:00",
      link: "#"
    }
  ];

  const paymentMethods = [
    { icon: <FaCreditCard />, name: "Банковские карты" },
    { icon: <FaCcVisa />, name: "Visa" },
    { icon: <FaCcMastercard />, name: "Mastercard" },
    { icon: <FaMoneyBillWave />, name: "Наличные" },
    { icon: <FaFileInvoice />, name: "Безналичный расчет" }
  ];

  const deliveryMethods = [
    { icon: <FaTruck />, name: "Курьерская доставка", description: "По Москве и области" },
    { icon: <FaShippingFast />, name: "Экспресс-доставка", description: "В течение 24 часов" },
    { icon: <FaStore />, name: "Самовывоз", description: "Из наших складов" }
  ];

  return (
    <div className="about-page">
      {/* Hero секция */}
      <section className="about-hero">
        <div className="container">
          <Reveal type="up">
            <div className="about-hero-content">
              <h1 className="about-title">
                {aboutContent.hero?.title || "О компании ЮТОРС"}
              </h1>
              <p className="about-subtitle">
                {aboutContent.hero?.description || "Ведущий поставщик качественных запчастей для вездеходов в России. Мы специализируемся на поставке оригинальных и сертифицированных запчастей для всех типов и марок вездеходной техники."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Преимущества */}
      <section className="about-advantages">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Наши преимущества</h2>
          </Reveal>
          <div className="advantages-grid">
            {(aboutContent.advantages || defaultAdvantages).map((advantage, index) => (
              <Reveal key={index} type="up" delay={index * 0.1}>
                <div className="advantage-card">
                  <div className="advantage-icon">
                    {typeof advantage.icon === 'string' ? getIconForEmoji(advantage.icon) : advantage.icon}
                  </div>
                  <h3 className="advantage-title">{advantage.title}</h3>
                  <p className="advantage-description">{advantage.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* О компании */}
      <section className="about-company">
        <div className="container">
          <div className="company-content">
            <Reveal type="left">
              <div className="company-text">
                <h2 className="section-title">О нашей компании</h2>
                <div className="company-description">
                  {aboutContent.about?.content || (
                    <>
                      <p>
                        Компания ЮТОРС была основана в 2010 году и за это время стала одним из ведущих поставщиков запчастей для вездеходов в России. Мы специализируемся на поставке качественных, оригинальных и сертифицированных запчастей для всех типов и марок вездеходной техники.
                      </p>
                      <p>
                        Наша миссия - обеспечить наших клиентов надежными и качественными запчастями, которые помогут поддерживать их технику в отличном состоянии. Мы понимаем, что для работы в сложных условиях нужны только лучшие детали.
                      </p>
                      <p>
                        За годы работы мы накопили огромный опыт и знания в области вездеходной техники. Наша команда состоит из опытных специалистов, которые всегда готовы помочь с выбором запчастей и решением технических вопросов.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </Reveal>
            <Reveal type="right">
              <div className="company-stats">
                <div className="stat-item">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Лет опыта</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">15,000+</div>
                  <div className="stat-label">Наименований</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">10,000+</div>
                  <div className="stat-label">Довольных клиентов</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Поддержка</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Команда */}
      <section className="about-team">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Наша команда</h2>
          </Reveal>
          <div className="team-grid">
            {team.map((member, index) => (
              <Reveal key={index} type="up" delay={index * 0.1}>
                <div className="team-card">
                  <div className="team-photo">
                    {typeof member.photo === 'string' ? getIconForEmoji(member.photo) : member.photo}
                  </div>
                  <h3 className="team-name">{member.name}</h3>
                  <div className="team-position">{member.position}</div>
                  <div className="team-experience">{member.experience}</div>
                  <p className="team-description">{member.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Особенности */}
      <section className="about-features">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Почему выбирают нас</h2>
          </Reveal>
          <div className="features-grid">
            {(aboutContent.features || defaultFeatures).map((feature, index) => (
              <Reveal key={index} type="up" delay={index * 0.1}>
                <div className="feature-card">
                  <div className="feature-icon">
                    {typeof feature.icon === 'string' ? getIconForEmoji(feature.icon) : feature.icon}
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Способы оплаты */}
      <section className="about-payment">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Способы оплаты</h2>
          </Reveal>
          <div className="payment-methods">
            {paymentMethods.map((method, index) => (
              <Reveal key={index} type="up" delay={index * 0.1}>
                <div className="payment-method">
                  <div className="payment-icon">{method.icon}</div>
                  <div className="payment-name">{method.name}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Способы доставки */}
      <section className="about-delivery">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Способы доставки</h2>
          </Reveal>
          <div className="delivery-methods">
            {deliveryMethods.map((method, index) => (
              <Reveal key={index} type="up" delay={index * 0.1}>
                <div className="delivery-method">
                  <div className="delivery-icon">{method.icon}</div>
                  <div className="delivery-info">
                    <h3 className="delivery-name">{method.name}</h3>
                    <p className="delivery-description">{method.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section id="contacts" className="about-contacts">
        <div className="container">
          <Reveal type="up">
            <h2 className="section-title">Контакты</h2>
          </Reveal>
          <div className="contacts-content">
            <Reveal type="left">
              <div className="contacts-info">
                <div className="contacts-grid">
                  {contacts.map((contact, index) => (
                    <div key={index} className="contact-item">
                      <div className="contact-icon">{contact.icon}</div>
                      <div className="contact-details">
                        <h3 className="contact-title">{contact.title}</h3>
                        <a href={contact.link} className="contact-value">
                          {contact.value}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal type="right">
              <div className="contact-form">
                <h3>Напишите нам</h3>
                <p>Оставьте заявку, и мы свяжемся с вами в ближайшее время</p>
                <form className="form">
                  <div className="form-group">
                    <input type="text" placeholder="Ваше имя" className="form-input" />
                  </div>
                  <div className="form-group">
                    <input type="email" placeholder="Email" className="form-input" />
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Сообщение" className="form-textarea" rows="4"></textarea>
                  </div>
                  <button type="submit" className="form-submit">
                    Отправить сообщение
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  );
}