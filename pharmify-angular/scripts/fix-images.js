/**
 * Fix the 5 products that had 404 errors
 */
const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const supabase = createClient(
  "https://jfygysihtplarmfeatdc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeWd5c2lodHBsYXJtZmVhdGRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0OTg0OTQsImV4cCI6MjA5MDA3NDQ5NH0.4IqYvJjsrgl3EWlTUVKH8P3IWPowoCw8iLsFj8IL2g4",
);

const BUCKET = "product-images";
const FIXES = {
  "ibuprofen-400mg":
    "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop&q=80",
  "amoxicillin-500mg":
    "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&h=500&fit=crop&q=80",
  "vitamin-c-1000mg-dhg":
    "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=500&h=500&fit=crop&q=80",
  "khau-trang-y-te-4-lop":
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop&q=80",
  "nhiet-ke-dien-tu-omron":
    "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&h=500&fit=crop&q=80",
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
          )
            return download(res.headers.location).then(resolve).catch(reject);
          if (res.statusCode !== 200)
            return reject(new Error(`HTTP ${res.statusCode}`));
          const c = [];
          res.on("data", (d) => c.push(d));
          res.on("end", () => resolve(Buffer.concat(c)));
        },
      )
      .on("error", reject);
  });
}

async function main() {
  console.log("Fixing 5 remaining products...\n");
  for (const [slug, url] of Object.entries(FIXES)) {
    try {
      process.stdout.write(`${slug}: downloading...`);
      const buf = await download(url);
      console.log(` ${(buf.length / 1024).toFixed(0)}KB`);

      process.stdout.write("  uploading...");
      const { error: ue } = await supabase.storage
        .from(BUCKET)
        .upload(`products/${slug}.jpg`, buf, {
          contentType: "image/jpeg",
          upsert: true,
        });
      if (ue) throw ue;

      const { data } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(`products/${slug}.jpg`);
      process.stdout.write(" updating DB...");
      const { error: re } = await supabase.rpc("fn_update_product_image", {
        p_slug: slug,
        p_image_url: data.publicUrl,
      });
      if (re) throw re;
      console.log(` ✅`);
    } catch (e) {
      console.log(` ❌ ${e.message}`);
    }
  }

  console.log("\n--- Verify ---");
  const { data } = await supabase
    .from("v_product_catalog")
    .select("name,image_url");
  const nulls = data?.filter(
    (p) => !p.image_url || !p.image_url.includes("supabase"),
  );
  if (nulls?.length) {
    console.log(`⚠️  ${nulls.length} products still missing Storage URLs:`);
    nulls.forEach((p) =>
      console.log(`  - ${p.name}: ${p.image_url || "NULL"}`),
    );
  } else {
    console.log(`✅ All ${data?.length} products have Supabase Storage URLs!`);
  }
}
main();
