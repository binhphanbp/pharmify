const db = {
  categories: [
    { id: 'thuoc', name: 'Thuốc', icon: 'fas fa-pills', sub: ['Thuốc không kê đơn', 'Thuốc kê đơn', 'Thuốc đau đầu', 'Thuốc hạ sốt'] },
    { id: 'tra-cuu', name: 'Tra cứu bệnh', icon: 'fas fa-stethoscope', sub: ['Bệnh theo mùa', 'Bệnh nhiệt đới', 'Cảm cúm'] },
    { id: 'tpcn', name: 'Thực phẩm bảo vệ sức khỏe', icon: 'fas fa-heartbeat', sub: ['Vitamin', 'Khoáng chất', 'Hỗ trợ tiêu hóa', 'Xương khớp'] },
    { id: 'cham-soc', name: 'Chăm sóc cá nhân', icon: 'fas fa-hand-sparkles', sub: ['Sữa tắm', 'Chăm sóc tóc', 'Chăm sóc răng miệng', 'Khử mùi'] },
    { id: 'me-be', name: 'Mẹ và Bé', icon: 'fas fa-baby', sub: ['Sữa bột', 'Tã bỉm', 'Vệ sinh cho bé', 'Đồ dùng'] },
    { id: 'sac-dep', name: 'Chăm sóc sắc đẹp', icon: 'fas fa-spa', sub: ['Tẩy trang', 'Sữa rửa mặt', 'Kem chống nắng', 'Mặt nạ'] },
    { id: 'thiet-bi', name: 'Thiết bị y tế', icon: 'fas fa-x-ray', sub: ['Máy đo huyết áp', 'Nhiệt kế', 'Băng gạc', 'Máy đo đường huyết'] },
    { id: 'tien-loi', name: 'Sản phẩm tiện lợi', icon: 'fas fa-box-open', sub: ['Đồ ăn vặt', 'Nước uống', 'Đồ dã ngoại'] }
  ],
  products: [
    {
      id: 1,
      name: 'Viên Uống DHC Bổ Sung Vitamin C Giúp Cải Thiện Sức Khỏe Làn Da',
      price: 180000,
      oldPrice: 200000,
      image: 'https://cdn-icons-png.flaticon.com/128/2913/2913133.png',
      category: 'tpcn',
      badge: 'Giảm 10%',
      unit: 'Gói 60 Viên',
      sold: 1250,
      hot: true,
      description: 'Vitamin C DHC là thực phẩm chức năng giúp bổ sung vitamin C cần thiết cho cơ thể, hỗ trợ tăng cường sức đề kháng và làm sáng da.'
    },
    {
      id: 2,
      name: 'Nước Tẩy Trang L\'Oreal 3 In 1 Micellar Làm Sạch Sâu',
      price: 159000,
      oldPrice: 199000,
      image: 'https://cdn-icons-png.flaticon.com/128/2553/2553627.png',
      category: 'sac-dep',
      badge: 'Giảm 20%',
      unit: 'Chai 400ml',
      sold: 3420,
      hot: true,
      description: 'Nước tẩy trang L\'Oreal Paris 3 In 1 Micellar Water làm sạch sâu, loại bỏ tạp chất và lớp trang điểm an toàn cho da nhạy cảm.'
    },
    {
      id: 3,
      name: 'Thuốc nhỏ mắt V.Rohto Vitamin (Chai 13ml)',
      price: 55000,
      oldPrice: null,
      image: 'https://cdn-icons-png.flaticon.com/128/3209/3209265.png',
      category: 'thuoc',
      badge: null,
      unit: 'Chai 13ml',
      sold: 800,
      new: true,
      description: 'V.Rohto Vitamin với 4 chất dinh dưỡng (Vitamin E, B6, Na, K) giúp cải thiện mỏi mắt và các bệnh về mắt.'
    },
    {
      id: 4,
      name: 'Sữa Dưỡng Thể Cetaphil Moisturizing Lotion Dành Cho Mọi Loại Da',
      price: 360000,
      oldPrice: 400000,
      image: 'https://cdn-icons-png.flaticon.com/128/2553/2553642.png',
      category: 'cham-soc',
      badge: 'Giảm 10%',
      unit: 'Chai 473ml',
      sold: 550,
      recent: true,
      description: 'Cetaphil Moisturizing Lotion là sữa dưỡng thể không nhờn rít, dưỡng ẩm nhẹ nhàng và bảo vệ làn da mịn màng.'
    },
    {
      id: 5,
      name: 'Thực Phẩm Bảo Vệ Sức Khỏe Centrum Advance',
      price: 490000,
      oldPrice: 550000,
      image: 'https://cdn-icons-png.flaticon.com/128/2927/2927849.png',
      category: 'tpcn',
      badge: 'Bán Rất Chạy',
      unit: 'Hộp 100 Viên',
      sold: 1100,
      hot: true,
      description: 'Centrum Advance bổ sung hỗn hợp vitamin và khoáng chất hoàn chỉnh thiết yếu giúp tăng cường sức khỏe tổng hợp.'
    },
    {
      id: 6,
      name: 'Thuốc Giảm Đau, Hạ Sốt Panadol Extra',
      price: 155000,
      oldPrice: null,
      image: 'https://cdn-icons-png.flaticon.com/128/2920/2920309.png',
      category: 'thuoc',
      badge: null,
      unit: 'Hộp 15 Vỉ x 12 Viên',
      sold: 5000,
      description: 'Panadol Extra với công thức Paracetamol và Caffeine giúp giảm đau và hạ sốt nhanh chóng, hiệu quả đối với các cơn đau dữ dội.'
    },
    {
      id: 7,
      name: 'Máy Đo Huyết Áp Bắp Tay Omron HEM-7120',
      price: 850000,
      oldPrice: 1050000,
      image: 'https://cdn-icons-png.flaticon.com/128/3209/3209960.png',
      category: 'thiet-bi',
      badge: 'Giảm 19%',
      unit: 'Hộp 1 Cái',
      sold: 120,
      hot: true,
      description: 'Máy đo huyết áp bắp tay tự động Omron HEM-7120 công nghệ Intellisense, đo chính xác, cảnh báo nhịp tim bất thường.'
    },
    {
      id: 8,
      name: 'Sữa Bột Abbott Ensure Gold Hương Vani',
      price: 855000,
      oldPrice: 890000,
      image: 'https://cdn-icons-png.flaticon.com/128/2553/2553691.png',
      category: 'me-be',
      badge: 'MUA 1 TẶNG 1',
      unit: 'Lon 850g',
      sold: 850,
      hot: true,
      description: 'Ensure Gold mới với chuỗi Amino Acid HMB giúp tái tạo và tăng cường khối cơ, hỗ trợ phục hồi sức khỏe nhanh chóng.'
    },
    {
      id: 9,
      name: 'Khẩu Trang Y Tế 4 Lớp Kháng Khuẩn Nam Anh',
      price: 35000,
      oldPrice: 50000,
      image: 'https://cdn-icons-png.flaticon.com/128/2913/2913133.png',
      category: 'tien-loi',
      badge: 'Giảm 30%',
      unit: 'Hộp 50 Cái',
      sold: 15400,
      description: 'Khẩu trang y tế 4 lớp chất lượng cao, bảo vệ đường hô hấp tối ưu khỏi khói bụi và vi khuẩn gây bệnh.'
    },
    {
      id: 10,
      name: 'Sữa Rửa Mặt Tẩy Tế Bào Chết St.Ives Blemish Control',
      price: 120000,
      oldPrice: 150000,
      image: 'https://cdn-icons-png.flaticon.com/128/2553/2553651.png',
      category: 'sac-dep',
      badge: 'Giảm 20%',
      unit: 'Tuýp 170g',
      sold: 450,
      description: 'St.Ives Blemish Control với chiết xuất trái mơ chứa Salicylic Acid giúp ngăn ngừa mụn, làm sạch và sáng da.'
    }
  ],
  brands: [
    { id: 'optibac', name: 'OPTIBAC', icon: 'O' },
    { id: 'silcot', name: 'SILCOT', icon: 'S' },
    { id: 'sunplay', name: 'SUNPLAY', icon: 'S' },
    { id: 'cetaphil', name: 'CETAPHIL', icon: 'C' },
    { id: 'durex', name: 'DUREX', icon: 'D' },
    { id: 'nivea', name: 'NIVEA', icon: 'N' },
    { id: 'colgate', name: 'COLGATE', icon: 'C' },
    { id: 'abbott', name: 'ABBOTT', icon: 'A' },
  ]
};

// Utilities
const formatCurrency = (amount) => {
  if (!amount) return '';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
};

const getProductById = (id) => db.products.find(p => p.id === parseInt(id));
const getProductsByCategory = (cat) => db.products.filter(p => p.category === cat);
const getHotProducts = () => db.products.filter(p => p.hot);
const getNewProducts = () => db.products.filter(p => p.new);

// Export for usage
window.PharmifyDB = {
  db,
  formatCurrency,
  getProductById,
  getProductsByCategory,
  getHotProducts,
  getNewProducts
};
