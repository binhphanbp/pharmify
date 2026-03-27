const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://jfygysihtplarmfeatdc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeWd5c2lodHBsYXJtZmVhdGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTg0OTQsImV4cCI6MjA5MDA3NDQ5NH0.4IqYvJjsrgl3EWlTUVKH8P3IWPowoCw8iLsFj8IL2g4",
);

async function fix() {
  // Get all banners
  const { data } = await supabase
    .from("banners")
    .select("*")
    .order("sort_order")
    .order("created_at");
  console.log(`Total banners: ${data?.length}`);

  // Group by title+position, keep only the first of each
  const seen = new Set();
  const toDelete = [];
  for (const b of data || []) {
    const key = `${b.title}|${b.position}`;
    if (seen.has(key)) {
      toDelete.push(b.id);
    } else {
      seen.add(key);
    }
  }

  console.log(`Duplicates to delete: ${toDelete.length}`);
  if (toDelete.length > 0) {
    const { error } = await supabase
      .from("banners")
      .delete()
      .in("id", toDelete);
    if (error) console.log("Error deleting:", error.message);
    else console.log("✅ Deleted duplicates");
  }

  // Verify
  const { data: final } = await supabase
    .from("banners")
    .select("title,position,sort_order")
    .order("position")
    .order("sort_order");
  console.log("\nFinal banners:");
  final?.forEach((b) =>
    console.log(`  [${b.position}] #${b.sort_order} ${b.title}`),
  );

  // Also update titles to proper Vietnamese
  const updates = [
    {
      match: "Giam den 50% Vitamin & Thuc pham chuc nang",
      title: "Giảm đến 50% Vitamin & Thực phẩm chức năng",
      subtitle: "Ưu đãi hấp dẫn chỉ có tại Pharmify",
    },
    {
      match: "Thuoc chinh hang - Giao nhanh 2h",
      title: "Thuốc chính hãng - Giao nhanh 2h",
      subtitle: "Đảm bảo chất lượng, giá tốt nhất",
    },
    {
      match: "Cham soc suc khoe toan dien",
      title: "Chăm sóc sức khỏe toàn diện",
      subtitle: "Hệ thống nhà thuốc trực tuyến số 1 Việt Nam",
    },
    {
      match: "Flash Sale cuoi tuan",
      title: "Flash Sale cuối tuần",
      subtitle: "Giảm thêm 20% cho đơn hàng đầu tiên",
    },
    {
      match: "Combo cham soc da",
      title: "Combo chăm sóc da",
      subtitle: "Mua 2 tặng 1 - Kem chống nắng",
    },
  ];

  for (const u of updates) {
    const { error } = await supabase
      .from("banners")
      .update({ title: u.title, subtitle: u.subtitle })
      .eq("title", u.match);
    if (error) console.log(`Update error for ${u.match}:`, error.message);
    else console.log(`✅ Updated: ${u.title}`);
  }

  // Final check
  const { data: check } = await supabase
    .from("banners")
    .select("title,subtitle,position,sort_order")
    .order("position")
    .order("sort_order");
  console.log("\n=== FINAL STATE ===");
  check?.forEach((b) =>
    console.log(
      `  [${b.position}] #${b.sort_order} ${b.title} — ${b.subtitle}`,
    ),
  );
}
fix();
