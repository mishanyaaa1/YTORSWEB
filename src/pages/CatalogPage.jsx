import React from 'react';
import Catalog from '../Catalog';
import './CatalogPage.css';

function CatalogPage() {
  return (
    <div className="container">
      <div className="page-header">
        <h1>Каталог запчастей</h1>
        <p>Найдите всё необходимое для вашего вездехода в одном месте.</p>
      </div>
      <Catalog />
    </div>
  );
}

export default CatalogPage;
