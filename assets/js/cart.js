// cart.js - Handles Shopping Cart logic via LocalStorage

const Cart = {
  items: [],

  init() {
    const saved = localStorage.getItem('pharmify_cart');
    if (saved) {
      try {
        this.items = JSON.parse(saved);
      } catch (e) {
        this.items = [];
      }
    }
    this.updateBadge();
  },

  save() {
    localStorage.setItem('pharmify_cart', JSON.stringify(this.items));
    this.updateBadge();
  },

  addItem(productId, quantity = 1) {
    const existing = this.items.find(item => item.id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ id: productId, quantity });
    }
    this.save();
    this.showToast('Đã thêm sản phẩm vào giỏ hàng!');
  },

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.save();
  },

  updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }
    const item = this.items.find(item => item.id === productId);
    if (item) {
      item.quantity = quantity;
      this.save();
    }
  },

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice() {
    return this.items.reduce((total, item) => {
      const product = window.PharmifyDB.getProductById(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  },

  updateBadge() {
    const badge = document.getElementById('headerCartCount');
    if (badge) {
      const count = this.getTotalItems();
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
      
      // Add animation effect
      badge.classList.add('pop');
      setTimeout(() => badge.classList.remove('pop'), 300);
    }
  },

  showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerHTML = `<i class="fas fa-check-circle text-success"></i> ${message}`;
    
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

// Initialize Cart on page load
document.addEventListener('DOMContentLoaded', () => {
  // Ensure DB is loaded first
  if (window.PharmifyDB) {
    Cart.init();
  } else {
    // If DB is not loaded yet (maybe script order issue), wait a bit
    setTimeout(() => Cart.init(), 100);
  }
});

window.Cart = Cart;
