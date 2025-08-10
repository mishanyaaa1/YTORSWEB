import { motion } from 'framer-motion';

export default function HeroVisual() {
  return (
    <motion.div
      className="hero-card-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="hero-card-panel-inner">
        <motion.div
          className="hero-vehicle-card"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="hero-wheel left" />
          <div className="hero-label">ВЕЗДЕХОД</div>
          <div className="hero-wheel right" />
        </motion.div>
      </div>
    </motion.div>
  );
}


