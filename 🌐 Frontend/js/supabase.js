const SUPABASE_URL = "https://kdnwyemjbryypyfugkia.supabase.co";
const SUPABASE_ANON_KEY = "******";

async function getCarsFromSupabase() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/cars?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,
      Accept: 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  return await response.json();
}
\n// Upload a single file to the 'car-images' bucket and return its public URL\nasync function uploadImageToStorage(file, filename) {\n  if (!file || !filename) throw new Error('File and filename required');\n\n  const uploadUrl = ${SUPABASE_URL}/storage/v1/object/car-images/;\n\n  const res = await fetch(uploadUrl, {\n    method: 'PUT',\n    headers: {\n      apikey: SUPABASE_ANON_KEY,\n      Authorization: 'Bearer ' + SUPABASE_ANON_KEY,\n      'x-upsert': 'false',\n      'Content-Type': file.type || 'application/octet-stream'\n    },\n    body: file\n  });\n\n  if (!res.ok) {\n    const text = await res.text().catch(() => '');\n    throw new Error(Upload failed:  );\n  }\n\n  // Public URL (assuming bucket is public)
  return ${SUPABASE_URL}/storage/v1/object/public/car-images/;\n}\n
