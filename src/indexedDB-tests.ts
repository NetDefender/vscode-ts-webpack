import { openDB, DBSchema } from 'idb';

//document.addEventListener('DOMContentLoaded', async (e: Event) => console.log(await Promise.resolve(1)));

const VERSION: number = 1;

interface ProductsDatabase extends DBSchema {
  //Stores -> cache and products
  cache: {
    key: string;
    value: number;
  };

  products: {
    value: {
      id?: number;
      name: string;
      price: number;
    };
    key: number;
    indexes: { 'ix_price': number };
  };
}

const productsDatabase = await openDB<ProductsDatabase>('products-database', VERSION, {
  upgrade(db) {
    db.createObjectStore('cache');

    const productStore = db.createObjectStore('products', {
      keyPath: 'id',
      autoIncrement: true
    });
    productStore.createIndex('ix_price', 'price');
  },
});


const newKey: string = await productsDatabase.put('cache', 100, 'max-requests');
console.log(newKey);

const newProductId = await productsDatabase.put('products', {
  name: 'Soap',
  price: 100
})

const transaction = productsDatabase.transaction('cache', 'readwrite');
const keyExisting1 = await transaction.store.get('min-timeout')
if(!keyExisting1) {
  const keyAdded1 = await transaction.store.add(500, 'min-timeout');
}

const keyExisting2 = await transaction.store.get('min-timeout')
if(!keyExisting2) {
  const keyAdded2 = await transaction.store.add(600, 'max-timeout');
}
transaction.commit();
