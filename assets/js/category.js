// category.js - Handles listing page filters and sorting

document.addEventListener('DOMContentLoaded', () => {
  // 1. Get Initial Data & Context
  const urlParams = new URLSearchParams(window.location.search);
  const currentCategory = urlParams.get('cat') || 'all';

  const categoryListElement = document.getElementById('filterCategoryList');
  const productListElement = document.getElementById('categoryProductList');
  const pageTitleElement = document.getElementById('pageCategoryTitle');
  const breadcrumbElement = document.getElementById('bcCategoryName');
  const sortSelect = document.getElementById('sortSelect');

  let currentProducts = [];

  // 2. Render Sidebar Categories
  function renderSidebar() {
    let html = `<li><label><input type="radio" name="cat" value="all" ${currentCategory === 'all' ? 'checked' : ''}> Tất cả sản phẩm</label></li>`;
    PharmifyDB.db.categories.forEach(cat => {
      const isChecked = currentCategory === cat.id ? 'checked' : '';
      html += `<li><label><input type="radio" name="cat" value="${cat.id}" ${isChecked}> ${cat.name}</label></li>`;
    });
    categoryListElement.innerHTML = html;

    // Attach events
    const catRadios = categoryListElement.querySelectorAll('input[name="cat"]');
    catRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        applyFilters(e.target.value, getSelectedPrice());
      });
    });
  }

  // 3. Render Products
  function renderProducts(products) {
    if (products.length === 0) {
      productListElement.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <i class="fas fa-box-open"></i>
          <p>Không tìm thấy sản phẩm nào phù hợp.</p>
          <button class="btn btn-outline" style="margin-top:15px;" onclick="window.location.href='category.html'">Xóa bộ lọc</button>
        </div>
      `;
      return;
    }
    productListElement.innerHTML = products.map(p => Components.renderProductCard(p)).join('');
  }

  // 4. Set Headers
  function updateHeaders(catId) {
    let title = "Tất cả sản phẩm";
    if (catId !== 'all') {
      const cat = PharmifyDB.db.categories.find(c => c.id === catId);
      if (cat) title = cat.name;
    }
    pageTitleElement.textContent = title;
    breadcrumbElement.textContent = title;
  }

  // 5. Apply Filters
  function applyFilters(catId, priceRange) {
    // History push state optional, keep it simple for now
    updateHeaders(catId);

    // Get search term
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search') ? urlParams.get('search').toLowerCase() : '';

    // Filter by Category
    if (catId === 'all') {
      currentProducts = [...PharmifyDB.db.products];
    } else {
      currentProducts = PharmifyDB.getProductsByCategory(catId);
    }

    // Filter by Search Term
    if (searchTerm) {
      currentProducts = currentProducts.filter(p => p.name.toLowerCase().includes(searchTerm));
      if (catId === 'all') {
        pageTitleElement.textContent = `Kết quả tìm kiếm cho: "${searchTerm}"`;
        breadcrumbElement.textContent = `Tìm kiếm: "${searchTerm}"`;
      }
    }

    // Filter by Price
    currentProducts = currentProducts.filter(p => {
      switch(priceRange) {
        case 'under100': return p.price < 100000;
        case '100to300': return p.price >= 100000 && p.price <= 300000;
        case '300to500': return p.price >= 300000 && p.price <= 500000;
        case 'above500': return p.price > 500000;
        default: return true; // 'all'
      }
    });

    applySort(); // Re-sort and render
  }

  // Helper
  function getSelectedPrice() {
    const checked = document.querySelector('input[name="price"]:checked');
    return checked ? checked.value : 'all';
  }

  // 6. Sort
  function applySort() {
    const val = sortSelect.value;
    let sorted = [...currentProducts];
    
    if (val === 'price-asc') {
      sorted.sort((a,b) => a.price - b.price);
    } else if (val === 'price-desc') {
      sorted.sort((a,b) => b.price - a.price);
    } else if (val === 'name-asc') {
      sorted.sort((a,b) => a.name.localeCompare(b.name, 'vi'));
    }
    // Default: no specific sorting, just render

    renderProducts(sorted);
  }

  // Attach Price Filter events
  const priceRadios = document.querySelectorAll('input[name="price"]');
  priceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const activeCat = document.querySelector('input[name="cat"]:checked').value;
      applyFilters(activeCat, radio.value);
    });
  });

  // Attach Sort Event
  sortSelect.addEventListener('change', applySort);

  // Initialization
  renderSidebar();
  applyFilters(currentCategory, 'all');

});
