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
