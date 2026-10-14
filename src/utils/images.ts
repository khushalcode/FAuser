/**
 * Image helper — maps product/store names to local require()'d images.
 * This avoids using remote URLs — all images are bundled locally.
 */

// Food images
const biryani = require('../../assets/images/food/biryani.jpg');
const pizza = require('../../assets/images/food/pizza.jpg');
const burger = require('../../assets/images/food/burger.jpg');
const dosa = require('../../assets/images/food/dosa.jpg');
const noodles = require('../../assets/images/food/noodles.jpg');
const pasta = require('../../assets/images/food/pasta.jpg');
const cake = require('../../assets/images/food/cake.jpg');
const coffee = require('../../assets/images/food/coffee.jpg');
const icecream = require('../../assets/images/food/icecream.jpg');
const sandwich = require('../../assets/images/food/sandwich.jpg');
const salad = require('../../assets/images/food/salad.jpg');
const curry = require('../../assets/images/food/curry.jpg');
const chole = require('../../assets/images/food/chole.jpg');
const idli = require('../../assets/images/food/idli.jpg');
const sweets = require('../../assets/images/food/sweets.jpg');
const bakery = require('../../assets/images/food/bakery.jpg');

// Store images
const restaurant1 = require('../../assets/images/stores/restaurant1.jpg');
const cafe = require('../../assets/images/stores/cafe.jpg');
const burgerStore = require('../../assets/images/stores/burger.jpg');
const pizzaStore = require('../../assets/images/stores/pizza.jpg');
const grocery = require('../../assets/images/stores/grocery.jpg');

// Category images
const fruits = require('../../assets/images/categories/fruits.jpg');
const vegetables = require('../../assets/images/categories/vegetables.jpg');
const dairy = require('../../assets/images/categories/dairy.jpg');
const snacks = require('../../assets/images/categories/snacks.jpg');
const beverages = require('../../assets/images/categories/beverages.jpg');
const frozen = require('../../assets/images/categories/frozen.jpg');

// User avatar
const avatar = require('../../assets/images/user/avatar.jpg');

// Product name → image mapping
const PRODUCT_IMAGES: Record<string, any> = {
  'Hyderabadi Chicken Biryani': biryani,
  'Veg Biryani': biryani,
  'Paneer Tikka Masala': curry,
  'Chicken Tikka': curry,
  'Butter Chicken': curry,
  'Dal Makhani': curry,
  'Chole Bhature': chole,
  'Margherita Pizza': pizza,
  'Pepperoni Pizza': pizza,
  'Veggie Supreme Pizza': pizza,
  'Classic Veg Burger': burger,
  'Crispy Chicken Burger': burger,
  'Loaded Cheese Burger': burger,
  'Masala Dosa': dosa,
  'Idli Sambar': idli,
  'Medu Vada': idli,
  'Banana Robusta': fruits,
  'Royal Gala Apple': fruits,
  'Green Capsicum': vegetables,
  'Amul Taaza Milk 1L': dairy,
  'Amul Butter 100g': dairy,
  "Lay's India Magic Masala 52g": snacks,
  'Haldiram Bhujia 200g': snacks,
  'Coca-Cola 750ml': beverages,
  'Real Mixed Fruit 1L': beverages,
  'Cornetto Vanilla 110ml': icecream,
  'Magnum Almond 90ml': icecream,
  'Cadbury Dairy Milk Silk 60g': sweets,
  'Ferrero Rocher 16 pcs 200g': sweets,
  'Veg Hakka Noodles': noodles,
  'Creamy Alfredo Pasta': pasta,
  'Veg Sandwich': sandwich,
  'Garden Fresh Salad': salad,
  'Chocolate Truffle Cake': cake,
  'Cappuccino': coffee,
  'Cold Coffee': coffee,
};

// Store ID → image mapping
const STORE_IMAGES: Record<string, any> = {
  'store_1': restaurant1,
  'store_2': grocery,
  'store_3': pizzaStore,
  'store_4': grocery,
  'store_5': burgerStore,
  'store_6': cafe,
};

// Category name → image mapping
const CATEGORY_IMAGES: Record<string, any> = {
  'Biryani': biryani,
  'Pizza': pizza,
  'Burgers': burger,
  'South Indian': dosa,
  'Chinese': noodles,
  'Italian': pasta,
  'Desserts': cake,
  'Beverages': coffee,
  'Ice Creams': icecream,
  'Vegetables & Fruits': fruits,
  'Dairy, Bread & Eggs': dairy,
  'Bakery & Biscuits': bakery,
  'Chips & Namkeen': snacks,
  'Drinks & Juices': beverages,
  'Sweets & Chocolates': sweets,
  'Frozen Foods': frozen,
};

export function getProductImage(name: string): any {
  return PRODUCT_IMAGES[name] || curry;
}

export function getStoreImage(storeId: string): any {
  return STORE_IMAGES[storeId] || restaurant1;
}

export function getCategoryImage(name: string): any {
  return CATEGORY_IMAGES[name] || curry;
}

export function getAvatar(): any {
  return avatar;
}

export { avatar };
