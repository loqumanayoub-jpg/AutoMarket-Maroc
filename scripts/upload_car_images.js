const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

(async function(){
  try {
    const supJsPath = path.resolve('C:/AutoMarket Maroc/🌐 Frontend/js/supabase.js');
    const supJs = fs.readFileSync(supJsPath, 'utf8');
    const urlMatch = supJs.match(/window\.SUPABASE_URL\s*=\s*'([^']+)'/);
    const keyMatch = supJs.match(/window\.SUPABASE_ANON_KEY\s*=\s*'([^']+)'/);
    if (!urlMatch || !keyMatch) {
      console.error(JSON.stringify({ fatal: 'Could not read SUPABASE_URL or SUPABASE_ANON_KEY from supabase.js' }));
      process.exit(1);
    }
    const url = urlMatch[1];
    const key = keyMatch[1];

    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });

    const root = 'C:/AutoMarket Maroc/🌐 Frontend/images/cars';
    const files = [
      'car1.webp','car2.webp','car3.webp','car4.webp','car5.webp','car6.webp','car7.webp','car8.webp','car9.webp','car10.webp','car11.webp','car12.webp','car13.webp','car14.webp','car15.webp'
    ];

    const results = [];

    for (const name of files) {
      const full = path.join(root, name);
      const bucketPath = `cars/${name}`;
      if (!fs.existsSync(full)) {
        results.push({ file: name, path: bucketPath, success: false, error: 'Local file not found' });
        continue;
      }
      try {
        const fileBuffer = fs.readFileSync(full);
        const { data, error } = await supabase.storage.from('car-images').upload(bucketPath, fileBuffer, { upsert: true, contentType: 'image/webp', cacheControl: '3600' });
        if (error) {
          results.push({ file: name, path: bucketPath, success: false, error: error.message });
          continue;
        }
        const { data: publicUrlData } = await supabase.storage.from('car-images').getPublicUrl(bucketPath);
        results.push({ file: name, path: bucketPath, success: true, publicUrl: publicUrlData?.publicUrl || null });
      } catch (err) {
        results.push({ file: name, path: bucketPath, success: false, error: err && err.message ? err.message : String(err) });
      }
    }

    console.log(JSON.stringify({ bucket: 'car-images', results }, null, 2));
  } catch (err) {
    console.error(JSON.stringify({ fatal: err && err.message ? err.message : String(err) }));
    process.exit(1);
  }
})();
