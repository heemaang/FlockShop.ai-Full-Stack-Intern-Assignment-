// Mock data storage
let users = [];
let wishlists = [];
let products = [];

// Mock user operations
const mockUserOps = {
  create: (userData) => {
    const user = {
      _id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    users.push(user);
    return user;
  },
  findByEmail: (email) => users.find(u => u.email === email),
  findById: (id) => users.find(u => u._id === id)
};

// Mock wishlist operations
const mockWishlistOps = {
  create: (wishlistData) => {
    const wishlist = {
      _id: Date.now().toString(),
      ...wishlistData,
      products: [],
      createdAt: new Date()
    };
    wishlists.push(wishlist);
    return wishlist;
  },
  findByUserId: (userId) => wishlists.filter(w => w.members.includes(userId)),
  findById: (id) => wishlists.find(w => w._id === id),
  update: (id, data) => {
    const index = wishlists.findIndex(w => w._id === id);
    if (index !== -1) {
      wishlists[index] = { ...wishlists[index], ...data };
      return wishlists[index];
    }
    return null;
  },
  delete: (id) => {
    const index = wishlists.findIndex(w => w._id === id);
    if (index !== -1) {
      wishlists.splice(index, 1);
      return true;
    }
    return false;
  }
};

// Mock product operations
const mockProductOps = {
  create: (productData) => {
    const product = {
      _id: Date.now().toString(),
      ...productData,
      createdAt: new Date()
    };
    products.push(product);
    return product;
  },
  findById: (id) => products.find(p => p._id === id),
  update: (id, data) => {
    const index = products.findIndex(p => p._id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...data };
      return products[index];
    }
    return null;
  },
  delete: (id) => {
    const index = products.findIndex(p => p._id === id);
    if (index !== -1) {
      products.splice(index, 1);
      return true;
    }
    return false;
  }
};

module.exports = {
  mockUserOps,
  mockWishlistOps,
  mockProductOps
}; 