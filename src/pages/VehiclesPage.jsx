import React from 'react';
import { motion } from 'framer-motion';
import Vehicles from '../Vehicles';
import Reveal from '../components/Reveal';
import './VehiclesPage.css';

function VehiclesPage() {
  return (
    <div className="vehicles-page">
      <div className="container">
        <Reveal type="up">
          <div className="vehicles-header">
            <h1>Готовые вездеходы</h1>
            <p>Профессиональные вездеходы для любых задач и условий эксплуатации</p>
          </div>
        </Reveal>
        
        <Reveal type="up" delay={0.1}>
          <Vehicles />
        </Reveal>
      </div>
    </div>
  );
}

export default VehiclesPage;
