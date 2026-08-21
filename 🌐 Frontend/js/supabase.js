const SUPABASE_URL = "https://kdnwyemjbryypyfugkia.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtkbnd5ZW1qYnJ5eXB5ZnVna2lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyMjg4NjEsImV4cCI6MjEwMjgwNDg2MX0.s98Fv7HOePzcsqH-vxqHY1BDd6IGNpgspf1mg9ICdSg";

async function getCarsFromSupabase() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/cars?select=*`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status}`);
  }

  return await response.json();
}