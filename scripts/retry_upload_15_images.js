const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

(async function () {
  try {
    const supJsPath = 'C:/AutoMarket Maroc/🌐 Frontend/js/supabase.js';
    const supJs = fs.readFileSync(supJsPath, 'utf8');
    const url = (supJs.match(/window\.SUPABASE_URL\s*=\s*'([^']+)'/) || [])[1];
    const key = (supJs.match(/window\.SUPABASE_ANON_KEY\s*=\s*'([^']+)'/) || [])[1];
    if (!url || !key) {
      console.log(JSON.stringify({ successCount: 0, failureCount: 15, results: [], fatal: 'Missing Supabase URL or anon key in frontend configuration' }, null, 2));
      process.exit(1);
    }

    const files = [
      'car1.webp','car2.webp','car3.webp','car4.webp','car5.webp','car6.webp','car7.webp','car8.webp','car9.webp','car10.webp','car11.webp','car12.webp','car13.webp','car14.webp','car15.webp'
    ];
    const root = 'C:/AutoMarket Maroc/🌐 Frontend/images/cars';
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });

    const results = [];
    for (const filename of files) {
      const storagePath = `cars/${filename}`;
      const fullPath = path.join(root, filename);
      if (!fs.existsSync(fullPath)) {
        results.push({ filename, storagePath, success: false, error: 'Local file missing', publicUrl: null });
        continue;
      }
      try {
        const fileBuffer = fs.readFileSync(fullPath);
        const { error } = await supabase.storage.from('car-images').upload(storagePath, fileBuffer, { upsert: true, contentType: 'image/webp', cacheControl: '3600' });
        if (error) {
          results.push({ filename, storagePath, success: false, error: error.message, publicUrl: null });
          continue;
        }
        const { data: publicUrlData } = supabase.storage.from('car-images').getPublicUrl(storagePath);
        results.push({ filename, storagePath, success: true, error: null, publicUrl: publicUrlData?.publicUrl || null });
      } catch (err) {
        results.push({ filename, storagePath, success: false, error: err && err.message ? err.message : String(err), publicUrl: null });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    console.log(JSON.stringify({ successCount, failureCount, results }, null, 2));
  } catch (err) {
    console.log(JSON.stringify({ successCount: 0, failureCount: 15, results: [], fatal: err && err.message ? err.message : String(err) }, null, 2));
    process.exit(1);
  }
})();
