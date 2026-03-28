/**
 * Pharmify — Upload images to Supabase Storage & update DB
 *
 * Downloads pharmaceutical images from Unsplash,
 * uploads them to the "product-images" Storage bucket,
 * then updates products.image_url with Storage public URLs.
 *
 * Usage: node scripts/seed-images.js
 */
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const SUPABASE_URL = "https://jfygysihtplarmfeatdc.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeWd5c2lodHBsYXJtZmVhdGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTg0OTQsImV4cCI6MjA5MDA3NDQ5NH0.4IqYvJjsrgl3EWlTUVKH8P3IWPowoCw8iLsFj8IL2g4";
const BUCKET = "product-images";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Pharma-themed Unsplash images
const SLUG_TO_IMAGE = {
  "paracetamol-500mg":
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&q=80",
  "ibuprofen-400mg":
    "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&h=500&fit=crop&q=80",
  "efferalgan-500mg":
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop&q=80",
  "centrum-silver":
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&h=500&fit=crop&q=80",
  "vitamin-c-1000mg-dhg":
    "https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=500&h=500&fit=crop&q=80",
  "calcium-d-600mg":
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&h=500&fit=crop&q=80",
  "tiffy-dey":
    "https://images.unsplash.com/photo-1573883431205-98b5f10aaedb?w=500&h=500&fit=crop&q=80",
  "prospan-syrup":
    "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&h=500&fit=crop&q=80",
  "thuoc-nho-mui-otrivin":
    "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&h=500&fit=crop&q=80",
  smecta:
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&h=500&fit=crop&q=80",
  "gaviscon-double-action":
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&h=500&fit=crop&q=80",
  enterogermina:
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&h=500&fit=crop&q=80",
  "kem-chong-nang-lrp":
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop&q=80",
  "gel-tri-mun-benzac":
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&h=500&fit=crop&q=80",
  "sua-nan-optipro-1":
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=500&fit=crop&q=80",
  "bim-pampers-nb":
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&h=500&fit=crop&q=80",
  "nhiet-ke-dien-tu-omron":
    "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=500&h=500&fit=crop&q=80",
  "khau-trang-y-te-4-lop":
    "https://images.unsplash.com/photo-1559757175-7cb057fba93c?w=500&h=500&fit=crop&q=80",
  "amoxicillin-500mg":
    "https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&h=500&fit=crop&q=80",
  "augmentin-625mg":
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop&q=80",
  "thuoc-nho-mat-rohto":
    "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&h=500&fit=crop&q=80",
};

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 15000 },
        (res) => {
          if (
            res.statusCode >= 300 &&
            res.statusCode < 400 &&
            res.headers.location
          ) {
            return download(res.headers.location).then(resolve).catch(reject);
          }
          if (res.statusCode !== 200)
            return reject(new Error(`HTTP ${res.statusCode}`));
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        },
      )
      .on("error", reject)
      .on("timeout", () => reject(new Error("Timeout")));
  });
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  Pharmify — Upload to Supabase Storage");
  console.log("═══════════════════════════════════════════════\n");

  // Fetch products
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug");
  if (!products) {
    console.log("❌ No products found");
    return;
  }
  console.log(`📋 Found ${products.length} products\n`);

  const fallbacks = Object.values(SLUG_TO_IMAGE);
  let success = 0,
    failed = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const imageUrl = SLUG_TO_IMAGE[p.slug] || fallbacks[i % fallbacks.length];
    console.log(`[${i + 1}/${products.length}] ${p.name}`);

    try {
      // 1. Download
      process.stdout.write("   ⬇️  Downloading...");
      const buffer = await download(imageUrl);
      console.log(` ${(buffer.length / 1024).toFixed(0)}KB`);

      // 2. Upload to Storage
      process.stdout.write("   ⬆️  Uploading to Storage...");
      const filePath = `products/${p.slug}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, buffer, { contentType: "image/jpeg", upsert: true });

      if (uploadErr) throw uploadErr;

      // 3. Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;
      console.log(" ✅");

      // 4. Update DB via RPC (bypasses RLS)
      process.stdout.write("   💾 Updating DB...");
      const { error: rpcErr } = await supabase.rpc("fn_update_product_image", {
        p_slug: p.slug,
        p_image_url: publicUrl,
      });
      if (rpcErr) throw rpcErr;
      console.log(` ✅ → ${publicUrl.substring(0, 70)}...`);
      success++;
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      failed++;
    }
    console.log("");
  }

  // Verify
  console.log("═══════════════════════════════════════════════");
  console.log(`  ✅ ${success} uploaded  |  ❌ ${failed} failed`);
  console.log("═══════════════════════════════════════════════\n");

  console.log("--- Verification ---");
  const { data: check } = await supabase
    .from("v_product_catalog")
    .select("name, image_url")
    .limit(5);
  check?.forEach((p) =>
    console.log(`  ${p.name}: ${p.image_url?.substring(0, 80)}`),
  );
}

main().catch(console.error);
