import React from 'react';
import { motion } from 'framer-motion';
import Catalog from '../Catalog';
import './CatalogPage.css';

function CatalogPage() {
  return (
    <div className="catalog-page">
      <div className="container">
        <motion.div 
          className="catalog-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1>B2B каталог компонентов</h1>
          <p>Широкий выбор профессиональных запчастей для вездеходов всех типов</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Catalog />
        </motion.div>
      </div>
    </div>
  );
}

export default CatalogPage;
