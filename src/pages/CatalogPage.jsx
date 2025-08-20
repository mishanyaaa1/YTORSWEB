import React from 'react';
import { motion } from 'framer-motion';
import Catalog from '../Catalog';
import Reveal from '../components/Reveal';
import './CatalogPage.css';

function CatalogPage() {
  return (
    <div className="catalog-page">
      <div className="container">
        <Reveal type="up">
          <div className="catalog-header">
            <h1 className="page-title">Каталог запчастей</h1>
            <p className="page-subtitle">Инновационные решения для вашего вездехода</p>
          </div>
        </Reveal>
        
        <Reveal type="up" delay={0.1}>
          <Catalog />
        </Reveal>
      </div>
    </div>
  );
}

export default CatalogPage;
