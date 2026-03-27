// main.js - Homepage specific interactivity

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {

  // Mount components
  document.getElementById('app-header').innerHTML = Components.renderHeader();
  document.getElementById('app-footer').innerHTML = Components.renderFooter();

  // Load Data
  renderHomepageProducts();
  renderCategoriesGrid();
  renderBrandsGrid();
  renderMegaMenu();

  // Initialize interactive features
  initHeroSlider();
  initCountdown();
  initMegaMenuHover();
  initProductSlider();
  initBackToTop();
  initStickyHeader();
  initSearch();
  Cart.updateBadge();
});

// --- Renders ---
function renderHomepageProducts() {
  const hotProducts = PharmifyDB.getHotProducts();
  const newProducts = PharmifyDB.getNewProducts();

  const hotList = document.getElementById('hotProductsList');
  if (hotList) {
    hotList.innerHTML = hotProducts.map(p => Components.renderProductCard(p)).join('');
  }

  const newList = document.getElementById('newProductsList');
  if (newList) {
    newList.innerHTML = newProducts.map(p => Components.renderProductCard(p)).join('');
  }
}

function renderCategoriesGrid() {
  const wrapper = document.getElementById('homepageCategories');
  if (!wrapper) return;

  wrapper.innerHTML = PharmifyDB.db.categories.map(cat => `
    <a href="category.html?cat=${cat.id}" class="category-item text-center">
      <div class="category-icon-bg">
        <i class="${cat.icon} fa-2x"></i>
      </div>
      <p class="mt-10 mb-0 font-weight-500">${cat.name}</p>
    </a>
  `).join('');
}

function renderBrandsGrid() {
  const wrapper = document.getElementById('homepageBrands');
  if (!wrapper) return;

  wrapper.innerHTML = PharmifyDB.db.brands.map(brand => `
    <a href="category.html?brand=${brand.id}" class="brand-item">
      <span>${brand.name}</span>
    </a>
  `).join('');
}

function renderMegaMenu() {
  const sidebar = document.getElementById('megaSidebar');
  const content = document.getElementById('megaContent');
  if (!sidebar || !content) return;

  // Sidebar links
  sidebar.innerHTML = PharmifyDB.db.categories.map((cat, index) => `
    <div class="mega-sidebar-item ${index === 0 ? 'active' : ''}" data-target="cat-${cat.id}">
      <i class="${cat.icon}"></i> ${cat.name} <i class="fas fa-chevron-right ms-auto"></i>
    </div>
  `).join('');

  // Content panels
  content.innerHTML = PharmifyDB.db.categories.map((cat, index) => `
    <div class="mega-content-panel ${index === 0 ? 'active' : ''}" id="cat-${cat.id}">
      <h4>${cat.name}</h4>
      <div class="sub-categories">
        ${cat.sub.map(sub => `<a href="category.html?cat=${cat.id}">${sub}</a>`).join('')}
      </div>
    </div>
  `).join('');
}

// --- Interactivity ---

function initMegaMenuHover() {
  const sidebarItems = document.querySelectorAll('.mega-sidebar-item');
  const contentPanels = document.querySelectorAll('.mega-content-panel');

  sidebarItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
      // Remove active from all
      sidebarItems.forEach(i => i.classList.remove('active'));
      contentPanels.forEach(p => p.classList.remove('active'));
      
      // Add to current
      item.classList.add('active');
      const target = document.getElementById(item.getAttribute('data-target'));
      if (target) target.classList.add('active');
    });
  });
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slider .slide');
  const dotsContainer = document.getElementById('sliderDots');
  if (!slides.length) return;

  let currentSlide = 0;
  let autoPlayInterval;

  // Create dots
  slides.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.slider-dot');

  function goToSlide(n) {
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (n + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
    resetAutoPlay();
  }

  document.getElementById('sliderNext').addEventListener('click', () => goToSlide(currentSlide + 1));
  document.getElementById('sliderPrev').addEventListener('click', () => goToSlide(currentSlide - 1));

  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    autoPlayInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
  }

  // Touch Support
  let touchStartX = 0;
  let touchEndX = 0;
  const slider = document.querySelector('.hero-slider-container');
  
  slider.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, {passive: true});
  
  slider.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchStartX - touchEndX > 50) goToSlide(currentSlide + 1); // Swipe left
    if (touchEndX - touchStartX > 50) goToSlide(currentSlide - 1); // Swipe right
  }, {passive: true});

  resetAutoPlay();
}

function initCountdown() {
  // Set to end of current day
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const cdBoxes = document.querySelectorAll('.cd-box');
  if (cdBoxes.length < 3) return;

  function update() {
    const now = new Date();
    const diff = endOfDay - now;
    
    if (diff <= 0) return;

    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    cdBoxes[0].textContent = h.toString().padStart(2, '0');
    cdBoxes[1].textContent = m.toString().padStart(2, '0');
    cdBoxes[2].textContent = s.toString().padStart(2, '0');
  }

  setInterval(update, 1000);
  update();
}

function initProductSlider() {
  const inner = document.querySelector('.product-slider-inner');
  const btnPrev = document.querySelector('.btn-product-prev');
  const btnNext = document.querySelector('.btn-product-next');

  if (!inner || !btnPrev || !btnNext) return;

  const scrollAmount = 300;

  btnNext.addEventListener('click', () => {
    inner.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  });

  btnPrev.addEventListener('click', () => {
    inner.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  });
}

function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function initStickyHeader() {
  const header = document.getElementById('headerRef');
  if (!header) return;

  const stickyPos = 40; // Approx height of top-bar

  window.addEventListener('scroll', () => {
    if (window.scrollY > stickyPos) {
      header.classList.add('sticky');
    } else {
      header.classList.remove('sticky');
    }
  });
}

function initSearch() {
  const inputs = document.querySelectorAll('input[placeholder*="Tìm kiếm"]');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && input.value.trim() !== '') {
        window.location.href = `category.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });

  const btns = document.querySelectorAll('.btn-search');
  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.parentElement.querySelector('input');
      if (input && input.value.trim() !== '') {
        window.location.href = `category.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });
}
