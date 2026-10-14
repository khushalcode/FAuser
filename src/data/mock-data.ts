/**
 * Mock data layer for the Food Munch Customer app.
 *
 * Returns realistic food + grocery data so the customer preview is fully
 * interactive before real Supabase credentials are wired in. All screens
 * should call functions from `@/lib/api` (which reads from this file when
 * Supabase is not configured), rather than importing mock-data directly.
 *
 * Indian context: ₹ currency, Bangalore addresses, Indian names.
 *
 * NOTE: This file is unified — there is no longer a `module_type` field.
 * Food + Grocery items live side by side. Stores/products carry a loose
 * `store_type` / `group` / `brand`/`is_veg` hint for display purposes only.
 */
import type {
  Store,
  Category,
  Product,
  Order,
  Coupon,
  Banner,
  CustomerAddress,
  WalletTransaction,
  AppNotification,
  DeliveryMan,
  ChatMessage,
  Review,
  AppUser,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  DeliveryArea
} from '@/lib/types';

// ---------- Helpers ----------

const today = new Date();
const iso = (daysAgo: number, hoursAgo = 0) => {
  const d = new Date(today);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  return d.toISOString();
};
const isoInFuture = (hoursAhead: number) => {
  const d = new Date(today);
  d.setHours(d.getHours() + hoursAhead);
  return d.toISOString();
};

// ---------- Stores (6) ----------

export const stores: Store[] = [
  {
    id: 'store_1', name: 'Spice Garden Restaurant', slug: 'spice-garden',
    store_type: 'Restaurant', description: 'Authentic North & South Indian cuisine, freshly prepared with hand-ground spices.',
    address: '12 MG Road, Bangalore', latitude: 12.9716, longitude: 77.5946,
    phone: '+91 80 1234 5678', email: 'orders@spicegarden.com',
    vendor_id: 'vendor_1', is_active: true, is_open: true,
    rating: 4.6, reviews_count: 1240, minimum_order: 200,
    delivery_fee: 30, delivery_time_minutes: 35, created_at: iso(120),
    logo_url: '../assets/images/stores/restaurant1.jpg',
    cover_url: '../assets/images/stores/restaurant1.jpg'
  },
  {
    id: 'store_2', name: 'FreshMart Grocery', slug: 'freshmart',
    store_type: 'Grocery', description: 'Daily groceries, farm-fresh produce and household essentials at best prices.',
    address: '88 Brigade Road, Bangalore', latitude: 12.9698, longitude: 77.6056,
    phone: '+91 80 2345 6789', email: 'hello@freshmart.com',
    vendor_id: 'vendor_2', is_active: true, is_open: true,
    rating: 4.4, reviews_count: 856, minimum_order: 300,
    delivery_fee: 25, delivery_time_minutes: 50, created_at: iso(150),
    logo_url: '../assets/images/stores/grocery.jpg',
    cover_url: '../assets/images/stores/grocery.jpg'
  },
  {
    id: 'store_3', name: 'Pizza Corner', slug: 'pizza-corner',
    store_type: 'Restaurant', description: 'Wood-fired pizzas, cheesy pastas & Italian classics.',
    address: '45 Indiranagar, Bangalore', latitude: 12.9719, longitude: 77.6412,
    phone: '+91 80 3456 7890', email: 'care@pizzacorner.com',
    vendor_id: 'vendor_3', is_active: true, is_open: true,
    rating: 4.5, reviews_count: 980, minimum_order: 250,
    delivery_fee: 35, delivery_time_minutes: 40, created_at: iso(95),
    logo_url: '../assets/images/stores/pizza.jpg',
    cover_url: '../assets/images/stores/pizza.jpg'
  },
  {
    id: 'store_4', name: 'DailyNeeds Supermarket', slug: 'dailyneeds',
    store_type: 'Grocery', description: 'Aisles of household essentials & weekly groceries delivered fast.',
    address: '7 Koramangala, Bangalore', latitude: 12.9352, longitude: 77.6245,
    phone: '+91 80 4567 8901', email: 'support@dailyneeds.com',
    vendor_id: 'vendor_4', is_active: true, is_open: true,
    rating: 4.2, reviews_count: 612, minimum_order: 350,
    delivery_fee: 20, delivery_time_minutes: 60, created_at: iso(180),
    logo_url: '../assets/images/stores/grocery.jpg',
    cover_url: '../assets/images/stores/grocery.jpg'
  },
  {
    id: 'store_5', name: 'Burger Barn', slug: 'burger-barn',
    store_type: 'Restaurant', description: 'Gourmet burgers, loaded fries & thick shakes.',
    address: '22 Jayanagar, Bangalore', latitude: 12.9250, longitude: 77.5938,
    phone: '+91 80 5678 9012', email: 'orders@burgerbarn.com',
    vendor_id: 'vendor_5', is_active: true, is_open: true,
    rating: 4.3, reviews_count: 745, minimum_order: 180,
    delivery_fee: 30, delivery_time_minutes: 30, created_at: iso(70),
    logo_url: '../assets/images/stores/burger.jpg',
    cover_url: '../assets/images/stores/burger.jpg'
  },
  {
    id: 'store_6', name: 'Organic Roots', slug: 'organic-roots',
    store_type: 'Grocery', description: 'Certified organic produce & chemical-free groceries.',
    address: '9 HSR Layout, Bangalore', latitude: 12.9116, longitude: 77.6474,
    phone: '+91 80 6789 0123', email: 'care@organicroots.com',
    vendor_id: 'vendor_6', is_active: true, is_open: true,
    rating: 4.7, reviews_count: 423, minimum_order: 400,
    delivery_fee: 40, delivery_time_minutes: 45, created_at: iso(60),
    logo_url: '../assets/images/stores/grocery.jpg',
    cover_url: '../assets/images/stores/cafe.jpg'
  }
];

// ---------- Delivery areas (pincode serviceability) ----------

export const deliveryAreas: DeliveryArea[] = [
  { id: 'da_1', store_id: 'store_1', pincode: '560001', delivery_fee: 30, estimated_minutes: 35, is_active: true },
  { id: 'da_2', store_id: 'store_1', pincode: '560025', delivery_fee: 35, estimated_minutes: 40, is_active: true },
  { id: 'da_3', store_id: 'store_1', pincode: '560011', delivery_fee: 40, estimated_minutes: 45, is_active: true },
  { id: 'da_4', store_id: 'store_2', pincode: '560001', delivery_fee: 25, estimated_minutes: 50, is_active: true },
  { id: 'da_5', store_id: 'store_2', pincode: '560025', delivery_fee: 30, estimated_minutes: 55, is_active: true },
  { id: 'da_6', store_id: 'store_2', pincode: '560042', delivery_fee: 35, estimated_minutes: 60, is_active: true },
  { id: 'da_7', store_id: 'store_3', pincode: '560001', delivery_fee: 35, estimated_minutes: 40, is_active: true },
  { id: 'da_8', store_id: 'store_3', pincode: '560038', delivery_fee: 40, estimated_minutes: 45, is_active: true },
  { id: 'da_9', store_id: 'store_4', pincode: '560001', delivery_fee: 20, estimated_minutes: 60, is_active: true },
  { id: 'da_10', store_id: 'store_4', pincode: '560095', delivery_fee: 30, estimated_minutes: 75, is_active: true },
  { id: 'da_11', store_id: 'store_5', pincode: '560001', delivery_fee: 30, estimated_minutes: 30, is_active: true },
  { id: 'da_12', store_id: 'store_5', pincode: '560011', delivery_fee: 30, estimated_minutes: 35, is_active: true },
  { id: 'da_13', store_id: 'store_6', pincode: '560001', delivery_fee: 40, estimated_minutes: 45, is_active: true },
  { id: 'da_14', store_id: 'store_6', pincode: '560102', delivery_fee: 45, estimated_minutes: 55, is_active: true }
];

// ---------- Categories (26) ----------
// Food categories (cat_1-8) — restaurant tab.
// Grocery categories (cat_9-26) — Blinkit-style premium grocery grid covering
// the 15 spec categories: Vegetables & Fruits, Atta Rice & Dal, Dairy Bread &
// Eggs, Bakery & Biscuits, Chips & Namkeen, Drinks & Juices, Ice Creams,
// Sweets & Chocolates, Chicken Meat & Fish, Oil Ghee & Masala, Dry Fruits,
// Instant Food, Sauces & Spreads, Tea Coffee, Paan Corner, plus Frozen,
// Personal Care and Household for completeness.

export const categories: Category[] = [
  // Food
  { id: 'cat_1', name: 'Biryani', slug: 'biryani', group: 'food', position: 1, is_active: true, stores_count: 18, items_count: 96 },
  { id: 'cat_2', name: 'Pizza', slug: 'pizza', group: 'food', position: 2, is_active: true, stores_count: 22, items_count: 134 },
  { id: 'cat_3', name: 'Burgers', slug: 'burgers', group: 'food', position: 3, is_active: true, stores_count: 15, items_count: 78 },
  { id: 'cat_4', name: 'North Indian', slug: 'north-indian', group: 'food', position: 4, is_active: true, stores_count: 34, items_count: 245 },
  { id: 'cat_5', name: 'South Indian', slug: 'south-indian', group: 'food', position: 5, is_active: true, stores_count: 28, items_count: 167 },
  { id: 'cat_6', name: 'Chinese', slug: 'chinese', group: 'food', position: 6, is_active: true, stores_count: 19, items_count: 112 },
  { id: 'cat_7', name: 'Desserts', slug: 'desserts', group: 'food', position: 7, is_active: true, stores_count: 14, items_count: 89 },
  { id: 'cat_8', name: 'Beverages', slug: 'beverages', group: 'food', position: 8, is_active: true, stores_count: 11, items_count: 67 },
  // Grocery — spec's 15 + a few extras
  { id: 'cat_9', name: 'Vegetables & Fruits', slug: 'vegetables-fruits', group: 'grocery', position: 9, is_active: true, stores_count: 25, items_count: 312 },
  { id: 'cat_10', name: 'Atta, Rice & Dal', slug: 'atta-rice-dal', group: 'grocery', position: 10, is_active: true, stores_count: 22, items_count: 156 },
  { id: 'cat_11', name: 'Dairy, Bread & Eggs', slug: 'dairy-bread-eggs', group: 'grocery', position: 11, is_active: true, stores_count: 18, items_count: 187 },
  { id: 'cat_12', name: 'Bakery & Biscuits', slug: 'bakery-biscuits', group: 'grocery', position: 12, is_active: true, stores_count: 14, items_count: 142 },
  { id: 'cat_13', name: 'Chips & Namkeen', slug: 'chips-namkeen', group: 'grocery', position: 13, is_active: true, stores_count: 30, items_count: 374 },
  { id: 'cat_14', name: 'Drinks & Juices', slug: 'drinks-juices', group: 'grocery', position: 14, is_active: true, stores_count: 26, items_count: 224 },
  { id: 'cat_15', name: 'Ice Creams', slug: 'ice-creams', group: 'grocery', position: 15, is_active: true, stores_count: 12, items_count: 88 },
  { id: 'cat_16', name: 'Sweets & Chocolates', slug: 'sweets-chocolates', group: 'grocery', position: 16, is_active: true, stores_count: 16, items_count: 156 },
  { id: 'cat_17', name: 'Chicken, Meat & Fish', slug: 'chicken-meat-fish', group: 'grocery', position: 17, is_active: true, stores_count: 9, items_count: 64 },
  { id: 'cat_18', name: 'Oil, Ghee & Masala', slug: 'oil-ghee-masala', group: 'grocery', position: 18, is_active: true, stores_count: 21, items_count: 134 },
  { id: 'cat_19', name: 'Dry Fruits', slug: 'dry-fruits', group: 'grocery', position: 19, is_active: true, stores_count: 11, items_count: 78 },
  { id: 'cat_20', name: 'Instant Food', slug: 'instant-food', group: 'grocery', position: 20, is_active: true, stores_count: 18, items_count: 96 },
  { id: 'cat_21', name: 'Sauces & Spreads', slug: 'sauces-spreads', group: 'grocery', position: 21, is_active: true, stores_count: 14, items_count: 72 },
  { id: 'cat_22', name: 'Tea & Coffee', slug: 'tea-coffee', group: 'grocery', position: 22, is_active: true, stores_count: 19, items_count: 110 },
  { id: 'cat_23', name: 'Paan Corner', slug: 'paan-corner', group: 'grocery', position: 23, is_active: true, stores_count: 4, items_count: 38 },
  { id: 'cat_24', name: 'Frozen Foods', slug: 'frozen-foods', group: 'grocery', position: 24, is_active: true, stores_count: 8, items_count: 64 },
  { id: 'cat_25', name: 'Personal Care', slug: 'personal-care', group: 'grocery', position: 25, is_active: true, stores_count: 16, items_count: 145 },
  { id: 'cat_26', name: 'Household', slug: 'household', group: 'grocery', position: 26, is_active: true, stores_count: 14, items_count: 92 }
];

// ---------- Products (60+) ----------
// Rich Indian food & grocery products with real brands (Lay's, Kurkure, Maggi,
// Amul, Mother Dairy, Britannia, Parle-G, Haldiram, etc.) and realistic
// prices, weights, ratings, veg/non-veg status. Used by the home screen,
// search, product detail and cart flows.

type Seed = Pick<Product, 'name' | 'price' | 'store_id' | 'category_id' | 'unit'> &
  Partial<Product>;

const productSeeds: Seed[] = [
  // Food (12) — prepared meals from restaurants
  { name: 'Chicken Biryani', price: 220, discount_price: 198, store_id: 'store_1', category_id: 'cat_1', is_veg: false, prep_time_minutes: 25, unit: 'plate', is_featured: true, rating: 4.7, reviews_count: 820000, tags: ['bestseller', 'spicy'] },
  { name: 'Veg Biryani', price: 180, store_id: 'store_1', category_id: 'cat_1', is_veg: true, prep_time_minutes: 20, unit: 'plate', rating: 4.5, reviews_count: 210000, tags: ['veg'] },
  { name: 'Mutton Biryani', price: 320, store_id: 'store_1', category_id: 'cat_1', is_veg: false, prep_time_minutes: 30, unit: 'plate', is_featured: true, rating: 4.8, reviews_count: 150000, tags: ['premium'] },
  { name: 'Margherita Pizza', price: 280, discount_price: 245, store_id: 'store_3', category_id: 'cat_2', is_veg: true, prep_time_minutes: 18, unit: 'medium', is_featured: true, rating: 4.6, reviews_count: 280000, tags: ['veg', 'bestseller'] },
  { name: 'Pepperoni Pizza', price: 360, store_id: 'store_3', category_id: 'cat_2', is_veg: false, prep_time_minutes: 18, unit: 'medium', rating: 4.5, reviews_count: 175000, tags: ['non-veg'] },
  { name: 'Cheese Burger', price: 160, store_id: 'store_5', category_id: 'cat_3', is_veg: false, prep_time_minutes: 12, unit: 'pcs', rating: 4.4, reviews_count: 195000, tags: ['non-veg'] },
  { name: 'Veg Burger', price: 130, discount_price: 110, store_id: 'store_5', category_id: 'cat_3', is_veg: true, prep_time_minutes: 10, unit: 'pcs', is_featured: true, rating: 4.3, reviews_count: 142000, tags: ['veg'] },
  { name: 'Paneer Butter Masala', price: 240, store_id: 'store_1', category_id: 'cat_4', is_veg: true, prep_time_minutes: 22, unit: 'bowl', rating: 4.6, reviews_count: 167000, tags: ['veg', 'bestseller'] },
  { name: 'Butter Naan', price: 50, store_id: 'store_1', category_id: 'cat_4', is_veg: true, prep_time_minutes: 8, unit: 'pcs', rating: 4.4, reviews_count: 98000, tags: ['veg'] },
  { name: 'Masala Dosa', price: 110, store_id: 'store_1', category_id: 'cat_5', is_veg: true, prep_time_minutes: 12, unit: 'plate', is_featured: true, rating: 4.7, reviews_count: 230000, tags: ['veg', 'bestseller'] },
  { name: 'Gulab Jamun (4 pcs)', price: 90, discount_price: 75, store_id: 'store_1', category_id: 'cat_7', is_veg: true, prep_time_minutes: 5, unit: 'pack', rating: 4.5, reviews_count: 88000, tags: ['veg', 'dessert'] },
  { name: 'Cold Coffee', price: 120, store_id: 'store_3', category_id: 'cat_8', is_veg: true, prep_time_minutes: 5, unit: 'glass', rating: 4.3, reviews_count: 64000, tags: ['veg', 'beverage'] },

  // ---------- Vegetables & Fruits ----------
  { name: 'Banana (Robusta)', price: 60, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '6 pcs · 800g', is_featured: true, rating: 4.5, reviews_count: 320000, tags: ['fresh', 'bestseller'] },
  { name: 'Tomato Hybrid', price: 40, discount_price: 32, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '1 kg', is_featured: true, rating: 4.3, reviews_count: 180000, tags: ['fresh', 'offer', 'price-drop'] },
  { name: 'Onion', price: 35, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '1 kg', rating: 4.4, reviews_count: 145000, tags: ['fresh', 'bestseller'] },
  { name: 'Apple (Shimla)', price: 180, discount_price: 159, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '1 kg', is_featured: true, rating: 4.6, reviews_count: 210000, tags: ['fresh', 'offer', 'lowest-30'] },
  { name: 'Potato', price: 30, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '1 kg', rating: 4.4, reviews_count: 110000, tags: ['fresh'] },
  { name: 'Carrot (Orange)', price: 45, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '500 g', rating: 4.3, reviews_count: 67000, tags: ['fresh'] },
  { name: 'Green Capsicum', price: 60, discount_price: 48, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '250 g', rating: 4.2, reviews_count: 42000, tags: ['fresh', 'offer'] },
  { name: 'Sweet Lime (Mosambi)', price: 80, store_id: 'store_2', category_id: 'cat_9', brand: 'FreshMart', unit: '6 pcs', is_featured: true, rating: 4.5, reviews_count: 58000, tags: ['fresh', 'bestseller'] },

  // ---------- Atta, Rice & Dal ----------
  { name: 'Aashirvaad Atta 5kg', price: 290, discount_price: 269, store_id: 'store_2', category_id: 'cat_10', brand: 'Aashirvaad', unit: '5 kg pack', is_featured: true, rating: 4.6, reviews_count: 820000, tags: ['staple', 'offer', 'bestseller', 'lowest-30'] },
  { name: 'India Gate Basmati 1kg', price: 145, store_id: 'store_2', category_id: 'cat_10', brand: 'India Gate', unit: '1 kg pack', rating: 4.7, reviews_count: 220000, tags: ['staple', 'bestseller'] },
  { name: 'Tata Toor Dal 1kg', price: 165, discount_price: 145, store_id: 'store_2', category_id: 'cat_10', brand: 'Tata Sampann', unit: '1 kg pack', is_featured: true, rating: 4.5, reviews_count: 124000, tags: ['staple', 'offer'] },
  { name: 'Daawat Brown Rice 1kg', price: 110, store_id: 'store_2', category_id: 'cat_10', brand: 'Daawat', unit: '1 kg pack', rating: 4.4, reviews_count: 62000, tags: ['staple'] },
  { name: 'Pillsbury Chakki Atta 5kg', price: 275, store_id: 'store_2', category_id: 'cat_10', brand: 'Pillsbury', unit: '5 kg pack', rating: 4.5, reviews_count: 95000, tags: ['staple'] },

  // ---------- Dairy, Bread & Eggs ----------
  { name: 'Amul Taaza Milk 1L', price: 64, store_id: 'store_2', category_id: 'cat_11', brand: 'Amul', unit: '1 L pouch', is_featured: true, rating: 4.7, reviews_count: 820000, tags: ['dairy', 'bestseller', 'price-drop'] },
  { name: 'Mother Dairy Curd 400g', price: 35, store_id: 'store_2', category_id: 'cat_11', brand: 'Mother Dairy', unit: '400 g cup', rating: 4.5, reviews_count: 210000, tags: ['dairy', 'bestseller'] },
  { name: 'Britannia Brown Bread 400g', price: 50, discount_price: 45, store_id: 'store_2', category_id: 'cat_11', brand: 'Britannia', unit: '400 g pack', is_featured: true, rating: 4.5, reviews_count: 180000, tags: ['bakery', 'offer'] },
  { name: 'FarmFresh Brown Eggs 6 pcs', price: 75, store_id: 'store_2', category_id: 'cat_11', brand: 'FarmFresh', unit: '6 pcs', rating: 4.5, reviews_count: 95000, tags: ['dairy', 'non-veg'] },
  { name: 'Amul Butter 100g', price: 56, store_id: 'store_2', category_id: 'cat_11', brand: 'Amul', unit: '100 g pack', is_featured: true, rating: 4.8, reviews_count: 510000, tags: ['dairy', 'bestseller'] },
  { name: 'Amul Cheese Slices 200g', price: 135, discount_price: 119, store_id: 'store_2', category_id: 'cat_11', brand: 'Amul', unit: '10 slices · 200 g', rating: 4.6, reviews_count: 142000, tags: ['dairy', 'offer'] },

  // ---------- Bakery & Biscuits ----------
  { name: 'Parle-G Biscuit 250g', price: 25, store_id: 'store_2', category_id: 'cat_12', brand: 'Parle', unit: '250 g pack', is_featured: true, rating: 4.7, reviews_count: 820000, tags: ['bakery', 'bestseller'] },
  { name: 'Britannia Marie Gold 250g', price: 30, store_id: 'store_2', category_id: 'cat_12', brand: 'Britannia', unit: '250 g pack', rating: 4.5, reviews_count: 320000, tags: ['bakery'] },
  { name: 'Oreo Chocolate Cookies 120g', price: 40, discount_price: 35, store_id: 'store_2', category_id: 'cat_12', brand: 'Cadbury', unit: '120 g pack', is_featured: true, rating: 4.5, reviews_count: 180000, tags: ['bakery', 'offer', 'price-drop'] },
  { name: 'Good Day Cashew 120g', price: 35, store_id: 'store_2', category_id: 'cat_12', brand: 'Britannia', unit: '120 g pack', rating: 4.4, reviews_count: 145000, tags: ['bakery'] },
  { name: 'Bourbon Chocolate 150g', price: 45, store_id: 'store_2', category_id: 'cat_12', brand: 'Britannia', unit: '150 g pack', rating: 4.6, reviews_count: 220000, tags: ['bakery', 'bestseller'] },

  // ---------- Chips & Namkeen ----------
  { name: "Lay's India Magic Masala 52g", price: 20, store_id: 'store_2', category_id: 'cat_13', brand: "Lay's", unit: '52 g pack', is_featured: true, rating: 4.5, reviews_count: 820000, tags: ['chips', 'snack', 'bestseller'] },
  { name: 'Kurkure Masala Munch 90g', price: 30, discount_price: 25, store_id: 'store_2', category_id: 'cat_13', brand: 'Kurkure', unit: '90 g pack', is_featured: true, rating: 4.4, reviews_count: 510000, tags: ['namkeen', 'snack', 'offer', 'price-drop'] },
  { name: 'Haldiram Bhujia 200g', price: 55, discount_price: 45, store_id: 'store_2', category_id: 'cat_13', brand: 'Haldiram', unit: '200 g pack', is_featured: true, rating: 4.6, reviews_count: 820000, tags: ['namkeen', 'snack', 'offer'] },
  { name: 'Bingo Mad Angles 60g', price: 20, store_id: 'store_2', category_id: 'cat_13', brand: 'Bingo', unit: '60 g pack', rating: 4.2, reviews_count: 95000, tags: ['chips', 'snack'] },
  { name: 'Too Yumm Multigrain 50g', price: 30, store_id: 'store_2', category_id: 'cat_13', brand: 'Too Yumm', unit: '50 g pack', rating: 4.4, reviews_count: 88000, tags: ['chips', 'snack', 'healthy', 'baked'] },
  { name: 'Balaji Wafers Tomato 65g', price: 20, store_id: 'store_2', category_id: 'cat_13', brand: 'Balaji', unit: '65 g pack', rating: 4.3, reviews_count: 72000, tags: ['chips', 'snack'] },
  { name: 'Act II Popcorn Butter 70g', price: 35, store_id: 'store_2', category_id: 'cat_13', brand: 'Act II', unit: '70 g pack', rating: 4.3, reviews_count: 142000, tags: ['popcorn', 'snack'] },

  // ---------- Drinks & Juices ----------
  { name: 'Coca-Cola 750ml', price: 38, store_id: 'store_2', category_id: 'cat_14', brand: 'Coca-Cola', unit: '750 ml bottle', is_featured: true, rating: 4.5, reviews_count: 510000, tags: ['beverage', 'bestseller'] },
  { name: 'Pepsi 750ml', price: 38, discount_price: 32, store_id: 'store_2', category_id: 'cat_14', brand: 'Pepsi', unit: '750 ml bottle', rating: 4.4, reviews_count: 320000, tags: ['beverage', 'offer'] },
  { name: 'Real Mixed Fruit 1L', price: 110, store_id: 'store_2', category_id: 'cat_14', brand: 'Real', unit: '1 L pack', is_featured: true, rating: 4.4, reviews_count: 145000, tags: ['beverage', 'juice'] },
  { name: 'Tropicana Orange 1L', price: 110, discount_price: 99, store_id: 'store_2', category_id: 'cat_14', brand: 'Tropicana', unit: '1 L pack', rating: 4.5, reviews_count: 220000, tags: ['beverage', 'juice', 'offer', 'lowest-30'] },
  { name: 'Red Bull Energy 250ml', price: 115, store_id: 'store_2', category_id: 'cat_14', brand: 'Red Bull', unit: '250 ml can', rating: 4.3, reviews_count: 88000, tags: ['beverage', 'energy'] },
  { name: 'Paper Boat Aam Panna 200ml', price: 25, store_id: 'store_2', category_id: 'cat_14', brand: 'Paper Boat', unit: '200 ml pack', rating: 4.4, reviews_count: 67000, tags: ['beverage', 'juice'] },
  { name: 'Bisleri Water 1L', price: 20, store_id: 'store_2', category_id: 'cat_14', brand: 'Bisleri', unit: '1 L bottle', rating: 4.5, reviews_count: 410000, tags: ['beverage', 'bestseller'] },

  // ---------- Ice Creams ----------
  { name: 'Cornetto Vanilla 110ml', price: 60, discount_price: 50, store_id: 'store_2', category_id: 'cat_15', brand: 'Kwality Walls', unit: '110 ml cone', is_featured: true, rating: 4.6, reviews_count: 420000, tags: ['cone', 'frozen', 'ice-cream', 'offer', 'bestseller'] },
  { name: 'Magnum Almond 90ml', price: 110, store_id: 'store_2', category_id: 'cat_15', brand: 'Magnum', unit: '90 ml stick', is_featured: true, rating: 4.8, reviews_count: 264000, tags: ['stick', 'frozen', 'ice-cream'] },
  { name: 'Amul Ice Cream Tub 500ml', price: 245, store_id: 'store_2', category_id: 'cat_15', brand: 'Amul', unit: '500 ml tub', rating: 4.7, reviews_count: 188000, tags: ['tub', 'frozen', 'ice-cream', 'bestseller'] },
  { name: 'Kwality Walls Chocobar 60ml', price: 30, discount_price: 25, store_id: 'store_2', category_id: 'cat_15', brand: 'Kwality Walls', unit: '60 ml stick', rating: 4.5, reviews_count: 210000, tags: ['stick', 'frozen', 'ice-cream', 'offer'] },

  // ---------- Sweets & Chocolates ----------
  { name: 'Cadbury Dairy Milk Silk 60g', price: 80, store_id: 'store_2', category_id: 'cat_16', brand: 'Cadbury', unit: '60 g pack', is_featured: true, rating: 4.7, reviews_count: 820000, tags: ['chocolate', 'bestseller', 'newly-launched'] },
  { name: 'Ferrero Rocher 16 pcs 200g', price: 449, discount_price: 399, store_id: 'store_2', category_id: 'cat_16', brand: 'Ferrero', unit: '200 g box', is_featured: true, rating: 4.8, reviews_count: 145000, tags: ['chocolate', 'premium', 'offer'] },
  { name: '5 Star Chocolate 40g', price: 10, store_id: 'store_2', category_id: 'cat_16', brand: 'Cadbury', unit: '40 g pack', rating: 4.5, reviews_count: 320000, tags: ['chocolate'] },
  { name: 'KitKat 4 Finger 37g', price: 25, store_id: 'store_2', category_id: 'cat_16', brand: 'Nestle', unit: '37 g pack', rating: 4.6, reviews_count: 410000, tags: ['chocolate', 'bestseller'] },
  { name: 'Kaju Katli 250g', price: 245, store_id: 'store_1', category_id: 'cat_16', is_veg: true, prep_time_minutes: 5, unit: '250 g box', is_featured: true, rating: 4.7, reviews_count: 88000, tags: ['sweets', 'veg'] },

  // ---------- Chicken, Meat & Fish ----------
  { name: 'Fresh Chicken Breast 500g', price: 165, discount_price: 145, store_id: 'store_2', category_id: 'cat_17', brand: 'Licious', unit: '500 g pack', is_veg: false, is_featured: true, rating: 4.6, reviews_count: 78000, tags: ['non-veg', 'fresh', 'offer'] },
  { name: 'Chicken Sausage 250g', price: 95, store_id: 'store_2', category_id: 'cat_17', brand: 'Venkys', unit: '250 g pack', is_veg: false, rating: 4.3, reviews_count: 42000, tags: ['non-veg', 'frozen'] },
  { name: 'Prawns Medium 250g', price: 215, store_id: 'store_2', category_id: 'cat_17', brand: 'FreshMart', unit: '250 g pack', is_veg: false, is_featured: true, rating: 4.5, reviews_count: 38000, tags: ['non-veg', 'fresh'] },

  // ---------- Oil, Ghee & Masala ----------
  { name: 'Fortune Sunflower Oil 1L', price: 145, discount_price: 129, store_id: 'store_2', category_id: 'cat_18', brand: 'Fortune', unit: '1 L pouch', is_featured: true, rating: 4.5, reviews_count: 320000, tags: ['staple', 'offer', 'bestseller', 'lowest-30'] },
  { name: 'Aashirvaad Desi Ghee 1L', price: 645, store_id: 'store_2', category_id: 'cat_18', brand: 'Aashirvaad', unit: '1 L jar', rating: 4.7, reviews_count: 145000, tags: ['staple', 'bestseller'] },
  { name: 'Tata Salt 1kg', price: 28, store_id: 'store_2', category_id: 'cat_18', brand: 'Tata', unit: '1 kg pack', is_featured: true, rating: 4.6, reviews_count: 510000, tags: ['staple', 'bestseller'] },
  { name: 'Catch Garam Masala 100g', price: 75, discount_price: 65, store_id: 'store_2', category_id: 'cat_18', brand: 'Catch', unit: '100 g pack', rating: 4.4, reviews_count: 88000, tags: ['masala', 'offer'] },
  { name: 'MDH Chana Masala 100g', price: 60, store_id: 'store_2', category_id: 'cat_18', brand: 'MDH', unit: '100 g pack', rating: 4.5, reviews_count: 95000, tags: ['masala'] },

  // ---------- Dry Fruits ----------
  { name: 'California Almonds 200g', price: 245, discount_price: 219, store_id: 'store_2', category_id: 'cat_19', brand: 'Happilo', unit: '200 g pack', is_featured: true, rating: 4.6, reviews_count: 110000, tags: ['dry-fruit', 'offer', 'bestseller'] },
  { name: 'Cashew W240 200g', price: 285, store_id: 'store_2', category_id: 'cat_19', brand: 'Happilo', unit: '200 g pack', rating: 4.5, reviews_count: 78000, tags: ['dry-fruit'] },
  { name: 'Walnuts 200g', price: 215, store_id: 'store_2', category_id: 'cat_19', brand: 'Nutraj', unit: '200 g pack', rating: 4.4, reviews_count: 52000, tags: ['dry-fruit'] },

  // ---------- Instant Food ----------
  { name: 'Maggi 2-Min Masala Noodles 70g', price: 14, store_id: 'store_2', category_id: 'cat_20', brand: 'Maggi', unit: '70 g pack', is_featured: true, rating: 4.7, reviews_count: 820000, tags: ['instant', 'bestseller', 'price-drop'] },
  { name: 'Top Ramen Curry Noodles 70g', price: 14, store_id: 'store_2', category_id: 'cat_20', brand: 'Top Ramen', unit: '70 g pack', rating: 4.4, reviews_count: 220000, tags: ['instant'] },
  { name: 'Yippee Magic Masala 70g', price: 14, discount_price: 12, store_id: 'store_2', category_id: 'cat_20', brand: 'Sunfeast', unit: '70 g pack', rating: 4.3, reviews_count: 145000, tags: ['instant', 'offer'] },
  { name: 'MTR Rava Idli Mix 500g', price: 95, store_id: 'store_2', category_id: 'cat_20', brand: 'MTR', unit: '500 g pack', is_featured: true, rating: 4.5, reviews_count: 88000, tags: ['instant', 'bestseller'] },

  // ---------- Sauces & Spreads ----------
  { name: 'Kissan Mixed Fruit Jam 450g', price: 99, discount_price: 89, store_id: 'store_2', category_id: 'cat_21', brand: 'Kissan', unit: '450 g jar', is_featured: true, rating: 4.4, reviews_count: 145000, tags: ['spread', 'offer'] },
  { name: 'Nutella Hazelnut Spread 200g', price: 199, store_id: 'store_2', category_id: 'cat_21', brand: 'Nutella', unit: '200 g jar', is_featured: true, rating: 4.7, reviews_count: 320000, tags: ['spread', 'bestseller', 'newly-launched'] },
  { name: "Ching's Schezwan Chutney 250g", price: 65, store_id: 'store_2', category_id: 'cat_21', brand: "Ching's", unit: '250 g pack', rating: 4.4, reviews_count: 95000, tags: ['sauce', 'bestseller'] },
  { name: 'Veeba Eggless Mayonnaise 250g', price: 89, discount_price: 75, store_id: 'store_2', category_id: 'cat_21', brand: 'Veeba', unit: '250 g pack', rating: 4.5, reviews_count: 62000, tags: ['sauce', 'offer'] },

  // ---------- Tea & Coffee ----------
  { name: 'Red Label Tea 250g', price: 145, discount_price: 129, store_id: 'store_2', category_id: 'cat_22', brand: 'Red Label', unit: '250 g pack', is_featured: true, rating: 4.6, reviews_count: 410000, tags: ['beverage', 'offer', 'bestseller'] },
  { name: 'Bru Instant Coffee 100g', price: 195, discount_price: 175, store_id: 'store_2', category_id: 'cat_22', brand: 'Bru', unit: '100 g jar', is_featured: true, rating: 4.5, reviews_count: 145000, tags: ['beverage', 'offer'] },
  { name: 'Tata Coffee Premium 50g', price: 75, store_id: 'store_2', category_id: 'cat_22', brand: 'Tata', unit: '50 g pack', rating: 4.4, reviews_count: 67000, tags: ['beverage'] },
  { name: 'Lipton Green Tea 25 bags', price: 130, store_id: 'store_2', category_id: 'cat_22', brand: 'Lipton', unit: '25 bags', rating: 4.4, reviews_count: 88000, tags: ['beverage', 'healthy'] },

  // ---------- Paan Corner ----------
  { name: 'Rajnigandha Pan Masala 100g', price: 165, store_id: 'store_2', category_id: 'cat_23', brand: 'DS Group', unit: '100 g pack', rating: 4.3, reviews_count: 42000, tags: ['paan'] },
  { name: 'Saif Gold Sweet Pan 50g', price: 35, store_id: 'store_2', category_id: 'cat_23', brand: 'Saif', unit: '50 g pack', rating: 4.2, reviews_count: 18000, tags: ['paan'] },

  // ---------- Frozen Foods ----------
  { name: 'McCain Frozen Fries 750g', price: 195, discount_price: 175, store_id: 'store_2', category_id: 'cat_24', brand: 'McCain', unit: '750 g pack', is_featured: true, rating: 4.5, reviews_count: 95000, tags: ['frozen', 'offer', 'bestseller'] },
  { name: 'ITC Master Chef Veg Nuggets 400g', price: 165, store_id: 'store_2', category_id: 'cat_24', brand: 'ITC', unit: '400 g pack', rating: 4.4, reviews_count: 52000, tags: ['frozen'] },

  // ---------- Personal Care ----------
  { name: 'Colgate Toothpaste 200g', price: 105, discount_price: 95, store_id: 'store_2', category_id: 'cat_25', brand: 'Colgate', unit: '200 g pack', rating: 4.5, reviews_count: 220000, tags: ['personal-care', 'offer'] },
  { name: 'Dove Shampoo 340ml', price: 245, store_id: 'store_2', category_id: 'cat_25', brand: 'Dove', unit: '340 ml bottle', is_featured: true, rating: 4.6, reviews_count: 145000, tags: ['personal-care', 'bestseller'] },

  // ---------- Household ----------
  { name: 'Surf Excel Detergent 1kg', price: 175, discount_price: 155, store_id: 'store_2', category_id: 'cat_26', brand: 'Surf Excel', unit: '1 kg pack', is_featured: true, rating: 4.6, reviews_count: 142000, tags: ['household', 'offer'] },
  { name: 'Vim Dishwash Liquid 750ml', price: 165, store_id: 'store_2', category_id: 'cat_26', brand: 'Vim', unit: '750 ml bottle', rating: 4.5, reviews_count: 88000, tags: ['household'] }
];

export const products: Product[] = productSeeds.map((p, i) => {
  const isFood = !p.brand && (p.prep_time_minutes !== undefined);
  // Map category_id → emoji for image placeholder (no remote images to keep app offline-friendly)
  const CAT_EMOJI: Record<string, string> = {
    cat_1: '🍛', cat_2: '🍕', cat_3: '🍔', cat_4: '🌮', cat_5: '🥪',
    cat_6: '🍜', cat_7: '🍲', cat_8: '🥗',
    cat_9: '🥬', cat_10: '🌾', cat_11: '🥛', cat_12: '🍪', cat_13: '🍿',
    cat_14: '🥤', cat_15: '🍨', cat_16: '🍫', cat_17: '🍗', cat_18: '🫗',
    cat_19: '🥜', cat_20: '🍜', cat_21: '🧴', cat_22: '☕', cat_23: '🍃',
    cat_24: '🧊', cat_25: '🧴', cat_26: '🧹',
  };
  // Local image paths — no remote URLs. Images stored in assets/images/
  const PRODUCT_IMAGES: Record<string, string> = {
    // Biryani / North Indian
    'Hyderabadi Chicken Biryani': '../assets/images/food/biryani.jpg',
    'Veg Biryani': '../assets/images/food/biryani.jpg',
    'Paneer Tikka Masala': '../assets/images/food/curry.jpg',
    'Chicken Tikka': '../assets/images/food/curry.jpg',
    'Butter Chicken': '../assets/images/food/curry.jpg',
    'Dal Makhani': '../assets/images/food/curry.jpg',
    'Chole Bhature': '../assets/images/food/chole.jpg',
    // Pizza
    'Margherita Pizza': '../assets/images/food/pizza.jpg',
    'Pepperoni Pizza': '../assets/images/food/pizza.jpg',
    'Veggie Supreme Pizza': '../assets/images/food/pizza.jpg',
    // Burgers
    'Classic Veg Burger': '../assets/images/food/burger.jpg',
    'Crispy Chicken Burger': '../assets/images/food/burger.jpg',
    'Loaded Cheese Burger': '../assets/images/food/burger.jpg',
    // South Indian
    'Masala Dosa': '../assets/images/food/dosa.jpg',
    'Idli Sambar': '../assets/images/food/idli.jpg',
    'Medu Vada': '../assets/images/food/idli.jpg',
    // Grocery - fruits & veg
    'Banana Robusta': '../assets/images/categories/fruits.jpg',
    'Royal Gala Apple': '../assets/images/categories/fruits.jpg',
    'Green Capsicum': '../assets/images/categories/vegetables.jpg',
    // Dairy
    'Amul Taaza Milk 1L': '../assets/images/categories/dairy.jpg',
    'Amul Butter 100g': '../assets/images/categories/dairy.jpg',
    // Snacks
    "Lay's India Magic Masala 52g": '../assets/images/categories/snacks.jpg',
    'Haldiram Bhujia 200g': '../assets/images/categories/snacks.jpg',
    // Beverages
    'Coca-Cola 750ml': '../assets/images/categories/beverages.jpg',
    'Real Mixed Fruit 1L': '../assets/images/categories/beverages.jpg',
    // Ice cream
    'Cornetto Vanilla 110ml': '../assets/images/food/icecream.jpg',
    'Magnum Almond 90ml': '../assets/images/food/icecream.jpg',
    // Chocolates
    'Cadbury Dairy Milk Silk 60g': '../assets/images/food/sweets.jpg',
    'Ferrero Rocher 16 pcs 200g': '../assets/images/food/sweets.jpg',
    // Noodles & Pasta
    'Veg Hakka Noodles': '../assets/images/food/noodles.jpg',
    'Creamy Alfredo Pasta': '../assets/images/food/pasta.jpg',
    // Sandwich & Salad
    'Veg Sandwich': '../assets/images/food/sandwich.jpg',
    'Garden Fresh Salad': '../assets/images/food/salad.jpg',
    // Cake & Coffee
    'Chocolate Truffle Cake': '../assets/images/food/cake.jpg',
    'Cappuccino': '../assets/images/food/coffee.jpg',
    'Cold Coffee': '../assets/images/food/coffee.jpg',
  };
  return {
    id: `prod_${i + 1}`,
    slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: isFood
      ? `Delicious ${p.name}, prepared fresh using premium ingredients and authentic recipes. Served hot.`
      : `${p.brand || 'FreshMart'} ${p.name} — quality you can trust, sourced from verified suppliers. Best before 6 months.`,
    image_url: PRODUCT_IMAGES[p.name] || undefined,
    images: undefined,
    stock: Math.floor(Math.random() * 80) + 20,
    is_available: true,
    is_featured: p.is_featured ?? false,
    rating: p.rating ?? 4.2,
    reviews_count: p.reviews_count ?? 50,
    tags: p.tags ?? [],
    barcode: !isFood ? '890' + Math.floor(1000000000 + Math.random() * 8000000000) : undefined,
    created_at: iso(30),
    ...p
  } as Product;
});

// ---------- Customers (20) ----------

const customerNames = [
  'Aarav Sharma', 'Vivaan Iyer', 'Aditya Nair', 'Vihaan Reddy', 'Arjun Gupta',
  'Sai Krishnan', 'Reyansh Patel', 'Ayaan Khan', 'Krishna Das', 'Ishaan Mehta',
  'Ananya Rao', 'Diya Pillai', 'Saanvi Joshi', 'Aadhya Menon', 'Kiara Bose',
  'Myra Agarwal', 'Anika Verma', 'Navya Singh', 'Ira Kapoor', 'Riya Malhotra'
];

export const customers: AppUser[] = customerNames.map((name, i) => ({
  id: `cust_${i + 1}`,
  firebase_uid: 'mock-' + (1000 + i),
  email: name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com',
  phone: '+91 9' + (800000000 + i * 11111),
  full_name: name,
  role: 'customer',
  is_active: true,
  created_at: iso(90 - i)
}));

// The "logged-in" mock customer
export const mockCurrentCustomer: AppUser = {
  id: 'cust_1',
  firebase_uid: 'mock-customer-001',
  email: 'aarav.sharma@gmail.com',
  phone: '+91 9800000000',
  full_name: 'Aarav Sharma',
  role: 'customer',
  avatar_url: undefined,
  is_active: true,
  created_at: iso(120)
};

// ---------- Delivery Men (10) ----------

const deliveryNames = [
  'Rajesh Kumar', 'Sunil Yadav', 'Manoj Singh', 'Vijay Reddy', 'Imran Khan',
  'Praveen Nair', 'Anil Verma', 'Suresh Patel', 'Ramesh Iyer', 'Karthik Raja'
];

export const deliveryMen: DeliveryMan[] = deliveryNames.map((name, i) => ({
  id: `dm_${i + 1}`,
  firebase_uid: 'mock-dm-' + (2000 + i),
  full_name: name,
  email: name.toLowerCase().replace(/\s+/g, '.') + '@foodmunch.in',
  phone: '+91 9' + (700000000 + i * 11111),
  vehicle_type: i % 3 === 0 ? 'bike' : i % 3 === 1 ? 'scooter' : 'cycle',
  is_online: i % 4 !== 0,
  is_active: true,
  rating: 4 + (i % 10) / 10,
  total_deliveries: 500 + i * 80,
  current_order_id: null,
  latitude: 12.97 + (i * 0.005),
  longitude: 77.59 + (i * 0.005),
  created_at: iso(200 - i)
}));

// ---------- Addresses ----------

export const addresses: CustomerAddress[] = [
  {
    id: 'addr_1', customer_id: 'cust_1', label: 'Home', full_name: 'Aarav Sharma',
    phone: '+91 9800000000', line1: 'Flat 402, Prestige Towers', line2: 'MG Road',
    city: 'Bangalore', state: 'Karnataka', pincode: '560001',
    latitude: 12.9756, longitude: 77.6050, is_default: true
  },
  {
    id: 'addr_2', customer_id: 'cust_1', label: 'Work', full_name: 'Aarav Sharma',
    phone: '+91 9800000000', line1: 'WeWork, Galaxy Towers', line2: 'Residency Road',
    city: 'Bangalore', state: 'Karnataka', pincode: '560025',
    latitude: 12.9634, longitude: 77.5980, is_default: false
  },
  {
    id: 'addr_3', customer_id: 'cust_1', label: 'Other', full_name: 'Aarav Sharma',
    phone: '+91 9800000000', line1: '12B, Jayanagar 4th Block', line2: 'Near Bus Stand',
    city: 'Bangalore', state: 'Karnataka', pincode: '560011',
    latitude: 12.9250, longitude: 77.5938, is_default: false
  }
];

// ---------- Coupons ----------

export const coupons: Coupon[] = [
  {
    id: 'cup_1', code: 'FRESH50', title: '₹50 off on orders above ₹299',
    description: 'Get flat ₹50 off on your food or grocery order. Valid for all users.',
    discount_type: 'fixed', discount_value: 50,
    minimum_order: 299, maximum_discount: 50, usage_limit: 1000, used_count: 234,
    start_date: iso(7), end_date: isoInFuture(24 * 14), is_active: true
  },
  {
    id: 'cup_2', code: 'WELCOME20', title: '20% off up to ₹100 (First Order)',
    description: 'New user offer — 20% off on your first Food Munch order, max ₹100.',
    discount_type: 'percentage', discount_value: 20,
    minimum_order: 199, maximum_discount: 100, usage_limit: 500, used_count: 89,
    start_date: iso(14), end_date: isoInFuture(24 * 30), is_active: true
  },
  {
    id: 'cup_3', code: 'SAVE15', title: '15% off on orders above ₹499',
    description: 'Save 15% on grocery & food orders above ₹499. Max discount ₹150.',
    discount_type: 'percentage', discount_value: 15,
    minimum_order: 499, maximum_discount: 150, usage_limit: 800, used_count: 412,
    start_date: iso(5), end_date: isoInFuture(24 * 10), is_active: true
  },
  {
    id: 'cup_4', code: 'FOODIE100', title: '₹100 off on orders above ₹399',
    description: 'Treat yourself — ₹100 off on food orders above ₹399.',
    discount_type: 'fixed', discount_value: 100,
    minimum_order: 399, maximum_discount: 100, usage_limit: 600, used_count: 178,
    start_date: iso(3), end_date: isoInFuture(24 * 7), is_active: true
  },
  {
    id: 'cup_5', code: 'FREESHIP', title: 'Free delivery on orders above ₹249',
    description: 'Get delivery fee waived on orders above ₹249. Flat ₹40 discount on delivery.',
    discount_type: 'fixed', discount_value: 40,
    minimum_order: 249, maximum_discount: 40, usage_limit: 2000, used_count: 567,
    start_date: iso(10), end_date: isoInFuture(24 * 21), is_active: true
  }
];

// ---------- Banners ----------

export const banners: Banner[] = [
  {
    id: 'ban_1', title: 'Fresh Groceries', subtitle: 'Up to 30% off on fruits & veggies',
    cta_text: 'Order Now',
    gradient: ['#12B76A', '#039855'], redirect_type: 'category', redirect_id: 'cat_9',
    position: 1, is_active: true
  },
  {
    id: 'ban_2', title: 'Friday Food Feast', subtitle: 'Flat ₹100 off on orders ₹399+',
    cta_text: 'Grab Offer',
    gradient: ['#F59E0B', '#D97706'], redirect_type: 'category', redirect_id: 'cat_1',
    position: 2, is_active: true
  },
  {
    id: 'ban_3', title: 'Welcome to Food Munch', subtitle: '20% off your first order. Use WELCOME20',
    cta_text: 'Explore',
    gradient: ['#3B82F6', '#1D4ED8'], redirect_type: 'none', position: 3, is_active: true
  },
  {
    id: 'ban_4', title: 'Daily Essentials', subtitle: 'Free delivery on orders above ₹249',
    cta_text: 'Shop Now',
    gradient: ['#8B5CF6', '#6D28D9'], redirect_type: 'none', position: 4, is_active: true
  }
];

// ---------- Orders (80) ----------

const orderStatuses: OrderStatus[] = [
  'pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way',
  'delivered', 'delivered', 'delivered', 'cancelled'
];
const paymentMethods: PaymentMethod[] = ['cash', 'card', 'wallet', 'online'];
const paymentStatuses: PaymentStatus[] = ['paid', 'paid', 'paid', 'pending', 'failed'];

function makeItems(storeId: string, storeName: string, count: number): OrderItem[] {
  const pool = products.filter((p) => p.store_id === storeId);
  const chosen: OrderItem[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const p = pool[i];
    const effPrice = p.discount_price && p.discount_price < p.price ? p.discount_price : p.price;
    chosen.push({
      product_id: p.id,
      name: p.name,
      image_url: p.image_url,
      unit: p.unit,
      price: effPrice,
      quantity: Math.floor(Math.random() * 2) + 1,
      store_id: p.store_id,
      store_name: storeName
    });
  }
  return chosen;
}

export const orders: Order[] = Array.from({ length: 80 }, (_, i) => {
  const customer = customers[i % customers.length];
  const store = stores[i % stores.length];
  const itemCount = (i % 4) + 1;
  const items = makeItems(store.id, store.name, itemCount);
  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const deliveryFee = store.delivery_fee;
  const discount = i % 4 === 0 ? 50 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee - discount + tax;
  const status = orderStatuses[i % orderStatuses.length];
  const dm = deliveryMen[i % deliveryMen.length];
  const isDelivered = status === 'delivered';
  const isPicked = ['picked_up', 'on_the_way', 'delivered'].includes(status);
  const isAccepted = !['pending', 'cancelled', 'rejected'].includes(status);
  const created = iso(Math.floor(i / 4) + 1, (i % 24));
  return {
    id: `order_${i + 1}`,
    order_code: 'FM' + (10240 + i),
    customer_id: customer.id,
    customer_name: customer.full_name,
    customer_phone: customer.phone || '+91 9800000000',
    store_id: store.id,
    store_name: store.name,
    vendor_id: store.vendor_id,
    delivery_man_id: isPicked ? dm.id : null,
    delivery_man_name: isPicked ? dm.full_name : undefined,
    items,
    item_count: items.reduce((s, it) => s + it.quantity, 0),
    subtotal,
    delivery_fee: deliveryFee,
    discount,
    tax,
    total,
    payment_method: paymentMethods[i % paymentMethods.length],
    payment_status: status === 'cancelled' ? 'refunded' : paymentStatuses[i % paymentStatuses.length],
    status,
    delivery_address: 'Flat 402, Prestige Towers, MG Road, Bangalore - 560001',
    delivery_latitude: 12.9756,
    delivery_longitude: 77.6050,
    note: i % 5 === 0 ? 'Please ring the bell on arrival' : undefined,
    scheduled_at: null,
    accepted_at: isAccepted ? iso(Math.floor(i / 4), (i % 24) - 1) : null,
    picked_up_at: isPicked ? iso(Math.floor(i / 4), (i % 24) - 2) : null,
    delivered_at: isDelivered ? iso(Math.floor(i / 4), (i % 24) - 3) : null,
    rating: isDelivered ? 4 + (i % 2) : undefined,
    created_at: created
  };
});

// ---------- Wallet ----------

export let walletBalance = 1245;

export const walletTransactions: WalletTransaction[] = [
  { id: 'wt_1', customer_id: 'cust_1', type: 'credit', amount: 500, description: 'Wallet top-up via UPI', reference: 'UPI:8841234567', created_at: iso(2, 4) },
  { id: 'wt_2', customer_id: 'cust_1', type: 'debit', amount: 320, description: 'Paid for order #FM10278', reference: 'order_15', created_at: iso(3, 8) },
  { id: 'wt_3', customer_id: 'cust_1', type: 'credit', amount: 100, description: 'Cashback from order #FM10277', reference: 'cashback', created_at: iso(4, 2) },
  { id: 'wt_4', customer_id: 'cust_1', type: 'debit', amount: 245, description: 'Paid for order #FM10276', reference: 'order_14', created_at: iso(5, 6) },
  { id: 'wt_5', customer_id: 'cust_1', type: 'credit', amount: 200, description: 'Referral bonus — Friend joined', reference: 'referral', created_at: iso(7, 1) },
  { id: 'wt_6', customer_id: 'cust_1', type: 'debit', amount: 410, description: 'Paid for order #FM10272', reference: 'order_10', created_at: iso(8, 5) },
  { id: 'wt_7', customer_id: 'cust_1', type: 'credit', amount: 50, description: 'Wallet top-up via Card', reference: 'CARD:****1234', created_at: iso(10, 3) },
  { id: 'wt_8', customer_id: 'cust_1', type: 'debit', amount: 180, description: 'Paid for order #FM10269', reference: 'order_7', created_at: iso(12, 7) },
  { id: 'wt_9', customer_id: 'cust_1', type: 'credit', amount: 25, description: 'Cashback from order #FM10269', reference: 'cashback', created_at: iso(12, 6) },
  { id: 'wt_10', customer_id: 'cust_1', type: 'debit', amount: 75, description: 'Donation to Feeding India', reference: 'donation', created_at: iso(14, 2) }
];

// ---------- Loyalty ----------

export const loyaltyPoints = 845;
export const loyaltyTier = 'Gold';
export const loyaltyProgress = 0.62; // 62% to next tier

// ---------- Notifications ----------

export const notifications: AppNotification[] = [
  { id: 'n_1', user_role: 'customer', user_id: 'cust_1', title: 'Order Delivered', body: 'Your order #FM10278 has been delivered. Rate your experience!', type: 'order', data: { order_id: 'order_15' }, is_read: false, created_at: iso(0, 2) },
  { id: 'n_2', user_role: 'customer', user_id: 'cust_1', title: 'Out for Delivery', body: 'Rajesh Kumar is on the way with your order #FM10278.', type: 'order', data: { order_id: 'order_15' }, is_read: false, created_at: iso(0, 3) },
  { id: 'n_3', user_role: 'customer', user_id: 'cust_1', title: 'Friday Food Feast', body: 'Flat ₹100 off on orders above ₹399. Use code FOODIE100.', type: 'promo', is_read: false, created_at: iso(1, 1) },
  { id: 'n_4', user_role: 'customer', user_id: 'cust_1', title: 'Order Accepted', body: 'Spice Garden Restaurant accepted your order #FM10278.', type: 'order', data: { order_id: 'order_15' }, is_read: true, created_at: iso(1, 4) },
  { id: 'n_5', user_role: 'customer', user_id: 'cust_1', title: 'Cashback Credited', body: '₹100 cashback from order #FM10277 has been credited to your wallet.', type: 'system', is_read: true, created_at: iso(2, 5) },
  { id: 'n_6', user_role: 'customer', user_id: 'cust_1', title: 'Weekend Offer', body: '15% off on orders above ₹499. Use code SAVE15.', type: 'promo', is_read: true, created_at: iso(3, 2) },
  { id: 'n_7', user_role: 'customer', user_id: 'cust_1', title: 'Support Reply', body: 'Food Munch Support: Hi Aarav, regarding your query about order #FM10269...', type: 'chat', is_read: true, created_at: iso(4, 1) },
  { id: 'n_8', user_role: 'customer', user_id: 'cust_1', title: 'Welcome to Food Munch', body: 'Get 20% off your first order with code WELCOME20. Happy shopping!', type: 'promo', is_read: true, created_at: iso(7, 0) }
];

// ---------- Chat ----------

export const supportChat: ChatMessage[] = [
  { id: 'm_1', thread_id: 'support', sender: 'them', text: 'Hi Aarav! Welcome to Food Munch support. How can I help you today?', created_at: iso(0, 2) },
  { id: 'm_2', thread_id: 'support', sender: 'me', text: 'Hi, I have a question about my order #FM10278. It says delivered but I have not received it.', created_at: iso(0, 1) },
  { id: 'm_3', thread_id: 'support', sender: 'them', text: 'Let me check that for you right away. One moment please.', created_at: iso(0, 1) },
  { id: 'm_4', thread_id: 'support', sender: 'them', text: 'I see your order was marked delivered at 7:42 PM. Can you confirm your delivery address?', created_at: iso(0, 1) },
  { id: 'm_5', thread_id: 'support', sender: 'me', text: 'Flat 402, Prestige Towers, MG Road.', created_at: iso(0, 0) },
  { id: 'm_6', thread_id: 'support', sender: 'them', text: 'Got it. I have contacted the delivery executive Rajesh. He will reach out in 5 minutes. Sorry for the inconvenience!', created_at: iso(0, 0) }
];

// ---------- Reviews ----------

export const reviews: Review[] = [
  { id: 'r_1', product_id: 'prod_1', customer_name: 'Sneha P.', rating: 5, comment: 'Best biryani in Bangalore! Will order again.', created_at: iso(2) },
  { id: 'r_2', product_id: 'prod_1', customer_name: 'Karthik R.', rating: 4, comment: 'Good taste, generous portion. Delivery was a bit late.', created_at: iso(5) },
  { id: 'r_3', product_id: 'prod_1', customer_name: 'Priya M.', rating: 5, comment: 'Authentic Hyderabadi flavor. Highly recommend.', created_at: iso(8) },
  { id: 'r_4', product_id: 'prod_4', customer_name: 'Rohit S.', rating: 5, comment: 'Cheesy and fresh. Loved the crust.', created_at: iso(1) },
  { id: 'r_5', product_id: 'prod_4', customer_name: 'Anu K.', rating: 4, comment: 'Tasty, but could use more toppings.', created_at: iso(3) },
  { id: 'r_6', product_id: 'prod_13', customer_name: 'Deepa V.', rating: 5, comment: 'Fresh and sweet bananas. Will reorder weekly.', created_at: iso(2) },
  { id: 'r_7', product_id: 'prod_17', customer_name: 'Manish J.', rating: 5, comment: 'Soft, fresh atta. Rotis came out perfect.', created_at: iso(4) }
];

// ---------- Trending & recent searches ----------

export const trendingSearches = [
  'Chicken Biryani', 'Margherita Pizza', 'Banana', 'Amul Milk', 'Onion',
  'Aashirvaad Atta', 'Cold Coffee', 'Tomato', 'Eggs'
];

export const recentSearches = [
  'Biryani', 'Milk', 'Apple', 'Burger'
];

// ---------- Blinkit-style Bestsellers tiles (3x2 grid) ----------
// Each tile represents a category with a 2-image collage + "+N more" badge.

export interface BestsellerTile {
  id: string;
  categoryId: string;
  title: string;
  /** 2 image URLs used for the overlapping collage. When product image_url
   * is undefined (mock mode), we fall back to emoji + colour blocks. */
  images: (string | undefined)[];
  /** Two emoji used when no image URLs are present. */
  emojis: [string, string];
  /** Background tint behind the collage. */
  tint: string;
  /** Number shown in "+N more" badge. */
  moreCount: number;
}

export const bestsellerTiles: BestsellerTile[] = [
  { id: 'bs_1', categoryId: 'cat_13', title: 'Chips & Namkeen', images: [undefined, undefined], emojis: ['🍿', '🥨'], tint: '#FFF7E6', moreCount: 374 },
  { id: 'bs_2', categoryId: 'cat_9', title: 'Fruits & Veggies', images: [undefined, undefined], emojis: ['🍌', '🥕'], tint: '#ECFDF3', moreCount: 312 },
  { id: 'bs_3', categoryId: 'cat_11', title: 'Dairy & Eggs', images: [undefined, undefined], emojis: ['🥛', '🥚'], tint: '#EFF6FF', moreCount: 187 },
  { id: 'bs_4', categoryId: 'cat_10', title: 'Atta, Rice & Dal', images: [undefined, undefined], emojis: ['🌾', '🍚'], tint: '#FEF3C7', moreCount: 156 },
  { id: 'bs_5', categoryId: 'cat_14', title: 'Cold Drinks', images: [undefined, undefined], emojis: ['🥤', '🧃'], tint: '#FEE4E2', moreCount: 224 },
  { id: 'bs_6', categoryId: 'cat_15', title: 'Ice Creams', images: [undefined, undefined], emojis: ['🧊', '🍦'], tint: '#E0E7FF', moreCount: 88 }
];

// ---------- Festival tile (themed banner with 4 sub-tiles) ----------

export interface FestivalSubTile {
  id: string;
  label: string;
  emoji: string;
  /** Optional tag/slug used to navigate to a filtered product list. */
  tag?: string;
}

export interface FestivalTileData {
  id: string;
  title: string;
  subtitle: string;
  /** Background gradient stops for the festive banner. */
  gradient: [string, string];
  /** Emoji shown alongside the title. */
  heroEmoji: string;
  subTiles: FestivalSubTile[];
}

export const festivalTiles: FestivalTileData[] = [
  {
    id: 'ft_1',
    title: 'Navratri Specials',
    subtitle: 'Fasting essentials, pooja needs & festive sweets',
    gradient: ['#F59E0B', '#EA580C'],
    heroEmoji: '🪔',
    subTiles: [
      { id: 'fs_1', label: 'Flowers & Pooja Needs', emoji: '🌺', tag: 'pooja' },
      { id: 'fs_2', label: 'Fasting Essentials', emoji: '🥜', tag: 'fasting' },
      { id: 'fs_3', label: 'Dandiya Ready', emoji: '🪕', tag: 'dandiya' },
      { id: 'fs_4', label: 'Kids Mela', emoji: '🎡', tag: 'kids' }
    ]
  },
  {
    id: 'ft_2',
    title: 'Durga Pujo Bazar',
    subtitle: 'Sweets, sarees, dhak beats & everything pandit-ready',
    gradient: ['#DC2626', '#7F1D1D'],
    heroEmoji: '🎯',
    subTiles: [
      { id: 'fs_5', label: 'Sondesh & Sweets', emoji: '🍮', tag: 'sweets' },
      { id: 'fs_6', label: 'Pooja Thali', emoji: '🪔', tag: 'thali' },
      { id: 'fs_7', label: 'Flowers & Garlands', emoji: '🌼', tag: 'flowers' },
      { id: 'fs_8', label: 'Dhak & Decor', emoji: '🥁', tag: 'decor' }
    ]
  }
];

// ---------- Promo banners (Blinkit-style mid-page promos) ----------

export interface PromoBannerData {
  id: string;
  title: string;
  subtitle: string;
  ctaText: string;
  /** Background gradient stops. */
  gradient: [string, string];
  /** Big illustrative emoji. */
  heroEmoji: string;
  /** Optional tag used to navigate to a filtered product list. */
  tag?: string;
  /** Optional "Brand in Focus" brand label. */
  brand?: string;
}

export const promoBanners: PromoBannerData[] = [
  {
    id: 'pb_1',
    title: 'Stock up on snack time!',
    subtitle: 'Chips, namkeen & popcorn starting at ₹20',
    ctaText: 'Shop now',
    gradient: ['#12B76A', '#027A48'],
    heroEmoji: '🍿',
    tag: 'snacks'
  },
  {
    id: 'pb_2',
    title: 'More crunch in every scoop',
    subtitle: 'Kellogg\'s corn flakes — buy 2 get 1 free',
    ctaText: 'Grab deal',
    gradient: ['#3B82F6', '#1D4ED8'],
    heroEmoji: '🥣',
    brand: 'Kellogg\'s',
    tag: 'breakfast'
  },
  {
    id: 'pb_3',
    title: 'Cool off with frozen desserts',
    subtitle: 'Ice creams, kulfis & frozen yoghurt — delivered in 8 mins',
    ctaText: 'Chill out',
    gradient: ['#8B5CF6', '#6D28D9'],
    heroEmoji: '🍨',
    tag: 'frozen'
  }
];

// ---------- Per-tab hero banners ----------

export interface HeroBannerData {
  id: string;
  tab: string; // 'all' | 'restaurants' | 'grocery' | 'sweets' | 'bakery'
  title: string;
  subtitle: string;
  ctaText: string;
  /** Background gradient stops. */
  gradient: [string, string];
  heroEmoji: string;
}

export const heroBanners: HeroBannerData[] = [
  {
    id: 'hb_all_1', tab: 'all', title: 'Get anything, delivered in 8 mins',
    subtitle: 'Groceries, food & daily essentials — at your door',
    ctaText: 'Order now', gradient: ['#12B76A', '#027A48'], heroEmoji: '🛵'
  },
  {
    id: 'hb_rest_1', tab: 'restaurants', title: 'Hot meals, faster than ever',
    subtitle: 'Biryani, pizza, dosa — delivered sizzling',
    ctaText: 'Order now', gradient: ['#F59E0B', '#B45309'], heroEmoji: '🍛'
  },
  {
    id: 'hb_groc_1', tab: 'grocery', title: 'Fresh grocery, in a flash',
    subtitle: 'Fruits, veggies, dairy — picked & packed in minutes',
    ctaText: 'Shop fresh', gradient: ['#12B76A', '#05603A'], heroEmoji: '🥬'
  },
  {
    id: 'hb_sweet_1', tab: 'sweets', title: 'Sweeten the deal',
    subtitle: 'Mithai, chocolates & dessert — fresh from local halwais',
    ctaText: 'Order sweets', gradient: ['#EC4899', '#BE185D'], heroEmoji: '🍮'
  },
  {
    id: 'hb_bake_1', tab: 'bakery', title: 'Baked fresh, delivered warm',
    subtitle: 'Bread, buns, cakes & pastries from local bakeries',
    ctaText: 'Order bakery', gradient: ['#8B5CF6', '#5B21B6'], heroEmoji: '🥐'
  }
];

// ---------- Product carousel rows (Blinkit-style with filter chips) ----------

export interface CarouselRowData {
  id: string;
  title: string;
  subtitle?: string;
  /** Tag used to filter products. */
  tag: string;
  /** Chips for in-row filter (first chip is always 'All'). */
  chips: string[];
  /** Optional emoji for the section. */
  emoji?: string;
}

export const carouselRows: CarouselRowData[] = [
  {
    id: 'cr_1', title: 'Cool off with frozen desserts',
    subtitle: 'Ice creams, kulfis & frozen yoghurt — delivered cold',
    tag: 'frozen', chips: ['All', 'Cones', 'Cakes', 'Sticks', 'Tubs'], emoji: '🍦'
  },
  {
    id: 'cr_2', title: 'Because you bought ice cream cup',
    subtitle: 'Pairs well with these treats',
    tag: 'dessert', chips: ['All', 'Cones', 'Cakes', 'Sticks'], emoji: '🍨'
  },
  {
    id: 'cr_3', title: 'Stock up on crunchy snacks',
    subtitle: 'Chips, namkeen & popcorn — bestsellers in your area',
    tag: 'snack', chips: ['All', 'Chips', 'Namkeen', 'Popcorn', 'Healthy'], emoji: '🍿'
  }
];

// ---------- Filter chip to product-tag mapping (for carousel rows) ----------

export const chipToTagMap: Record<string, string[]> = {
  'All': [],
  'Cones': ['cone', 'ice-cream', 'frozen'],
  'Cakes': ['cake', 'pastry', 'bakery'],
  'Sticks': ['stick', 'kulfi'],
  'Tubs': ['tub', 'ice-cream'],
  'Chips': ['chips', 'snack'],
  'Namkeen': ['namkeen', 'bhujia'],
  'Popcorn': ['popcorn'],
  'Healthy': ['healthy', 'roasted', 'baked']
};

// ---------- Festival-themed mock products (so festival tiles have items) ----------
// We extend the productSeeds array at runtime by appending a few festival items.

export const festivalProductSeeds: Array<Pick<Product, 'name' | 'price' | 'store_id' | 'category_id' | 'unit'> & Partial<Product>> = [
  { name: 'Marigold Garlands (2 pcs)', price: 80, store_id: 'store_2', category_id: 'cat_9', brand: 'LocalFlorist', unit: '2 garlands', tags: ['pooja', 'flowers'], is_veg: true, rating: 4.5, reviews_count: 142000 },
  { name: 'Sabudana 500g', price: 65, store_id: 'store_2', category_id: 'cat_10', brand: 'Tata', unit: '500 g pack', tags: ['fasting', 'navratri'], is_veg: true, rating: 4.6, reviews_count: 318000 },
  { name: 'Kuttu Atta 1kg', price: 95, store_id: 'store_2', category_id: 'cat_10', brand: 'Pillsbury', unit: '1 kg pack', tags: ['fasting', 'navratri'], is_veg: true, rating: 4.4, reviews_count: 87000 },
  { name: 'Coconut Ladoo 250g', price: 145, store_id: 'store_1', category_id: 'cat_7', is_veg: true, prep_time_minutes: 5, unit: '250 g box', tags: ['sweets', 'fasting'], rating: 4.7, reviews_count: 96000, is_featured: true },
  { name: 'Cornetto Vanilla 110ml', price: 60, discount_price: 50, store_id: 'store_2', category_id: 'cat_15', brand: 'Kwality Walls', unit: '110 ml cone', tags: ['cone', 'frozen', 'ice-cream'], is_veg: true, rating: 4.6, reviews_count: 420000, is_featured: true },
  { name: 'Magnum Almond 90ml', price: 110, store_id: 'store_2', category_id: 'cat_15', brand: 'Magnum', unit: '90 ml stick', tags: ['stick', 'frozen', 'ice-cream'], is_veg: true, rating: 4.8, reviews_count: 264000 },
  { name: 'Amul Ice Cream Tub 500ml', price: 245, store_id: 'store_2', category_id: 'cat_15', brand: 'Amul', unit: '500 ml tub', tags: ['tub', 'frozen', 'ice-cream'], is_veg: true, rating: 4.7, reviews_count: 188000 },
  { name: 'Choco Truffle Pastry', price: 75, store_id: 'store_3', category_id: 'cat_7', is_veg: true, prep_time_minutes: 5, unit: 'pcs', tags: ['cake', 'bakery', 'dessert'], rating: 4.5, reviews_count: 62000 },
  { name: 'Haldiram Bhujia 200g', price: 55, discount_price: 45, store_id: 'store_2', category_id: 'cat_13', brand: 'Haldiram', unit: '200 g pack', tags: ['namkeen', 'snack'], is_veg: true, rating: 4.5, reviews_count: 820000 },
  { name: 'Act II Popcorn 70g', price: 35, store_id: 'store_2', category_id: 'cat_13', brand: 'Act II', unit: '70 g pack', tags: ['popcorn', 'snack'], is_veg: true, rating: 4.3, reviews_count: 142000 },
  { name: 'Too Yumm Multigrain 50g', price: 30, store_id: 'store_2', category_id: 'cat_13', brand: 'Too Yumm', unit: '50 g pack', tags: ['healthy', 'snack', 'baked'], is_veg: true, rating: 4.4, reviews_count: 88000 }
];

// Append festival products to the products array at module load.
let _festivalOffset = products.length + 1;
for (const seed of festivalProductSeeds) {
  const isFood = !seed.brand && (seed.prep_time_minutes !== undefined);
  products.push({
    id: `prod_${_festivalOffset++}`,
    slug: seed.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    description: isFood
      ? `Delicious ${seed.name}, prepared fresh.`
      : `${seed.brand || 'FreshMart'} ${seed.name} — quality you can trust.`,
    image_url: undefined,
    images: undefined,
    stock: Math.floor(Math.random() * 80) + 20,
    is_available: true,
    is_featured: seed.is_featured ?? false,
    rating: seed.rating ?? 4.2,
    reviews_count: seed.reviews_count ?? 50,
    tags: seed.tags ?? [],
    barcode: !isFood ? '890' + Math.floor(1000000000 + Math.random() * 8000000000) : undefined,
    created_at: iso(15),
    ...seed
  } as Product);
}

// ---------- Bestseller carousel items (top-rated featured products) ----------

export const bestsellerCarouselTags = ['bestseller', 'snack', 'frozen', 'ice-cream'];

// ---------- Category grid groupings (Grocery & Kitchen / Snacks & Drinks) ----------
// Slugs must match the categories array above.

export const groceryKitchenSlugs = [
  'vegetables-fruits',
  'atta-rice-dal',
  'dairy-bread-eggs',
  'oil-ghee-masala'
];

export const snacksDrinksSlugs = [
  'chips-namkeen',
  'drinks-juices',
  'ice-creams',
  'sweets-chocolates'
];

// ---------- Wallet mock balance override (Blinkit-style ₹0) ----------
// We keep the existing ₹1245 mock balance; the header shows it as-is.

export const blinkitDeliveryMinutes = 8;
