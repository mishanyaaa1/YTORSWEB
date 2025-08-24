const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite3');

console.log('🔄 СРОЧНОЕ ВОССТАНОВЛЕНИЕ: Восстанавливаем удаленные изображения...\n');

// Список изображений для восстановления (все кроме no-img.png)
const imagesToRestore = [
  { product_id: 1, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/zl646hlrrcu76bqhlfwgos375vs6exst-transformed.jpeg', is_main: 1 },
  { product_id: 2, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/item_6503-transformed.jpeg', is_main: 1 },
  { product_id: 3, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/m37ig1i7i9vi3vu1pnqlkanvamwb7uzh-transformed.jpeg', is_main: 1 },
  { product_id: 4, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/8ajhq3jg0vt1ebajx14t5fd9xgt0l523-transformed.jpeg', is_main: 1 },
  { product_id: 5, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/l1x7nert3fwg0i9na7aiwq49h4e0gbmg-transformed.jpeg', is_main: 1 },
  { product_id: 6, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/owy8xucosi1bfdiceh84sgtt582u65mf-transformed.jpeg', is_main: 1 },
  { product_id: 7, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/6nvbw0b13pu09r7w3t9n1smlm0l7vspz-transformed.jpeg', is_main: 1 },
  { product_id: 8, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/z0m1uk2qgc88zuxzaietjau88p2y835s-transformed.jpeg', is_main: 1 },
  { product_id: 9, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/p70hs05liqko63lo6groh6yb3m5hzke6-xreei7lf8-transformed.jpeg', is_main: 1 },
  { product_id: 10, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/ja2kp4fbb5lc0xqoaazqswpkryafrh2f_1-transformed.jpeg', is_main: 1 },
  { product_id: 11, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/r3uaqgb2hd5ade1hh871j3p38kjaiwk9-transformed.jpeg', is_main: 1 },
  { product_id: 12, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/msgcrcptfuujgo7xxf8fxnlvfxzcqjpk-nawrn_0lu-transformed.jpeg', is_main: 1 },
  { product_id: 13, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/6k4tl5h7ryruppyrytuvv2j3w0u9llm3-transformed.jpeg', is_main: 1 },
  { product_id: 14, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/qhnc1scm446b7pass8sbqdqdxgz7l2t0-transformed.jpeg', is_main: 1 },
  { product_id: 15, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/dewatermark.ai_1726483236334.jpg', is_main: 1 },
  { product_id: 16, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/c4kaxiwaz2ji0rnhx7lkzfx8hbbgyitc-transformed.jpeg', is_main: 1 },
  { product_id: 17, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/yzpep438ih1penk4v1l74yk9sc5awv6p-transformed.jpeg', is_main: 1 },
  { product_id: 18, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/bn037zj7aoyo269ymhwy2s18shzxxn74-transformed.jpeg', is_main: 1 },
  { product_id: 19, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/svmtvr1edms2hui82kljfxbvcpv3sa21-transformed.jpeg', is_main: 1 },
  { product_id: 20, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/5697sytuuantev8kcl4hreokxnk43z9n-transformed.jpeg', is_main: 1 },
  { product_id: 21, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/9kxt33j3im2znegb1m35yl3qhts0hhkk-transformed.jpeg', is_main: 1 },
  { product_id: 39, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/bolt12304.jpg', is_main: 1 },
  { product_id: 48, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/bolt700-28-2546.jpg', is_main: 1 },
  { product_id: 63, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/boltkreplenijakatka700-28-2527.jpg', is_main: 1 },
  { product_id: 64, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/boltm12-min-scaled.jpg', is_main: 1 },
  { product_id: 67, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/boltm12-min-scaled.jpg', is_main: 1 },
  { product_id: 71, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/boltm16m6g85.58.019-min-scaled.jpg', is_main: 1 },
  { product_id: 84, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/valkardannyj18-14-77-min.jpg', is_main: 1 },
  { product_id: 87, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/valkolenchtyj16-03-112-scaled.jpeg', is_main: 1 },
  { product_id: 99, image_data: 'https://ytors.ru/wp-content/uploads/2023/07/gajka700-30-2327.jpg', is_main: 1 }
];

console.log(`📦 Восстанавливаем ${imagesToRestore.length} изображений товаров...`);

let restored = 0;
let errors = 0;

// Функция для восстановления одного изображения
function restoreImage(imageData) {
  return new Promise((resolve) => {
    db.run(
      'INSERT INTO product_images (product_id, image_data, is_main) VALUES (?, ?, ?)',
      [imageData.product_id, imageData.image_data, imageData.is_main],
      function(err) {
        if (err) {
          console.error(`❌ Ошибка восстановления изображения для товара ${imageData.product_id}:`, err.message);
          errors++;
        } else {
          console.log(`✅ Восстановлено изображение для товара ${imageData.product_id}`);
          restored++;
        }
        resolve();
      }
    );
  });
}

// Восстанавливаем все изображения
async function restoreAllImages() {
  for (const imageData of imagesToRestore) {
    await restoreImage(imageData);
  }
  
  console.log(`\n📋 РЕЗУЛЬТАТ ВОССТАНОВЛЕНИЯ:`);
  console.log(`✅ Восстановлено: ${restored} изображений`);
  console.log(`❌ Ошибок: ${errors}`);
  
  if (errors === 0) {
    console.log('\n🎉 ВСЕ ИЗОБРАЖЕНИЯ УСПЕШНО ВОССТАНОВЛЕНЫ!');
  } else {
    console.log('\n⚠️ Есть ошибки при восстановлении. Проверьте лог выше.');
  }
  
  db.close();
}

restoreAllImages().catch(console.error);
