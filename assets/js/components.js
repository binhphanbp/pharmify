// components.js - Shared UI components across pages

const Components = {
  renderProductCard: (product) => {
    const isDiscounted = product.oldPrice && product.oldPrice > product.price;
    const discountPercent = isDiscounted ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
    
    return `
      <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
        <div class="product-badges">
          ${isDiscounted ? `<span class="badge badge-sale">Giảm ${discountPercent}%</span>` : ''}
          ${product.badge ? `<span class="badge badge-promo">${product.badge}</span>` : ''}
        </div>
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3 class="product-name" title="${product.name}">${product.name}</h3>
          <div class="product-price-block">
            <span class="product-price">${PharmifyDB.formatCurrency(product.price)} /${product.unit.split(' ')[0]}</span>
            ${isDiscounted ? `<span class="product-old-price"><del>${PharmifyDB.formatCurrency(product.oldPrice)}</del></span>` : ''}
          </div>
          <button class="btn-add-cart" onclick="event.stopPropagation(); Cart.addItem(${product.id}, 1)">
            <i class="fas fa-plus"></i> Chọn mua
          </button>
        </div>
      </div>
    `;
  },

  renderHeader: () => {
    return `
      <!-- Top Utility Bar -->
      <div class="top-bar">
        <div class="container d-flex justify-content-between">
          <div class="top-bar-left">
            <span class="promo-text"><i class="fas fa-bolt"></i> MIỄN PHÍ GIAO HÀNG TẬN NƠI CHO ĐƠN TỪ 300K</span>
          </div>
          <div class="top-bar-right d-flex gap-15">
            <a href="#"><i class="fas fa-file-invoice-dollar"></i> Xuất hóa đơn điện tử</a>
            <a href="#"><i class="fas fa-map-marker-alt"></i> Hệ thống 1000+ Nhà thuốc</a>
            <a href="#"><i class="fas fa-headset"></i> Tư vấn: 1800 6821</a>
          </div>
        </div>
      </div>

      <!-- Main Header -->
      <header class="main-header" id="headerRef">
        <div class="container header-container">
          <!-- Logo -->
          <a href="index.html" class="logo">
            <!-- Replacing Pharmacity logo with stylized Pharmify text -->
            <div style="font-size: 28px; font-weight: 800; color: white; display: flex; align-items: center; gap: 8px;">
              <i class="fas fa-plus-square" style="color: #FF9900;"></i> Pharmify
            </div>
          </a>

          <!-- Category Button -->
          <div class="category-dropdown" id="btnMegaMenu">
            <button class="btn-category">
              <i class="fas fa-bars"></i> Danh mục <i class="fas fa-chevron-down"></i>
            </button>
            <div class="mega-menu" id="megaMenu">
              <div class="mega-menu-inner">
                <div class="mega-sidebar" id="megaSidebar">
                  <!-- Categories will be rendered here by JS -->
                </div>
                <div class="mega-content" id="megaContent">
                  <!-- Sub content rendered by JS -->
                </div>
              </div>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="search-form">
            <input type="text" id="searchInput" placeholder="Tìm kiếm thuốc, bệnh lý, thực phẩm chức năng...">
            <button type="submit" class="btn-search"><i class="fas fa-search"></i></button>
            <div class="search-suggestions" id="searchSuggestions"></div>
          </div>

          <!-- User Actions -->
          <div class="header-actions">
            <!-- Login/Register -->
            <a href="login.html" class="action-item">
              <div class="action-icon"><i class="far fa-user"></i></div>
              <div class="action-text">
                <span>Đăng nhập</span>
                <strong>Tài khoản</strong>
              </div>
            </a>
            
            <!-- Cart -->
            <a href="cart.html" class="action-item">
              <div class="action-icon">
                <i class="fas fa-shopping-cart"></i>
                <span class="cart-badge" id="headerCartCount">0</span>
              </div>
              <div class="action-text">
                <span>Giỏ hàng</span>
              </div>
            </a>
          </div>
        </div>
      </header>
    `;
  },

  renderFooter: () => {
    return `
      <footer class="main-footer">
        <!-- Benefit Strip -->
        <div class="benefit-strip">
          <div class="container d-flex justify-content-between">
            <div class="benefit-item">
              <i class="fas fa-shipping-fast fa-2x"></i>
              <div>
                <strong>Miễn phí vận chuyển</strong>
                <p>Cho đơn hàng từ 300.000đ</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="fas fa-medal fa-2x"></i>
              <div>
                <strong>100% Chính hãng</strong>
                <p>Cam kết chất lượng</p>
              </div>
            </div>
            <div class="benefit-item">
              <i class="fas fa-sync-alt fa-2x"></i>
              <div>
                <strong>Đổi trả 30 ngày</strong>
                <p>Dễ dàng và miễn phí</p>
              </div>
            </div>
          </div>
        </div>

        <div class="container py-40">
          <div class="row">
            <div class="col-md-4">
              <div class="footer-widget">
                <div style="font-size: 32px; font-weight: 800; color: #004DA0; margin-bottom: 20px; display: flex; align-items: center; gap: 8px;">
                  <i class="fas fa-plus-square" style="color: #FF9900;"></i> Pharmify
                </div>
                <p>Ra đời năm 2011, là một trong những chuỗi bán lẻ dược phẩm đầu tiên tại Việt Nam. Đến nay, Pharmify sở hữu mạng lưới hàng ngàn nhà thuốc chuẩn GPP trên toàn quốc.</p>
                <div class="contact-info mt-20">
                  <p><i class="fas fa-map-marker-alt"></i> 117-119 Trần Phú, Phường 4, Quận 5, TP. Hồ Chí Minh</p>
                  <p><i class="fas fa-phone-alt"></i> 1800 6821 (Tư vấn miễn phí)</p>
                  <p><i class="fas fa-envelope"></i> cskh@pharmify.vn</p>
                </div>
              </div>
            </div>
            <div class="col-md-2">
              <div class="footer-widget">
                <h4 class="widget-title">Về Pharmify</h4>
                <ul class="widget-links">
                  <li><a href="#">Giới thiệu</a></li>
                  <li><a href="#">Hệ thống cửa hàng</a></li>
                  <li><a href="#">Tuyển dụng</a></li>
                  <li><a href="#">Chính sách bảo mật</a></li>
                  <li><a href="#">Điều khoản sử dụng</a></li>
                </ul>
              </div>
            </div>
            <div class="col-md-2">
              <div class="footer-widget">
                <h4 class="widget-title">Hỗ trợ khách hàng</h4>
                <ul class="widget-links">
                  <li><a href="#">Chính sách đổi trả</a></li>
                  <li><a href="#">Chính sách giao hàng</a></li>
                  <li><a href="#">Hình thức thanh toán</a></li>
                  <li><a href="#">Hướng dẫn mua hàng</a></li>
                  <li><a href="#">Kiểm tra đơn hàng</a></li>
                </ul>
              </div>
            </div>
            <div class="col-md-4">
              <div class="footer-widget">
                <h4 class="widget-title">Đăng ký nhận tin & Tải ứng dụng</h4>
                <p>Cài đặt ứng dụng Pharmify để nhận ưu đãi đặc quyền và quản lý sức khỏe tốt hơn.</p>
                <div class="app-links d-flex gap-15 mt-15">
                  <a href="#" class="app-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" style="height: 40px;"></a>
                  <a href="#" class="app-btn"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style="height: 40px;"></a>
                </div>
                <div class="social-links mt-20 d-flex gap-15">
                  <a href="#"><i class="fab fa-facebook-f"></i></a>
                  <a href="#"><i class="fab fa-youtube"></i></a>
                  <a href="#"><i class="fab fa-tiktok"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="container text-center">
            <p>&copy; 2026 Pharmify JSC. All rights reserved. Clone Project for Demonstration.</p>
          </div>
        </div>
      </footer>
    `;
  }
};

window.Components = Components;
