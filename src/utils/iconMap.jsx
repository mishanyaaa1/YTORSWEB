import React from 'react';
import {
  FaTruck,
  FaMoneyBillWave,
  FaWrench,
  FaTools,
  FaCog,
  FaCheckCircle,
  FaStar,
  FaBullseye,
  FaShieldAlt,
  FaBox,
  FaUsers,
  FaHandshake,
  FaBuilding,
  FaGasPump,
  FaSnowflake,
  FaBatteryFull,
  FaLightbulb,
  FaChair,
  FaLink,
  FaOilCan,
  FaChartBar,
  FaChartLine,
  FaLock,
  FaClipboard,
  FaSyncAlt,
  FaCreditCard,
  FaRocket,
  FaMedal,
  FaTrophy
} from 'react-icons/fa';

const emojiToIconMap = {
  '🚚': <FaTruck />, '🚛': <FaTruck />,
  '💰': <FaMoneyBillWave />,
  '🔧': <FaWrench />,
  '🛠️': <FaTools />,
  '⚙️': <FaCog />,
  '✅': <FaCheckCircle />,
  '⭐': <FaStar />, '🌟': <FaStar />,
  '🎯': <FaBullseye />,
  '🛡️': <FaShieldAlt />,
  '📦': <FaBox />,
  '👥': <FaUsers />,
  '🤝': <FaHandshake />,
  '🏢': <FaBuilding />,
  '⛽': <FaGasPump />,
  '❄️': <FaSnowflake />,
  '🔋': <FaBatteryFull />,
  '💡': <FaLightbulb />,
  '🪑': <FaChair />,
  '⛓️': <FaLink />,
  '🛢️': <FaOilCan />,
  '📊': <FaChartBar />, '📈': <FaChartLine />,
  '🔒': <FaLock />,
  '📋': <FaClipboard />,
  '🔄': <FaSyncAlt />,
  '💳': <FaCreditCard />,
  '🚀': <FaRocket />,
  '🥇': <FaMedal />,
  '🏆': <FaTrophy />
};

export function getIconForEmoji(emoji) {
  if (typeof emoji !== 'string') return emoji;
  return emojiToIconMap[emoji] || <FaStar />;
}


