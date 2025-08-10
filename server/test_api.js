/* eslint-disable */
(async () => {
  try {
    const base = 'http://localhost:3001';

    async function call(method, path, body) {
      const res = await fetch(base + path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const text = await res.text();
      let json;
      try { json = JSON.parse(text); } catch { json = text; }
      return { status: res.status, data: json };
    }

    console.log('HEALTH', await call('GET', '/api/health'));

    console.log('CREATE BRAND', await call('POST', '/api/brands', { name: 'BrandFromTest' }));
    console.log('BRANDS', await call('GET', '/api/brands'));

    console.log('CREATE CATEGORY', await call('POST', '/api/categories', { name: 'CatFromTest', subcategories: ['SubA','SubB'] }));
    console.log('CATEGORIES', await call('GET', '/api/categories'));

    console.log('CREATE PROMO', await call('POST', '/api/promotions', { title: 'PromoFromTest', description: 'desc', discount: 7, category: 'CatFromTest', active: true, featured: false, minPurchase: 5000 }));
    console.log('PROMOTIONS', await call('GET', '/api/promotions'));

    console.log('CREATE PRODUCT', await call('POST', '/api/products', {
      title: 'ProdFromTest', price: 12345, category: 'CatFromTest', subcategory: 'SubA', brand: 'BrandFromTest', available: true, quantity: 2, description: 'desc', images: [{ data: '📦', isMain: true }]
    }));
    console.log('PRODUCTS', await call('GET', '/api/products'));

    console.log('DONE');
  } catch (e) {
    console.error('TEST FAILED', e);
    process.exit(1);
  }
})();


