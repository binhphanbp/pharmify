// product.js - Handles Product Detail Page logic

document.addEventListener('DOMContentLoaded', () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    // If no ID, redirect to home
    window.location.href = 'index.html';
    return;
  }

  // Load product data
  const product = window.PharmifyDB.getProductById(productId);
  
  if (!product) {
    document.getElementById('productName').textContent = 'Không tìm thấy sản phẩm';
    return;
  }

  // Render product details
  document.getElementById('productName').textContent = product.name;
  document.getElementById('productImage').src = product.image;
  document.getElementById('productID').textContent = product.id.toString().padStart(6, '0');
  document.getElementById('productUnit').textContent = product.unit;
  document.getElementById('productDesc').textContent = product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.';
  
  // Custom Breadcrumb
  const category = PharmifyDB.db.categories.find(c => c.id === product.category);
  if (category) {
    document.getElementById('bcCategory').textContent = category.name;
    document.getElementById('bcCategory').href = `category.html?cat=${category.id}`;
  }
  document.getElementById('bcProduct').textContent = product.name.substring(0, 30) + '...';

  // Format Prices
  document.getElementById('productPrice').textContent = PharmifyDB.formatCurrency(product.price);
  
  if (product.oldPrice && product.oldPrice > product.price) {
    document.getElementById('productOldPrice').textContent = PharmifyDB.formatCurrency(product.oldPrice);
    
    // Add discount badge
    const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
    document.getElementById('productBadges').innerHTML = `
      <span class="badge-large bg-danger">Giảm ${discount}%</span>
      ${product.badge ? `<span class="badge-large bg-success mt-10">${product.badge}</span>` : ''}
    `;
  } else {
    document.getElementById('productOldPrice').style.display = 'none';
    if (product.badge) {
      document.getElementById('productBadges').innerHTML = `
        <span class="badge-large" style="background-color: #00A651">${product.badge}</span>
      `;
    }
  }

  // Handle Add to Cart
  const qtInput = document.getElementById('detailQty');
  const btnAdd = document.getElementById('btnAddToCart');

  window.changeQty = function(delta) {
    let val = parseInt(qtInput.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    if (val > 99) val = 99;
    qtInput.value = val;
  };

  btnAdd.addEventListener('click', () => {
    const qty = parseInt(qtInput.value) || 1;
    Cart.addItem(product.id, qty);
  });

  // Load Related Products
  renderRelatedProducts(product.category, product.id);
});

function renderRelatedProducts(categoryId, currentProductId) {
  const relatedList = document.getElementById('relatedProductsList');
  if (!relatedList) return;

  const products = PharmifyDB.getProductsByCategory(categoryId)
      .filter(p => p.id !== currentProductId)
      .slice(0, 5); // Take up to 5

  if (products.length === 0) {
    // If no exact match, fallback to some hot products
    const fallback = PharmifyDB.getHotProducts().filter(p => p.id !== currentProductId).slice(0, 5);
    relatedList.innerHTML = fallback.map(p => Components.renderProductCard(p)).join('');
  } else {
    relatedList.innerHTML = products.map(p => Components.renderProductCard(p)).join('');
  }
}
